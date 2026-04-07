import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Check, Loader2, Minus, Sparkles } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/contexts/AuthContext";
import {
  capturePayPalPayment,
  devSetBillingTier,
  fetchBillingPlans,
  fetchBillingStatus,
  fetchManualPaymentInfo,
  startCheckout,
  type BillingPlans,
  type BillingStatus,
  type ManualPaymentInfo,
} from "@/lib/billing-service";
import { basicTierCopy, freeTierCopy, premiumTierCopy } from "@/lib/pricing-data";
import type { BillingTier } from "@/types/auth";

const hasApi = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());
const devBypass = import.meta.env.DEV && import.meta.env.VITE_BILLING_DEV_BYPASS === "true";

const Billing = () => {
  const { user, loading, refresh } = useAuth();
  const [params] = useSearchParams();
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [plans, setPlans] = useState<BillingPlans | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<"basic" | "premium" | null>(null);
  const [manualInfo, setManualInfo] = useState<ManualPaymentInfo | null>(null);
  const paypalCaptured = useRef(false);

  useEffect(() => {
    if (params.get("paid") === "1") {
      toast.success("Payment received — your plan will update in a moment.");
      refresh();
    }
    if (params.get("canceled") === "1") {
      toast.message("Checkout canceled.");
    }
  }, [params, refresh]);

  useEffect(() => {
    if (paypalCaptured.current) return;
    if (params.get("paypal") !== "1") return;
    const token = params.get("token");
    if (!token) return;
    paypalCaptured.current = true;
    capturePayPalPayment(token).then((r) => {
      if (r.ok) {
        toast.success("PayPal payment successful — your plan is updated.");
        refresh();
        window.history.replaceState({}, "", "/billing");
      } else {
        toast.error(r.message ?? "Could not confirm PayPal payment.");
        paypalCaptured.current = false;
      }
    });
  }, [params, refresh]);

  useEffect(() => {
    if (!hasApi || !user) {
      setLoadingData(false);
      return;
    }
    Promise.all([fetchBillingStatus(), fetchBillingPlans()])
      .then(async ([s, p]) => {
        setStatus(s);
        setPlans(p);
        if (p?.paymentProvider === "manual") {
          const m = await fetchManualPaymentInfo();
          setManualInfo(m);
        }
      })
      .finally(() => setLoadingData(false));
  }, [user]);

  const onCheckout = async (product: "basic" | "premium") => {
    setCheckoutLoading(product);
    const { url, error } = await startCheckout(product);
    setCheckoutLoading(null);
    if (error) {
      toast.error(error);
      return;
    }
    if (url) window.location.href = url;
  };

  const onDevTier = async (tier: BillingTier) => {
    const ok = await devSetBillingTier(tier);
    if (ok) {
      toast.success(`Tier set to ${tier}`);
      refresh();
      const s = await fetchBillingStatus();
      setStatus(s);
    } else {
      toast.error("Dev bypass not enabled on server (BILLING_DEV_BYPASS=true).");
    }
  };

  if (!hasApi) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="container flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <p className="text-muted-foreground">Billing runs when the API is connected.</p>
          <Link to="/app" className="mt-6 text-primary underline">
            Dashboard
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="container flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-semibold">Sign in to manage your plan</h1>
          <Link to="/auth" className="glass-pill mt-6 rounded-full px-6 py-3 font-medium">
            Sign in
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const tier = status?.billingTier ?? user.billingTier ?? "free";
  const mode = status?.billingMode ?? plans?.mode ?? "freemium";
  const provider = plans?.paymentProvider ?? "manual";
  const checkoutOk = plans?.checkoutAvailable ?? false;

  const basicIncludes = plans?.basic?.includes?.length ? plans.basic.includes : basicTierCopy.includes;
  const basicRestrictions = plans?.basic?.restrictions?.length ? plans.basic.restrictions : basicTierCopy.restrictions ?? [];
  const premiumIncludes = plans?.premium?.includes?.length ? plans.premium.includes : premiumTierCopy.includes;
  const premiumExtras = plans?.premium?.extras?.length ? plans.premium.extras : premiumTierCopy.extras ?? [];
  const freeIncludes = plans?.free?.includes?.length ? plans.free.includes : freeTierCopy.includes;
  const freeRestrictions = plans?.free?.restrictions?.length ? plans.free.restrictions : freeTierCopy.restrictions ?? [];
  const payLabel =
    provider === "paypal" ? "Pay with PayPal" : provider === "stripe" ? "Pay with card" : "Pay online";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container max-w-4xl px-4 py-12 md:py-16">
        <div className="mb-10 flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary">Pricing</p>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Plans & billing</h1>
            <p className="mt-2 text-muted-foreground">
              Current plan: <span className="font-medium text-foreground capitalize">{tier}</span>
              {mode === "strict" ? (
                <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                  (Pay-to-publish mode — purchase a plan to go live)
                </span>
              ) : (
                <span className="ml-2 text-xs text-muted-foreground">
                  (Freemium — one free portfolio, upgrade for more)
                </span>
              )}
            </p>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              {provider === "manual" && (
                <>
                  <span className="font-medium text-foreground">Namibia / no Stripe:</span> use local bank transfer
                  (EFT). After payment, we activate your plan when we match your reference (or use the contact email
                  below).
                </>
              )}
              {provider === "paypal" && (
                <>
                  Online payments use PayPal. Amounts are charged in{" "}
                  <span className="font-mono">{plans?.paypalCurrency ?? "USD"}</span> — compare to your NAD price
                  before paying. Basic and Premium are one-time purchases (not recurring subscriptions).
                </>
              )}
              {provider === "stripe" && (
                <>Cards are processed securely by Stripe.</>
              )}
            </p>
          </div>
        </div>

        {provider === "manual" ? (
          <div className="mb-10 rounded-2xl border border-primary/25 bg-primary/5 p-6 md:p-8">
            <h2 className="font-display text-lg font-semibold">Pay by bank transfer (EFT)</h2>
            {manualInfo && (manualInfo.bankName || manualInfo.accountNumber) ? (
              <dl className="mt-4 grid gap-3 text-sm">
                {manualInfo.bankName ? (
                  <div>
                    <dt className="text-xs uppercase text-muted-foreground">Bank</dt>
                    <dd className="font-medium">{manualInfo.bankName}</dd>
                  </div>
                ) : null}
                {manualInfo.accountName ? (
                  <div>
                    <dt className="text-xs uppercase text-muted-foreground">Account name</dt>
                    <dd>{manualInfo.accountName}</dd>
                  </div>
                ) : null}
                {manualInfo.accountNumber ? (
                  <div>
                    <dt className="text-xs uppercase text-muted-foreground">Account number</dt>
                    <dd className="font-mono">{manualInfo.accountNumber}</dd>
                  </div>
                ) : null}
                {manualInfo.branchCode ? (
                  <div>
                    <dt className="text-xs uppercase text-muted-foreground">Branch</dt>
                    <dd>{manualInfo.branchCode}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs uppercase text-muted-foreground">Payment reference (required)</dt>
                  <dd className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-foreground">{manualInfo.reference}</span>
                    <button
                      type="button"
                      className="text-xs text-primary underline"
                      onClick={() => {
                        void navigator.clipboard.writeText(manualInfo.reference);
                        toast.message("Reference copied");
                      }}
                    >
                      Copy
                    </button>
                  </dd>
                </div>
                {manualInfo.note ? <p className="mt-2 text-muted-foreground">{manualInfo.note}</p> : null}
                {manualInfo.contactEmail ? (
                  <p className="mt-2">
                    <a href={`mailto:${manualInfo.contactEmail}`} className="text-primary underline">
                      {manualInfo.contactEmail}
                    </a>
                  </p>
                ) : null}
              </dl>
            ) : (
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                Set BILLING_BANK_NAME, BILLING_ACCOUNT_NUMBER, and BILLING_CONTACT_EMAIL in your server environment.
              </p>
            )}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass-frosted rounded-2xl border border-white/10 p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold">{plans?.basic.label ?? basicTierCopy.label}</h2>
            <p className="mt-1 text-2xl font-bold text-primary">{plans?.basic.priceHint ?? basicTierCopy.priceHint}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {plans?.basic.tagline ?? basicTierCopy.tagline}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {basicIncludes.map((line) => (
                <li key={line} className="flex gap-2">
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  {line}
                </li>
              ))}
              {basicRestrictions.map((line) => (
                <li key={line} className="flex gap-2 text-muted-foreground/85">
                  <Minus className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                  {line}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={
                !checkoutOk ||
                provider === "manual" ||
                checkoutLoading !== null ||
                tier === "premium"
              }
              onClick={() => onCheckout("basic")}
              className="glass-pill mt-6 w-full rounded-full py-3 font-semibold disabled:opacity-50"
            >
              {checkoutLoading === "basic" ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              ) : tier === "basic" ? (
                "Current plan"
              ) : tier === "premium" ? (
                "Included in Premium"
              ) : provider === "manual" ? (
                "Use EFT above"
              ) : (
                payLabel
              )}
            </button>
            {!checkoutOk && provider !== "manual" ? (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                Configure payment keys on the server (Stripe or PayPal).
              </p>
            ) : null}
          </div>

          <div className="glass-frosted relative rounded-2xl border border-primary/30 bg-primary/5 p-6 md:p-8">
            <span className="absolute right-4 top-4 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              Best value
            </span>
            <h2 className="font-display text-xl font-semibold">{plans?.premium.label ?? premiumTierCopy.label}</h2>
            <p className="mt-1 text-2xl font-bold text-primary">{plans?.premium.priceHint ?? premiumTierCopy.priceHint}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {plans?.premium.tagline ?? premiumTierCopy.tagline}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {premiumIncludes.map((line) => (
                <li key={line} className="flex gap-2">
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  {line}
                </li>
              ))}
              {premiumExtras.map((line) => (
                <li key={line} className="flex gap-2">
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  {line}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={
                !checkoutOk || provider === "manual" || checkoutLoading !== null || tier === "premium"
              }
              onClick={() => onCheckout("premium")}
              className="mt-6 w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
            >
              {checkoutLoading === "premium" ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              ) : tier === "premium" ? (
                "Current plan"
              ) : provider === "manual" ? (
                "Use EFT above"
              ) : (
                payLabel
              )}
            </button>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-muted/20 p-6 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{plans?.free.label ?? freeTierCopy.label} (freemium mode)</p>
          <p className="mt-2">{plans?.free.tagline ?? freeTierCopy.tagline}</p>
          <ul className="mt-3 space-y-1.5">
            {freeIncludes.map((line) => (
              <li key={line} className="flex gap-2">
                <Check className="h-4 w-4 shrink-0 text-primary" />
                {line}
              </li>
            ))}
            {freeRestrictions.map((line) => (
              <li key={line} className="flex gap-2 text-muted-foreground/90">
                <Minus className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        {devBypass ? (
          <div className="mt-8 rounded-xl border border-dashed border-amber-500/50 p-4 text-sm">
            <p className="font-medium text-amber-700 dark:text-amber-400">Dev: simulate tier</p>
            <p className="mt-1 text-muted-foreground">Server needs BILLING_DEV_BYPASS=true</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["free", "basic", "premium"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onDevTier(t)}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs capitalize"
                >
                  Set {t}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <Link to="/app" className="mt-10 inline-block text-sm text-primary hover:underline">
          ← Back to dashboard
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Billing;
