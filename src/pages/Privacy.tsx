import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-4 text-muted-foreground">
          PortfolioForge stores account information and portfolio content to provide publishing, billing, and analytics.
          We only process data needed to run the service.
        </p>
        <h2 className="mt-8 text-xl font-semibold">What we collect</h2>
        <p className="mt-2 text-muted-foreground">
          Account email, hashed password, portfolio content, social links, and optional uploaded files (images/CV).
        </p>
        <h2 className="mt-8 text-xl font-semibold">Payments</h2>
        <p className="mt-2 text-muted-foreground">
          Payments are processed by third-party providers (PayPal/Stripe/manual EFT references). We do not store full card details.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Contact</h2>
        <p className="mt-2 text-muted-foreground">For privacy requests, contact support via your billing contact email.</p>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Privacy;
