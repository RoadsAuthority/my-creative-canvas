import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  Check,
  Globe2,
  LayoutTemplate,
  Link2,
  Minus,
  Shield,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { fetchBillingPlans, type BillingPlans } from "@/lib/billing-service";
import { basicTierCopy, freeTierCopy, premiumTierCopy, PRICING_CURRENCY } from "@/lib/pricing-data";
import { SAMPLE_PORTFOLIO_SLUG } from "@/lib/portfolio-service";

const features = [
  {
    icon: LayoutTemplate,
    title: "Clean layouts, ready to publish",
    body: "Pick a style, add your work, and publish a link you can confidently share.",
  },
  {
    icon: Link2,
    title: "One stable URL",
    body: "Use one portfolio link across resumes, LinkedIn, and client proposals.",
  },
  {
    icon: BarChart3,
    title: "Clear performance signals",
    body: "Track views and project clicks so you can see what gets attention.",
  },
  {
    icon: Shield,
    title: "Simple editing workflow",
    body: "Update projects in minutes and keep your public page current as your work evolves.",
  },
];

const hasApi = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());

const Landing = () => {
  const [livePlans, setLivePlans] = useState<BillingPlans | null>(null);
  const heroPreviewRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroPreviewRef,
    offset: ["start 90%", "end start"],
  });
  const previewScale = useTransform(scrollYProgress, [0, 1], [0.985, 1]);
  const previewY = useTransform(scrollYProgress, [0, 1], [20, -8]);
  const previewOpacity = useTransform(scrollYProgress, [0, 0.35, 1], [0.78, 1, 1]);

  useEffect(() => {
    if (!hasApi) return;
    void fetchBillingPlans().then(setLivePlans);
  }, []);

  const b = livePlans?.basic;
  const p = livePlans?.premium;
  const f = livePlans?.free;

  const freeLabel = f?.label ?? freeTierCopy.label;
  const freePrice = f?.priceHint ?? freeTierCopy.priceHint;
  const freeTagline = f?.tagline ?? freeTierCopy.tagline;
  const freeIncludes = f?.includes?.length ? f.includes : freeTierCopy.includes;
  const freeRestrictions = f?.restrictions?.length ? f.restrictions : freeTierCopy.restrictions ?? [];

  const basicLabel = b?.label ?? basicTierCopy.label;
  const basicPrice = b?.priceHint ?? basicTierCopy.priceHint;
  const basicTagline = b?.tagline ?? basicTierCopy.tagline;
  const basicIncludes = b?.includes?.length ? b.includes : basicTierCopy.includes;
  const basicRestrictions = b?.restrictions?.length ? b.restrictions : basicTierCopy.restrictions ?? [];

  const premiumLabel = p?.label ?? premiumTierCopy.label;
  const premiumPrice = p?.priceHint ?? premiumTierCopy.priceHint;
  const premiumTagline = p?.tagline ?? premiumTierCopy.tagline;
  const premiumIncludes = p?.includes?.length ? p.includes : premiumTierCopy.includes;
  const premiumExtras = p?.extras?.length ? p.extras : premiumTierCopy.extras ?? [];

  const currencyNote = `Prices shown in ${PRICING_CURRENCY}. Basic and Premium are once-off payments.`;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden border-b border-white/10 px-5 pb-20 pt-14 md:px-10 md:pb-24 md:pt-16">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_65%_45%_at_72%_0%,hsl(var(--primary)/0.16),transparent_60%)]" />

          <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" />
                PortfolioForge
              </div>
              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.04] tracking-tight md:text-6xl lg:text-[3.5rem]">
                More clarity.
                <br />
                More trust.
                <br />
                <span className="text-primary">More replies.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Turn your projects into one clear public page with your story, proof of work, and contact details.
                Perfect for job applications, referrals, and client outreach.
              </p>
              <p className="mt-4 max-w-xl text-sm text-primary/90">
                Start free. Upgrade only when you need more themes, analytics, or custom domain.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/70 bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/35 transition hover:bg-primary/90 hover:shadow-primary/45"
                >
                  Start free
                  <Zap className="h-4 w-4" />
                </Link>
                <Link
                  to={`/portfolio/${SAMPLE_PORTFOLIO_SLUG}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-8 py-3.5 text-base font-semibold text-foreground transition hover:bg-white/5"
                >
                  View live sample
                </Link>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">One-time pricing. No subscriptions.</p>
            </motion.div>

            <motion.div
              ref={heroPreviewRef}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={
                reduceMotion
                  ? undefined
                  : {
                      scale: previewScale,
                      y: previewY,
                      opacity: previewOpacity,
                    }
              }
              className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-card shadow-[0_24px_55px_-35px_rgba(0,0,0,0.7)]"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <span>Live portfolio preview</span>
                <span>Your own data</span>
              </div>
              <div className="grid gap-4 p-5">
                <div className="rounded-xl border border-white/10 bg-background/65 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-primary">Profile hero</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">Name, role, short summary and image above the fold.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {["Case studies with images", "Contact cards with links"].map((label) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-background/55 p-4">
                      <p className="text-sm text-foreground">{label}</p>
                    </div>
                  ))}
                </div>
                <Link
                  to={`/portfolio/${SAMPLE_PORTFOLIO_SLUG}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-white/10"
                >
                  Open live sample
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-t border-white/10 px-5 py-20 md:px-10">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Why PortfolioForge</p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Built for real hiring and client work</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Replace scattered links and outdated PDFs with one page that tells a clear story.
            </p>
            <div className="mt-12 grid gap-5 md:grid-cols-12">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl border border-white/10 bg-card p-6 ${
                    i === 0 ? "md:col-span-6" : i === 1 ? "md:col-span-6" : i === 2 ? "md:col-span-5" : "md:col-span-7"
                  }`}
                >
                  <f.icon className="h-7 w-7 text-primary" />
                  <h3 className="mt-4 font-display font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="templates" className="scroll-mt-24 border-t border-white/10 px-5 py-20 md:px-10">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Portfolio templates</p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Looks that match your craft</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              The Free plan ships with the Glass Pro template. Basic and Premium both include the full set below — it is
              bundled with your subscription, not sold separately. Pick any look in the editor once you are subscribed.
            </p>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                {
                  title: "Midnight Gold",
                  tone: "Dark product-story style with premium contrast.",
                  panel: "bg-gradient-to-b from-[#171717] to-[#0d0d0d]",
                },
                {
                  title: "Bold Contrast",
                  tone: "High-impact profile + visual-first project cards.",
                  panel: "bg-gradient-to-b from-[#111821] to-[#090d14]",
                },
                {
                  title: "Minimal Clean",
                  tone: "Editorial light layout for straightforward reading.",
                  panel: "bg-gradient-to-b from-[#f2f2ef] to-[#e8e6de]",
                },
              ].map((item) => (
                <div key={item.title} className="overflow-hidden rounded-2xl border border-white/10 bg-card">
                  <div className={`h-36 border-b border-white/10 ${item.panel}`} />
                  <div className="p-5">
                    <p className="text-base font-semibold text-foreground">{item.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{item.tone}</p>
                  </div>
                </div>
              ))}
            </div>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "Glass Pro — Free plan",
                "Minimal & Bold — Basic & Premium",
                "Vintage family — Basic & Premium",
                "Dark Motion — Basic & Premium",
                "Scroll story — Basic & Premium",
                "Atrium — Basic & Premium",
                "Mustard — light editorial",
                "Evergreen — forest & amber",
                "Midnight — charcoal & gold",
              ].map((label) => (
                <li
                  key={label}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-card px-4 py-3 text-sm text-foreground"
                >
                  <LayoutTemplate className="h-4 w-4 shrink-0 text-primary" />
                  {label}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center rounded-full border border-primary/70 bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:bg-primary/90"
              >
                Compare plans
              </a>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-transparent px-6 py-3 text-sm font-semibold transition hover:bg-white/5"
              >
                Sign in to choose a theme
              </Link>
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="scroll-mt-24 border-t border-white/10 px-5 py-20 md:px-10"
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Pricing</p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Plans for every stage</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Start free, then pick Basic for a full professional setup or Premium when you want your own domain and a
              clean public brand.
            </p>
            <p className="mt-2 text-sm text-muted-foreground/90">{currencyNote}</p>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              <div className="flex flex-col rounded-2xl border border-white/10 bg-card p-6 md:p-8">
                <h3 className="font-display text-lg font-semibold">{freeLabel}</h3>
                <p className="mt-2 text-3xl font-bold text-primary">{freePrice}</p>
                <p className="mt-2 text-sm text-muted-foreground">{freeTagline}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm text-muted-foreground">
                  {freeIncludes.map((line) => (
                    <li key={line} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {line}
                    </li>
                  ))}
                  {freeRestrictions.map((line) => (
                    <li key={line} className="flex gap-2 text-muted-foreground/90">
                      <Minus className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/55" />
                      {line}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth"
                  className="mt-8 block rounded-full border border-primary/65 bg-primary py-3 text-center text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 transition hover:bg-primary/90"
                >
                  Start free
                </Link>
              </div>

              <div className="flex flex-col rounded-2xl border border-primary/30 bg-primary/[0.05] p-6 md:p-8">
                <h3 className="font-display text-lg font-semibold">{basicLabel}</h3>
                <p className="mt-2 text-3xl font-bold text-primary">{basicPrice}</p>
                <p className="mt-2 text-sm text-muted-foreground">{basicTagline}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm text-muted-foreground">
                  {basicIncludes.map((line) => (
                    <li key={line} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {line}
                    </li>
                  ))}
                  {basicRestrictions.map((line) => (
                    <li key={line} className="flex gap-2 text-muted-foreground/90">
                      <Minus className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/55" />
                      {line}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth"
                  className="mt-8 block rounded-full border border-primary/60 bg-primary py-3 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Get Basic after sign-in
                </Link>
              </div>

              <div className="relative flex flex-col rounded-2xl border border-primary/35 bg-card p-6 md:p-8">
                <span className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                  {premiumTierCopy.badge ?? "Best value"}
                </span>
                <h3 className="font-display text-lg font-semibold">{premiumLabel}</h3>
                <p className="mt-2 text-3xl font-bold text-primary">{premiumPrice}</p>
                <p className="mt-2 text-sm text-muted-foreground">{premiumTagline}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm text-muted-foreground">
                  {premiumIncludes.map((line) => (
                    <li key={line} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {line}
                    </li>
                  ))}
                  {premiumExtras.map((line) => (
                    <li key={line} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {line}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth"
                  className="mt-8 block rounded-full bg-primary py-3 text-center text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  Go Premium after sign-in
                </Link>
              </div>
            </div>

            {hasApi ? (
              <p className="mt-8 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/billing" className="font-medium text-primary underline-offset-4 hover:underline">
                  Open billing
                </Link>
              </p>
            ) : null}
          </div>
        </section>

        <section className="px-5 py-20 md:px-10">
          <div className="mx-auto mb-8 max-w-6xl rounded-2xl border border-primary/20 bg-primary/5 px-6 py-5 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Own your work</p>
            <p className="mt-2">
              Every portfolio supports print/PDF export today, so you always keep a portable version of your profile and
              project stories.
            </p>
          </div>

          <div className="mx-auto mb-10 max-w-6xl rounded-2xl border border-white/10 bg-card px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Planned features</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Static HTML export for full offline hosting</li>
              <li>Visitor geolocation insights and traffic source breakdown</li>
              <li>Section layout presets for faster page builds</li>
            </ul>
          </div>
          <div className="mx-auto flex max-w-6xl flex-col items-center rounded-[1.75rem] border border-white/10 bg-card px-8 py-16 text-center md:px-16">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Ready when you are</h2>
            <p className="mt-4 max-w-lg text-muted-foreground">
              Create an account, paste your best work, publish — then send one link with your next application or client
              deck.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/auth"
                className="rounded-full border border-primary/70 bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/35 transition hover:bg-primary/90 hover:shadow-primary/45"
              >
                Get started
              </Link>
              <Link
                to={`/portfolio/${SAMPLE_PORTFOLIO_SLUG}`}
                className="rounded-full border border-white/20 bg-transparent px-8 py-3 font-semibold transition hover:bg-white/5"
              >
                Preview sample
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Landing;
