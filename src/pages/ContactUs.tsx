import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL?.trim() || "support@portfolioforge.uk";

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold">Contact us</h1>
        <p className="mt-4 text-muted-foreground">
          Need help with billing, account access, publishing, or your custom domain setup? We are here to help.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 p-6">
          <p className="text-sm text-muted-foreground">Support email</p>
          <a href={`mailto:${supportEmail}`} className="mt-2 inline-block text-lg font-semibold text-primary underline">
            {supportEmail}
          </a>
          <p className="mt-4 text-sm text-muted-foreground">
            Include your account email and, for payment issues, your transaction reference so we can resolve it quickly.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default ContactUs;
