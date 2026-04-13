import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { fetchBillingStatus, type BillingStatus } from "@/lib/billing-service";
import { deletePortfolio, listPortfoliosByUser } from "@/lib/portfolio-service";
import type { PortfolioRecord } from "@/lib/portfolio-service";
import { useAuth } from "@/contexts/AuthContext";

const hasApi = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());

const Dashboard = () => {
  const { user } = useAuth();
  const userId = user?.id ?? "local-user";
  const [recent, setRecent] = useState<PortfolioRecord[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [billing, setBilling] = useState<BillingStatus | null>(null);

  const reloadList = useCallback(() => {
    setListLoading(true);
    listPortfoliosByUser(userId)
      .then(setRecent)
      .catch(() => setRecent([]))
      .finally(() => setListLoading(false));
  }, [userId]);

  useEffect(() => {
    reloadList();
  }, [reloadList]);

  useEffect(() => {
    if (!hasApi) return;
    fetchBillingStatus().then(setBilling);
  }, [userId]);

  /** API lists by session; local storage filters by userId. Keep a client guard for stale rows without user_id. */
  const myPortfolios = useMemo(
    () => recent.filter((p) => !p.user_id || p.user_id === userId),
    [recent, userId],
  );

  const handleDelete = async (item: PortfolioRecord) => {
    const ok = window.confirm(`Delete portfolio "${item.slug}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await deletePortfolio(item.id);
      reloadList();
      toast.success("Portfolio deleted");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not delete portfolio";
      toast.error(msg);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className="relative flex-1 overflow-x-hidden px-5 pb-20 pt-8 md:px-10">
        <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(ellipse_70%_40%_at_20%_0%,hsl(var(--primary)/0.12),transparent_65%),radial-gradient(ellipse_50%_30%_at_90%_20%,hsl(var(--accent)/0.1),transparent_60%)]" />

        <div className="mx-auto mb-8 max-w-7xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Dashboard</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold md:text-4xl">
                Your <span className="text-gradient">portfolios</span>
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Create a new site, or open one to edit. Published URLs stay the same until you change the slug in the
                editor.
              </p>
            </div>
            <Link
              to="/app/new"
              className="glass-pill inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              Create portfolio
            </Link>
          </div>
          {hasApi && billing ? (
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
              {billing.billingMode === "strict" && billing.billingTier === "free" ? (
                <p>
                  <span className="font-medium text-foreground">Pay-to-publish:</span> purchase Basic or Premium to
                  publish.{" "}
                  <Link to="/billing" className="text-primary underline underline-offset-2">
                    View plans
                  </Link>
                </p>
              ) : billing.billingTier === "free" ? (
                <p>
                  <span className="font-medium text-foreground">Free plan:</span> one portfolio and the Glass template
                  only. Basic and Premium include every theme. Need more?{" "}
                  <Link to="/billing" className="text-primary underline underline-offset-2">
                    Upgrade
                  </Link>
                </p>
              ) : billing.billingTier === "basic" ? (
                <p>
                  <span className="font-medium text-foreground">Basic:</span> up to {billing.limits.maxPortfolios}{" "}
                  portfolios and all visual themes. Premium unlocks custom domain & removes branding.{" "}
                  <Link to="/billing" className="text-primary underline underline-offset-2">
                    Plans
                  </Link>
                </p>
              ) : (
                <p className="text-foreground/90">
                  <span className="font-medium">Premium:</span> all themes, custom domain, no “Made with” badge, full
                  analytics.
                </p>
              )}
            </div>
          ) : null}
        </div>

        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.section
            className="glass-frosted rounded-[1.75rem] p-6 md:p-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="font-display text-xl font-semibold">Getting started</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Use <span className="text-foreground/90">Create portfolio</span> to open the editor with a blank form.
              After you publish, your page lives at{" "}
              <span className="font-mono text-xs text-primary">/portfolio/your-slug</span>.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">1.</span>
                Add profile details and at least one project with a title and summary.
              </li>
              <li className="flex gap-2">
                <span className="text-primary">2.</span>
                Pick a URL slug and theme, then publish or save changes.
              </li>
              <li className="flex gap-2">
                <span className="text-primary">3.</span>
                Share your public link — edits from this dashboard sync to the live page.
              </li>
            </ul>
            <Link
              to="/app/new"
              className="glass-pill mt-8 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              Create portfolio
            </Link>
          </motion.section>

          <motion.aside
            className="glass-card h-fit rounded-[1.75rem] p-6 md:p-8"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="font-display text-xl font-semibold">Your portfolios</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Only portfolios you have created on this account are shown here. Open the live site in a new tab, edit
              content, or remove one you no longer need.
            </p>
            <div className="mt-6 space-y-3">
              {listLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : myPortfolios.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No portfolios yet —{" "}
                  <Link to="/app/new" className="text-primary underline underline-offset-2">
                    create your first
                  </Link>
                  .
                </p>
              ) : (
                myPortfolios.slice(0, 24).map((item) => (
                  <div key={item.id} className="rounded-xl border border-white/10 bg-transparent p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium">{item.fullName}</p>
                        <p className="text-xs text-muted-foreground">{item.headline}</p>
                        <p className="mt-1 font-mono text-xs text-primary">/portfolio/{item.slug}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        to={`/app/edit/${encodeURIComponent(item.slug)}`}
                        className="glass-subtle inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Link>
                      <Link
                        to={`/portfolio/${item.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="glass-subtle inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => void handleDelete(item)}
                        className="inline-flex items-center gap-1 rounded-full border border-destructive/40 px-3 py-1 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {billing && !billing.limits.analytics ? (
              <div className="mt-6 rounded-xl border border-dashed border-white/15 p-4 text-sm text-muted-foreground">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Analytics</p>
                <p className="mt-2">Included with Basic and Premium.</p>
                <Link to="/billing" className="mt-2 inline-block text-xs text-primary hover:underline">
                  View plans →
                </Link>
              </div>
            ) : null}
          </motion.aside>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};

export default Dashboard;
