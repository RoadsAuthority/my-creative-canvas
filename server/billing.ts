/**
 * Billing tiers, limits, Stripe / PayPal / manual payment.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import type { Pool } from "pg";
import Stripe from "stripe";
import { createPayPalCheckoutUrl, paypalConfigured } from "./paypal.js";

export type BillingTier = "free" | "basic" | "premium";

export function normalizeTier(raw: string | null | undefined): BillingTier {
  const t = (raw ?? "free").toLowerCase();
  if (t === "basic" || t === "premium") return t;
  return "free";
}

export function getBillingMode(): "strict" | "freemium" {
  const m = (process.env.BILLING_MODE ?? "freemium").toLowerCase().trim();
  return m === "strict" ? "strict" : "freemium";
}

type PaymentProvider = "stripe" | "paypal" | "manual" | "lemonsqueezy";

export function maxPortfoliosForTier(tier: BillingTier): number {
  if (tier === "premium") return 50;
  if (tier === "basic") return 5;
  return 1;
}

export function themeAllowedForTier(tier: BillingTier, theme: string): boolean {
  if (tier === "free") return theme === "glass";
  return [
    "glass",
    "minimal",
    "bold",
    "vintage",
    "vintageRefined",
    "vintageEditorial",
    "devMode",
    "scrollStory",
    "atrium",
    "mustard",
    "evergreen",
    "midnightGold",
  ].includes(theme);
}

export function customDomainAllowedForTier(tier: BillingTier): boolean {
  return tier === "premium";
}

export function analyticsAllowedForTier(tier: BillingTier): boolean {
  return tier === "basic" || tier === "premium";
}

export function showPoweredByForTier(tier: BillingTier): boolean {
  return tier === "free";
}

export async function getUserTier(pool: Pool, userId: string): Promise<BillingTier> {
  const { rows } = await pool.query<{ billing_tier: string }>(
    `SELECT billing_tier FROM users WHERE id = $1`,
    [userId],
  );
  return normalizeTier(rows[0]?.billing_tier);
}

export async function countUserPortfolios(pool: Pool, userId: string): Promise<number> {
  const { rows } = await pool.query<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM portfolios WHERE user_id = $1`,
    [userId],
  );
  return Number(rows[0]?.c ?? 0);
}

export type PublishGate =
  | { ok: true }
  | { ok: false; status: 402; code: string; message: string };

export function evaluatePublishGate(options: {
  mode: "strict" | "freemium";
  tier: BillingTier;
  isNewPortfolio: boolean;
  portfolioCount: number;
}): PublishGate {
  const { mode, tier, isNewPortfolio, portfolioCount } = options;
  const maxP = maxPortfoliosForTier(tier);

  if (mode === "strict" && tier === "free" && isNewPortfolio) {
    return {
      ok: false,
      status: 402,
      code: "PAYMENT_REQUIRED",
      message: "Purchase Basic or Premium to publish your portfolio.",
    };
  }

  if (isNewPortfolio && portfolioCount >= maxP) {
    return {
      ok: false,
      status: 402,
      code: "PORTFOLIO_LIMIT",
      message:
        tier === "free"
          ? "Free plan includes one portfolio. Upgrade to add more."
          : "You have reached your plan’s portfolio limit. Upgrade to Premium for much higher limits.",
    };
  }

  return { ok: true };
}

export function sanitizeUpsertForTier(
  tier: BillingTier,
  themeIn: string | undefined,
  customDomainIn: string | undefined,
): { theme: string; customDomain: string } {
  const theme = themeAllowedForTier(tier, themeIn ?? "glass") ? (themeIn ?? "glass") : "glass";
  const customDomain = customDomainAllowedForTier(tier) ? (customDomainIn ?? "").trim() : "";
  return { theme, customDomain };
}

function stripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key);
}

function stripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_PRICE_BASIC?.trim() &&
      process.env.STRIPE_PRICE_PREMIUM?.trim(),
  );
}

function lemonSqueezyConfigured(): boolean {
  return Boolean(
    process.env.LEMONSQUEEZY_CHECKOUT_BASIC_URL?.trim() &&
      process.env.LEMONSQUEEZY_CHECKOUT_PREMIUM_URL?.trim() &&
      process.env.LEMONSQUEEZY_WEBHOOK_SECRET?.trim(),
  );
}

function createLemonSqueezyCheckoutUrl(
  userId: string,
  email: string,
  product: "basic" | "premium",
): { url: string } | { error: string; status: number } {
  const baseUrl =
    product === "premium"
      ? process.env.LEMONSQUEEZY_CHECKOUT_PREMIUM_URL?.trim()
      : process.env.LEMONSQUEEZY_CHECKOUT_BASIC_URL?.trim();
  if (!baseUrl) {
    return { error: "Lemon Squeezy checkout URL is not configured.", status: 503 };
  }
  const tier = product === "premium" ? "premium" : "basic";
  const url = new URL(baseUrl);
  url.searchParams.set("checkout[email]", email);
  url.searchParams.set("checkout[custom][userId]", userId);
  url.searchParams.set("checkout[custom][tier]", tier);
  return { url: url.toString() };
}

/** Stripe (cards), PayPal, Lemon Squeezy, or manual EFT. */
export function getPaymentProvider(): PaymentProvider {
  const explicit = process.env.PAYMENT_PROVIDER?.trim().toLowerCase();
  if (
    explicit === "stripe" ||
    explicit === "paypal" ||
    explicit === "manual" ||
    explicit === "lemonsqueezy"
  ) {
    return explicit;
  }
  if (stripeConfigured()) return "stripe";
  if (lemonSqueezyConfigured()) return "lemonsqueezy";
  if (paypalConfigured()) return "paypal";
  return "manual";
}

export function getManualPaymentInfo(userId: string) {
  const compact = userId.replace(/-/g, "");
  return {
    bankName: process.env.BILLING_BANK_NAME?.trim() ?? "",
    accountName: process.env.BILLING_ACCOUNT_NAME?.trim() ?? "",
    accountNumber: process.env.BILLING_ACCOUNT_NUMBER?.trim() ?? "",
    branchCode: process.env.BILLING_BRANCH?.trim() ?? "",
    reference: `PF-${compact.slice(0, 10)}`,
    note: process.env.BILLING_MANUAL_NOTE?.trim() ?? "",
    contactEmail: process.env.BILLING_CONTACT_EMAIL?.trim() ?? "",
  };
}

function clientOrigin(): string {
  const raw = process.env.CLIENT_ORIGIN ?? "http://localhost:8080";
  return raw.split(",")[0]?.trim() || "http://localhost:8080";
}

export async function createCheckoutSession(
  _pool: Pool,
  userId: string,
  email: string,
  product: "basic" | "premium",
): Promise<{ url: string } | { error: string; status: number }> {
  const provider = getPaymentProvider();

  if (provider === "manual") {
    return {
      error: "Online checkout is not enabled — use bank transfer on the billing page.",
      status: 400,
    };
  }

  if (provider === "paypal") {
    return createPayPalCheckoutUrl(userId, product);
  }
  if (provider === "lemonsqueezy") {
    return createLemonSqueezyCheckoutUrl(userId, email, product);
  }

  const s = stripe();
  const priceId =
    product === "premium"
      ? process.env.STRIPE_PRICE_PREMIUM?.trim()
      : process.env.STRIPE_PRICE_BASIC?.trim();
  if (!s || !priceId) {
    return { error: "Stripe is not fully configured (secret key + price IDs).", status: 503 };
  }

  const origin = clientOrigin();
  const session = await s.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/billing?paid=1`,
    cancel_url: `${origin}/billing?canceled=1`,
    customer_email: email,
    client_reference_id: userId,
    metadata: { userId, tier: product === "premium" ? "premium" : "basic" },
  });

  if (!session.url) {
    return { error: "Could not start checkout.", status: 500 };
  }

  return { url: session.url };
}

export async function handleLemonSqueezyWebhook(
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET?.trim();
  if (!secret) {
    res.status(503).send("Webhook not configured");
    return;
  }
  const signature = req.headers["x-signature"];
  if (!signature || typeof signature !== "string") {
    res.status(400).send("Missing x-signature");
    return;
  }
  const body = req.body as Buffer;
  const digest = createHmac("sha256", secret).update(body).digest("hex");
  const sigBuffer = Buffer.from(signature, "hex");
  const digestBuffer = Buffer.from(digest, "hex");
  if (
    sigBuffer.length !== digestBuffer.length ||
    !timingSafeEqual(sigBuffer, digestBuffer)
  ) {
    res.status(401).send("Invalid signature");
    return;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body.toString("utf8"));
  } catch {
    res.status(400).send("Invalid payload");
    return;
  }

  const obj = payload as {
    meta?: { event_name?: string; custom_data?: { userId?: string; tier?: string } };
  };
  const eventName = obj.meta?.event_name ?? "";
  const userId = obj.meta?.custom_data?.userId?.trim();
  const tier = normalizeTier(obj.meta?.custom_data?.tier);
  if (
    (eventName === "order_created" || eventName === "subscription_created") &&
    userId &&
    (tier === "basic" || tier === "premium")
  ) {
    await pool.query(`UPDATE users SET billing_tier = $2::text WHERE id = $1::uuid`, [userId, tier]);
  }
  res.json({ received: true });
}

export async function handleStripeWebhook(req: Request, res: Response, pool: Pool): Promise<void> {
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const s = stripe();
  if (!s || !whSecret) {
    res.status(503).send("Webhook not configured");
    return;
  }

  const sig = req.headers["stripe-signature"];
  if (!sig || typeof sig !== "string") {
    res.status(400).send("Missing stripe-signature");
    return;
  }

  let event: Stripe.Event;
  try {
    event = s.webhooks.constructEvent(req.body as Buffer, sig, whSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid payload";
    res.status(400).send(`Webhook Error: ${msg}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const tierRaw = session.metadata?.tier;
    const userId = session.metadata?.userId ?? session.client_reference_id;
    const tier = tierRaw === "premium" ? "premium" : tierRaw === "basic" ? "basic" : null;
    const cust =
      typeof session.customer === "string"
        ? session.customer
        : session.customer && typeof session.customer === "object" && "id" in session.customer
          ? (session.customer as { id: string }).id
          : null;
    if (userId && tier) {
      await pool.query(
        `UPDATE users SET billing_tier = $2::text,
          stripe_customer_id = COALESCE(NULLIF(TRIM(stripe_customer_id), ''), $3)
         WHERE id = $1::uuid`,
        [userId, tier, cust],
      );
    }
  }

  res.json({ received: true });
}

export function billingPlansPayload() {
  const provider = getPaymentProvider();
  const manualReady = Boolean(
    process.env.BILLING_BANK_NAME?.trim() ||
      process.env.BILLING_ACCOUNT_NUMBER?.trim() ||
      process.env.BILLING_CONTACT_EMAIL?.trim(),
  );

  const checkoutAvailable =
    provider === "paypal"
      ? paypalConfigured()
      : provider === "stripe"
        ? stripeConfigured()
        : provider === "lemonsqueezy"
          ? lemonSqueezyConfigured()
          : false;

  return {
    mode: getBillingMode(),
    currency: "USD",
    paymentProvider: provider,
    paypalCurrency: process.env.PAYPAL_CURRENCY ?? "USD",
    checkoutAvailable,
    manualConfigured: provider === "manual" ? manualReady : true,
    basic: {
      label: process.env.BILLING_LABEL_BASIC ?? "Basic ($19)",
      priceHint: "USD $19 (once-off)",
      tagline:
        process.env.BILLING_TAGLINE_BASIC ??
        "One-time investment for professionals who need stronger visibility.",
      portfolios: maxPortfoliosForTier("basic"),
      themes: "All themes",
      customDomain: false,
      analytics: true,
      branding: false,
      includes: [
        "Up to 5 portfolios",
        "Every portfolio visual theme included",
        "Basic analytics (views & project clicks)",
        "Unlimited edits & republish",
        "No “Made with” branding",
        "One-time payment",
      ],
      restrictions: [
        "No custom domain",
      ],
    },
    premium: {
      label: process.env.BILLING_LABEL_PREMIUM ?? "Premium ($49)",
      priceHint: "USD $49 (once-off)",
      tagline:
        process.env.BILLING_TAGLINE_PREMIUM ??
        "The last portfolio fee you pay: one-time, long-term professional presence.",
      portfolios: maxPortfoliosForTier("premium"),
      themes: "All themes",
      customDomain: true,
      analytics: true,
      branding: false,
      includes: ["Everything in Basic"],
      extras: [
        "Custom domain (DNS when you are ready)",
        "Advanced analytics",
        "Up to 50 portfolios",
        "One-time payment",
      ],
    },
    free: {
      label: "Free",
      tagline: "Try the editor and one public portfolio (freemium).",
      portfolios: maxPortfoliosForTier("free"),
      themes: "Glass template only",
      customDomain: false,
      analytics: false,
      branding: true,
      includes: [
        "1 live portfolio",
        "Glass template only (full theme library on Basic or Premium)",
        "Public URL & print/PDF export",
        "Social links on your page",
        "Path domain: pf.me/user style URL",
      ],
      restrictions: ["No custom domain", "No dashboard analytics", "“Made with PortfolioForge” on your page"],
    },
    stripeConfigured: stripeConfigured(),
    paypalConfigured: paypalConfigured(),
    lemonSqueezyConfigured: lemonSqueezyConfigured(),
  };
}
