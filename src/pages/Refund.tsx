import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const Refund = () => (
  <div className="min-h-screen bg-background">
    <SiteHeader />
    <main className="container max-w-3xl py-12">
      <h1 className="font-display text-3xl font-bold">Refund Policy</h1>
      <p className="mt-4 text-muted-foreground">
        Payments are currently treated as one-time purchases for plan activation. If you were charged incorrectly,
        contact support with your payment reference for review.
      </p>
      <p className="mt-3 text-muted-foreground">
        Approved refunds are processed through the original payment method (for example Lemon Squeezy checkout method
        or manual reconciliation).
      </p>
    </main>
    <SiteFooter />
  </div>
);

export default Refund;
