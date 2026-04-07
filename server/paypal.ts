/**
 * PayPal Orders v2 — alternative where Stripe is unavailable (e.g. Namibia).
 * Uses REST + fetch (no SDK).
 */
import type { Pool } from "pg";

function paypalBase(): string {
  return process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function clientOrigin(): string {
  const raw = process.env.CLIENT_ORIGIN ?? "http://localhost:8080";
  return raw.split(",")[0]?.trim() || "http://localhost:8080";
}

async function getAccessToken(): Promise<string | null> {
  const id = process.env.PAYPAL_CLIENT_ID?.trim();
  const secret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  if (!id || !secret) return null;
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

export function paypalConfigured(): boolean {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID?.trim() &&
      process.env.PAYPAL_CLIENT_SECRET?.trim() &&
      process.env.PAYPAL_AMOUNT_BASIC?.trim() &&
      process.env.PAYPAL_AMOUNT_PREMIUM?.trim(),
  );
}

export async function createPayPalCheckoutUrl(
  userId: string,
  product: "basic" | "premium",
): Promise<{ url: string } | { error: string; status: number }> {
  const access = await getAccessToken();
  if (!access) {
    return { error: "PayPal is not configured (client id, secret, amounts).", status: 503 };
  }

  const amount =
    product === "premium"
      ? process.env.PAYPAL_AMOUNT_PREMIUM!.trim()
      : process.env.PAYPAL_AMOUNT_BASIC!.trim();
  const currency = (process.env.PAYPAL_CURRENCY ?? "USD").trim();

  const origin = clientOrigin();
  const customId = `${userId}|${product}`;

  const res = await fetch(`${paypalBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: currency, value: amount },
          custom_id: customId,
          description: `PortfolioForge ${product === "premium" ? "Premium" : "Basic"}`,
        },
      ],
      application_context: {
        return_url: `${origin}/billing?paypal=1`,
        cancel_url: `${origin}/billing?canceled=1`,
        user_action: "PAY_NOW",
      },
    }),
  });

  const order = (await res.json()) as {
    id?: string;
    links?: { href: string; rel: string }[];
    message?: string;
  };

  if (!res.ok) {
    console.error("PayPal create order", order);
    return { error: order.message ?? "Could not start PayPal checkout.", status: 502 };
  }

  const approve = order.links?.find((l) => l.rel === "approve");
  if (!approve?.href) {
    return { error: "PayPal did not return an approval URL.", status: 500 };
  }

  return { url: approve.href };
}

async function getOrder(orderId: string, access: string): Promise<{
  status?: string;
  purchase_units?: { custom_id?: string }[];
}> {
  const res = await fetch(`${paypalBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Bearer ${access}` },
  });
  return (await res.json()) as { status?: string; purchase_units?: { custom_id?: string }[] };
}

export async function capturePayPalOrder(
  pool: Pool,
  userId: string,
  orderId: string,
): Promise<{ ok: true; tier: "basic" | "premium" } | { error: string; status: number }> {
  const access = await getAccessToken();
  if (!access) {
    return { error: "PayPal not configured.", status: 503 };
  }

  const before = await getOrder(orderId, access);
  if (before.status !== "APPROVED") {
    return { error: "Order is not ready to capture (open the PayPal link again).", status: 400 };
  }

  const customId = before.purchase_units?.[0]?.custom_id ?? "";
  const [uid, tierRaw] = customId.split("|");
  if (uid !== userId) {
    return { error: "Order does not match your account.", status: 403 };
  }

  const res = await fetch(`${paypalBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access}`,
      "Content-Type": "application/json",
    },
  });

  const data = (await res.json()) as {
    status?: string;
    message?: string;
  };

  if (!res.ok) {
    console.error("PayPal capture", data);
    return { error: data.message ?? "Capture failed.", status: 502 };
  }

  if (data.status !== "COMPLETED") {
    return { error: "Payment not completed.", status: 400 };
  }

  const tier: "basic" | "premium" = tierRaw === "premium" ? "premium" : "basic";
  await pool.query(`UPDATE users SET billing_tier = $2::text WHERE id = $1::uuid`, [userId, tier]);

  return { ok: true, tier };
}
