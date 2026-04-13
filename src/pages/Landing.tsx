import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Check,
  Globe2,
  LayoutTemplate,
  Link2,
  Minus,
  Shield,
  Sparkles,
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
    title: "Editor-built layouts",
    body: "Glass, minimal, or bold themes — tuned for readability and first impressions.",
  },
  {
    icon: Link2,
    title: "One stable URL",
    body: "Share a single link on resumes, LinkedIn, and proposals. Optional custom domain when you are ready.",
  },
  {
    icon: BarChart3,
    title: "Analytics that matter",
    body: "See views and project clicks from your dashboard — not splashed on the public page.",
  },
  {
    icon: Shield,
    title: "Your data, your stack",
    body: "Sign in, store portfolios in your Postgres (Neon), and keep credentials on the server.",
  },
];

const hasApi = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());

const Landing = () => {
  const [livePlans, setLivePlans] = useState<BillingPlans | null>(null);

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
        <section className="relative overflow-hidden px-5 pb-24 pt-16 md:px-10 md:pb-32 md:pt-20">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,hsl(var(--primary)/0.18),transparent_55%),radial-gradient(ellipse_50%_40%_at_100%_0%,hsl(var(--accent)/0.12),transparent_50%)]" />

          <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Portfolio platform for serious work
              </div>
              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl lg:text-[3.5rem]">
                A portfolio that looks like{" "}
                <span className="text-gradient">you hired a studio</span> — without the studio bill.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Turn projects into a polished, public page: bio, case studies, social links, and a print-ready export for
                recruiters. Built for freelancers, designers, and engineers who need credibility fast.
              </p>
              <p className="mt-4 max-w-xl text-sm text-primary/90">
                The last portfolio fee you'll ever pay. One-time investment, lifetime professional presence.
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
                  className="glass-frosted inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold"
                >
                  View live sample
                </Link>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">One-time pricing. No recurring subscription required.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-frosted relative rounded-[1.75rem] p-8 md:p-10"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/20 blur-3xl" />
              <h2 className="font-display text-xl font-semibold">What you ship</h2>
              <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Globe2 className="h-3.5 w-3.5" />
                  </span>
                  <span>
                    <strong className="text-foreground">Public portfolio URL</strong> — clean slug, shareable anywhere.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <LayoutTemplate className="h-3.5 w-3.5" />
                  </span>
                  <span>
                    <strong className="text-foreground">Project stories</strong> — image, role, outcome, tags, and outbound
                    links.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <BarChart3 className="h-3.5 w-3.5" />
                  </span>
                  <span>
                    <strong className="text-foreground">Dashboard analytics</strong> — views and clicks where you actually
                    look at them.
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-white/[0.02] px-5 py-20 md:px-10">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Why PortfolioForge</p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Everything in one coherent flow</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              No scattered PDFs and Dribbble links — one narrative, one URL, one place to iterate.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <f.icon className="h-8 w-8 text-primary" />
                  <h3 className="mt-4 font-display font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="templates"
          className="scroll-mt-24 border-t border-white/10 bg-white/[0.02] px-5 py-20 md:px-10"
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Portfolio templates</p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Looks that match your craft</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              The Free plan ships with the Glass Pro template. Basic and Premium both include the full set below — it is
              bundled with your subscription, not sold separately. Pick any look in the editor once you are subscribed.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "Glass Pro — Free plan",
                "Minimal & Bold — Basic & Premium",
                "Vintage family — Basic & Premium",
                "Dark / Dev Mode — Basic & Premium",
                "Scroll story — Basic & Premium",
                "Atrium — Basic & Premium",
              ].map((label) => (
                <li
                  key={label}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground"
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
                className="glass-frosted inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold"
              >
                Sign in to choose a theme
              </Link>
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="scroll-mt-24 border-t border-white/10 bg-white/[0.02] px-5 py-20 md:px-10"
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
              <div className="glass-card flex flex-col rounded-2xl p-6 md:p-8">
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

              <div className="glass-card flex flex-col rounded-2xl border border-primary/25 bg-primary/[0.06] p-6 md:p-8">
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
                  className="glass-pill mt-8 block rounded-full py-3 text-center text-sm font-semibold text-primary-foreground"
                >
                  Get Basic after sign-in
                </Link>
              </div>

              <div className="glass-card relative flex flex-col rounded-2xl border border-primary/35 p-6 md:p-8">
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

          <div className="mx-auto mb-10 max-w-6xl rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Planned features</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Static HTML export for full offline hosting</li>
              <li>Visitor geolocation insights and traffic source breakdown</li>
              <li>Section layout presets for faster page builds</li>
            </ul>
          </div>
          <div className="mx-auto flex max-w-6xl flex-col items-center rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 px-8 py-16 text-center md:px-16">
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
              <Link to={`/portfolio/${SAMPLE_PORTFOLIO_SLUG}`} className="glass-frosted rounded-full px-8 py-3 font-semibold">
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
