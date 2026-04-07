/**
 * Public subscription profiles (NAD). Mirrors server defaults in server/billing.ts.
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

export const PRICING_CURRENCY = "NAD";

export const freeTierCopy: PlanTierCopy = {
  label: "Free",
  priceHint: "N$0",
  tagline: "Try the editor and one public portfolio (freemium).",
  includes: [
    "1 live portfolio",
    "Glass theme only",
    "Public URL & print/PDF export",
    "Social links on your page",
  ],
  restrictions: ["No custom domain", "No dashboard analytics", "“Made with PortfolioForge” on your page"],
};

export const basicTierCopy: PlanTierCopy = {
  label: "Basic portfolio",
  priceHint: "N$50 – N$100",
  tagline: "Full polish for students, job seekers, and first-time freelancers.",
  includes: [
    "Up to 5 portfolios",
    "All themes (Glass, Minimal, Bold)",
    "Dashboard analytics (views & project clicks)",
    "Unlimited edits & republish",
  ],
  restrictions: ["“Made with PortfolioForge” on public pages", "No custom domain"],
};

export const premiumTierCopy: PlanTierCopy = {
  label: "Premium",
  priceHint: "N$150 – N$300",
  tagline: "Your brand on your domain — for serious freelancers and consultants.",
  badge: "Best value",
  includes: ["Everything in Basic"],
  extras: [
    "Custom domain (DNS when you are ready)",
    "Remove “Made with PortfolioForge”",
    "Very high portfolio limit",
    "Same analytics & all themes",
  ],
};
