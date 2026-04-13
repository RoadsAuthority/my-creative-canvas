/**
 * Public plan profiles. Mirrors server defaults in server/billing.ts.
 * Landing uses this until /billing/plans loads (when API is connected).
 */
export type PlanTierCopy = {
  label: string;
  priceHint: string;
  tagline: string;
  includes: string[];
  restrictions?: string[];
  extras?: string[];
  badge?: string;
};

export const PRICING_CURRENCY = "USD";

export const freeTierCopy: PlanTierCopy = {
  label: "Free",
  priceHint: "$0",
  tagline: "Try the editor and one public portfolio (freemium).",
  includes: [
    "1 live portfolio",
    "Glass template only (full theme library on Basic or Premium)",
    "Public URL & print/PDF export",
    "Social links on your page",
    "Path domain (pf.me/user style URL)",
  ],
  restrictions: ["No custom domain", "No dashboard analytics", "“Made with PortfolioForge” on your page"],
};

export const basicTierCopy: PlanTierCopy = {
  label: "Basic ($19)",
  priceHint: "$19 (once-off)",
  tagline: "The last portfolio fee you'll ever pay for a professional profile.",
  includes: [
    "Up to 5 portfolios",
    "Every visual theme included",
    "Basic analytics (views & project clicks)",
    "Unlimited edits & republish",
    "No “Made with” branding",
    "One-time payment",
  ],
  restrictions: ["No custom domain"],
};

export const premiumTierCopy: PlanTierCopy = {
  label: "Premium ($49)",
  priceHint: "$49 (once-off)",
  tagline: "One-time investment, lifetime professional presence on your own domain.",
  badge: "Best value",
  includes: ["Everything in Basic"],
  extras: [
    "Custom domain (DNS when you are ready)",
    "Advanced analytics",
    "Up to 50 portfolios",
    "One-time payment",
  ],
};
