import type { BillingTier } from "@/types/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL?.trim();

export type BillingLimits = {
  maxPortfolios: number;
  themes: string[];
  customDomain: boolean;
  analytics: boolean;
  showPoweredBy: boolean;
};

export type BillingStatus = {
  billingTier: BillingTier;
  billingMode: "strict" | "freemium";
  portfolioCount: number;
  limits: BillingLimits;
};

export type PlanCopyBlock = {
  label?: string;
  priceHint?: string;
  tagline?: string;
  portfolios?: number | string;
  includes?: string[];
  restrictions?: string[];
  extras?: string[];
};

export type BillingPlans = {
  mode: "strict" | "freemium";
  currency: string;
  paymentProvider: "stripe" | "paypal" | "manual";
  paypalCurrency?: string;
  checkoutAvailable: boolean;
  manualConfigured: boolean;
  basic: PlanCopyBlock & { themes?: string; customDomain?: boolean; analytics?: boolean; branding?: boolean };
  premium: PlanCopyBlock & { themes?: string; customDomain?: boolean; analytics?: boolean; branding?: boolean };
  free: PlanCopyBlock & { themes?: string; customDomain?: boolean; analytics?: boolean; branding?: boolean };
  stripeConfigured: boolean;
  paypalConfigured: boolean;
};

export type ManualPaymentInfo = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  reference: string;
  note: string;
  contactEmail: string;
};

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

export const fetchBillingStatus = async (): Promise<BillingStatus | null> => {
  if (!API_BASE) return null;
  const res = await fetch(`${API_BASE}/billing/status`, { credentials: "include" });
  if (!res.ok) return null;
  return readJson<BillingStatus>(res);
};

export const fetchBillingPlans = async (): Promise<BillingPlans | null> => {
  if (!API_BASE) return null;
  const res = await fetch(`${API_BASE}/billing/plans`);
  if (!res.ok) return null;
  return readJson<BillingPlans>(res);
};

export const startCheckout = async (product: "basic" | "premium"): Promise<{ url?: string; error?: string }> => {
  if (!API_BASE) return { error: "No API" };
  try {
    const res = await fetch(`${API_BASE}/billing/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ product }),
    });
    const data = await readJson<{ url?: string; message?: string }>(res);
    if (!res.ok) {
      if (res.status === 401) return { error: "Please sign in again and retry checkout." };
      if (res.status >= 500) return { error: "Payment service is temporarily unavailable. Try again shortly." };
      return { error: data.message ?? "Checkout failed" };
    }
    return { url: data.url };
  } catch {
    return { error: "Could not reach billing server. Check connection and try again." };
  }
};

export const devSetBillingTier = async (tier: BillingTier): Promise<boolean> => {
  if (!API_BASE) return false;
  const res = await fetch(`${API_BASE}/billing/dev-set-tier`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ tier }),
  });
  return res.ok;
};

export const fetchManualPaymentInfo = async (): Promise<ManualPaymentInfo | null> => {
  if (!API_BASE) return null;
  const res = await fetch(`${API_BASE}/billing/manual`, { credentials: "include" });
  if (!res.ok) return null;
  return readJson<ManualPaymentInfo>(res);
};

export const capturePayPalPayment = async (orderId: string): Promise<{ ok: boolean; message?: string }> => {
  if (!API_BASE) return { ok: false, message: "No API" };
  const res = await fetch(`${API_BASE}/billing/paypal/capture`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ orderId }),
  });
  const data = await readJson<{ message?: string; billingTier?: string }>(res);
  if (!res.ok) return { ok: false, message: data.message ?? "Capture failed" };
  return { ok: true };
};
