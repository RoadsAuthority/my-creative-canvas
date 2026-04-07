import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const Refunds = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold">Refund Policy</h1>
        <p className="mt-4 text-muted-foreground">
          PortfolioForge currently uses one-time plan purchases. If there is a billing issue or accidental charge, contact support with your payment reference.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Eligibility</h2>
        <p className="mt-2 text-muted-foreground">
          Refund requests are reviewed case-by-case, typically for duplicate payments or service delivery failures.
        </p>
        <h2 className="mt-8 text-xl font-semibold">How to request</h2>
        <p className="mt-2 text-muted-foreground">
          Send your account email, payment proof, and transaction reference to the support contact listed on the billing page.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Refunds;
