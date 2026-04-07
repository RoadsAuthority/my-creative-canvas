import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold">Terms of Service</h1>
        <p className="mt-4 text-muted-foreground">
          By using PortfolioForge, you agree to use the platform lawfully and only publish content you own or are authorized to share.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Account responsibility</h2>
        <p className="mt-2 text-muted-foreground">
          You are responsible for your credentials, content, and links shared from your portfolio pages.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Plan limits</h2>
        <p className="mt-2 text-muted-foreground">
          Feature limits are enforced by billing tier (Free, Basic, Premium) and may change with product updates.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Service availability</h2>
        <p className="mt-2 text-muted-foreground">
          We aim for reliable uptime but cannot guarantee uninterrupted service at all times.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Terms;
