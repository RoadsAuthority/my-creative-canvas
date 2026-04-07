import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, MousePointerClick, TrendingUp } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/contexts/AuthContext";
import { getPortfolioAnalytics, type PortfolioAnalytics } from "@/lib/analytics-service";
import { fetchBillingStatus } from "@/lib/billing-service";
import { listPortfoliosByUser } from "@/lib/portfolio-service";

type Row = PortfolioAnalytics & { fullName: string };

const Analytics = () => {
  const { user, loading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [blocked, setBlocked] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoadingData(false);
      return;
    }
    Promise.all([fetchBillingStatus(), listPortfoliosByUser(user.id)])
      .then(async ([billing, portfolios]) => {
        const allowed = billing?.limits?.analytics ?? false;
        if (!allowed) {
          setBlocked(true);
          return;
        }
        const analytics = await Promise.all(portfolios.map((p) => getPortfolioAnalytics(p.slug)));
        const mapped = analytics.map((a) => ({
          ...a,
          fullName: portfolios.find((p) => p.slug === a.slug)?.fullName ?? a.slug,
        }));
        mapped.sort((a, b) => b.views - a.views);
        setRows(mapped);
      })
      .finally(() => setLoadingData(false));
  }, [user]);

  const totals = useMemo(
    () => rows.reduce((acc, r) => ({ views: acc.views + r.views, clicks: acc.clicks + r.projectClicks }), { views: 0, clicks: 0 }),
    [rows],
  );

  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading analytics...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container py-16 text-center">
          <p className="text-muted-foreground">Sign in to view analytics.</p>
          <Link to="/auth" className="glass-pill mt-6 inline-block rounded-full px-6 py-3">Sign in</Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container py-16">
          <div className="mx-auto max-w-xl rounded-2xl border border-white/10 p-8 text-center">
            <h1 className="font-display text-2xl font-bold">Analytics is a paid feature</h1>
            <p className="mt-3 text-muted-foreground">Upgrade to Basic or Premium to see views and clicks.</p>
            <Link to="/billing" className="glass-pill mt-6 inline-block rounded-full px-6 py-3">View plans</Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container max-w-5xl py-10">
        <h1 className="font-display text-3xl font-bold">Analytics</h1>
        <p className="mt-2 text-muted-foreground">Track how your portfolio performs across all published links.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total views</p>
            <p className="mt-2 text-2xl font-bold text-primary">{totals.views}</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Project clicks</p>
            <p className="mt-2 text-2xl font-bold text-primary">{totals.clicks}</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">CTR</p>
            <p className="mt-2 text-2xl font-bold text-primary">
              {totals.views > 0 ? `${Math.round((totals.clicks / totals.views) * 100)}%` : "0%"}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {rows.length === 0 ? (
            <p className="text-muted-foreground">No analytics yet. Share your portfolio links to start tracking.</p>
          ) : (
            rows.map((r) => (
              <div key={r.slug} className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-xl p-4">
                <div>
                  <p className="font-medium">{r.fullName}</p>
                  <p className="text-xs text-muted-foreground">/portfolio/{r.slug}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="inline-flex items-center gap-1 text-muted-foreground"><BarChart3 className="h-4 w-4" /> {r.views} views</span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground"><MousePointerClick className="h-4 w-4" /> {r.projectClicks} clicks</span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground"><TrendingUp className="h-4 w-4" /> {r.views ? Math.round((r.projectClicks / r.views) * 100) : 0}% CTR</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Analytics;
