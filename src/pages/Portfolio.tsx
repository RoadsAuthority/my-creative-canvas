import { motion } from "framer-motion";
import { BarChart3, Eye, Github, Globe, Linkedin, MapPin, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/contexts/AuthContext";
import { getPortfolioAnalytics, trackPortfolioView, trackProjectClick } from "@/lib/analytics-service";
import { getPortfolioBySlug } from "@/lib/portfolio-service";
import type { PortfolioRecord } from "@/lib/portfolio-service";

const themeClass: Record<string, string> = {
  glass: "glass-frosted",
  minimal: "bg-card/80 border border-border",
  bold: "bg-primary/10 border border-primary/30",
};

const hasApi = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());

const Portfolio = () => {
  const { slug = "" } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<PortfolioRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [visitorPreview, setVisitorPreviewState] = useState(false);
  const [ownerStats, setOwnerStats] = useState<{ views: number; clicks: number } | null>(null);

  useEffect(() => {
    getPortfolioBySlug(slug)
      .then(setData)
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    try {
      setVisitorPreviewState(sessionStorage.getItem(`pf-visitor-preview-${slug}`) === "1");
    } catch {
      /* ignore */
    }
  }, [slug]);

  const setVisitorPreview = (next: boolean) => {
    setVisitorPreviewState(next);
    try {
      if (slug) sessionStorage.setItem(`pf-visitor-preview-${slug}`, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const isOwner = Boolean(
    data?.isOwner ?? (user && data?.user_id !== undefined && data.user_id === user.id),
  );
  const visitorChrome = !isOwner || visitorPreview;
  const showDashboardInHeader = Boolean(user && (!isOwner || !visitorPreview));

  useEffect(() => {
    if (data?.fullName) document.title = `${data.fullName} · Portfolio`;
    return () => {
      document.title = "PortfolioForge";
    };
  }, [data?.fullName]);

  useEffect(() => {
    if (!slug || !data || authLoading) return;
    if (data.isOwner) return;
    if (data.user_id !== undefined && user?.id === data.user_id) return;
    trackPortfolioView(slug);
  }, [slug, data, user?.id, authLoading]);

  useEffect(() => {
    if (!isOwner || visitorPreview || !slug) {
      setOwnerStats(null);
      return;
    }
    getPortfolioAnalytics(slug).then((a) =>
      setOwnerStats({ views: a.views, clicks: a.projectClicks }),
    );
  }, [isOwner, visitorPreview, slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader showDashboard={Boolean(user)} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
          <div className="h-12 w-12 animate-pulse rounded-2xl bg-primary/20" />
          <p className="text-sm text-muted-foreground">Loading portfolio…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader showDashboard={Boolean(user)} />
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="glass-card max-w-md rounded-3xl p-10 text-center">
            <h1 className="text-2xl font-bold">Portfolio not found</h1>
            <p className="mt-3 text-muted-foreground">
              This link may be incorrect, or the page was removed.
            </p>
            <Link to="/" className="glass-pill mt-8 inline-block rounded-full px-6 py-2.5 font-medium">
              Back to home
            </Link>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const social = data.socialLinks;
  const hasSocial = social && (social.website || social.linkedin || social.github);

  return (
    <div className="min-h-screen bg-background">
      {isOwner && !visitorPreview ? (
        <div className="sticky top-0 z-[60] border-b border-primary/25 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm md:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
                Owner view
              </span>
              <span className="text-muted-foreground">
                Visitors never see this bar — only your public page below matches what they get.
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {ownerStats ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                  <BarChart3 className="h-3.5 w-3.5" />
                  {ownerStats.views} views · {ownerStats.clicks} project clicks
                </span>
              ) : null}
              <Link
                to="/app"
                className="rounded-full border border-white/15 bg-background/80 px-4 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => setVisitorPreview(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                <Eye className="h-3.5 w-3.5" />
                View as visitor
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <SiteHeader showDashboard={showDashboardInHeader} />

      <main className="px-5 pb-16 pt-10 md:px-10">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.08),transparent_55%)]" />

        <div className="mx-auto max-w-5xl space-y-10">
          <motion.header
            className={`${themeClass[data.theme] ?? themeClass.glass} rounded-[1.75rem] p-8 md:p-12`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {data.profileImageUrl ? (
              <img
                src={data.profileImageUrl}
                alt={`${data.fullName} profile`}
                className="mb-5 h-20 w-20 rounded-2xl border border-white/15 object-cover md:h-24 md:w-24"
              />
            ) : null}
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Portfolio</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">{data.fullName}</h1>
            <p className="mt-3 text-xl text-muted-foreground md:text-2xl">{data.headline}</p>
            {data.bio ? (
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">{data.bio}</p>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              {data.email ? (
                <a
                  href={`mailto:${data.email}`}
                  className="glass-subtle inline-flex items-center gap-2 rounded-full px-4 py-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  {data.email}
                </a>
              ) : null}
              {data.location ? (
                <span className="glass-subtle inline-flex items-center gap-2 rounded-full px-4 py-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {data.location}
                </span>
              ) : null}
            </div>

            {hasSocial ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {social?.website ? (
                  <a
                    href={social.website.startsWith("http") ? social.website : `https://${social.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="glass-subtle inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-primary"
                  >
                    <Globe className="h-4 w-4" /> Website
                  </a>
                ) : null}
                {social?.linkedin ? (
                  <a
                    href={social.linkedin.startsWith("http") ? social.linkedin : `https://${social.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="glass-subtle inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-primary"
                  >
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                ) : null}
                {social?.github ? (
                  <a
                    href={social.github.startsWith("http") ? social.github : `https://${social.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="glass-subtle inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-primary"
                  >
                    <Github className="h-4 w-4" /> GitHub
                  </a>
                ) : null}
              </div>
            ) : null}

            {data.customDomain ? (
              <p className="mt-6 text-xs text-muted-foreground">
                Custom domain: <span className="font-mono text-foreground">{data.customDomain}</span>
                {data.customDomainVerified ? (
                  <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-primary">Verified</span>
                ) : (
                  <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-muted-foreground">DNS pending</span>
                )}
              </p>
            ) : null}

            <div className="no-print mt-8 flex flex-wrap gap-3">
              {data.cvUrl ? (
                <a
                  href={data.cvUrl}
                  download={data.cvFileName || `${data.fullName}-CV`}
                  className="glass-frosted rounded-full px-5 py-2.5 text-sm font-medium"
                >
                  Download CV
                </a>
              ) : null}
              <button
                type="button"
                onClick={() => window.print()}
                className="glass-pill rounded-full px-5 py-2.5 text-sm font-medium"
              >
                Export PDF / print
              </button>
              {visitorChrome ? (
                <>
                  {!user && hasApi ? (
                    <Link to="/auth" className="glass-frosted rounded-full px-5 py-2.5 text-sm font-medium">
                      Create your portfolio
                    </Link>
                  ) : null}
                  {user && !isOwner ? (
                    <Link to="/app" className="glass-frosted rounded-full px-5 py-2.5 text-sm font-medium">
                      Dashboard
                    </Link>
                  ) : null}
                </>
              ) : (
                <>
                  <Link to="/app" className="glass-frosted rounded-full px-5 py-2.5 text-sm font-medium">
                    Edit in dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => setVisitorPreview(true)}
                    className="glass-frosted inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    Preview as visitor
                  </button>
                </>
              )}
            </div>
          </motion.header>

          <section>
            <h2 className="mb-6 font-display text-2xl font-semibold md:text-3xl">Selected work</h2>
            <div className="space-y-6">
              {data.projects.map((project, idx) => (
                <motion.article
                  key={project.id}
                  className="glass-card overflow-hidden rounded-2xl md:rounded-3xl"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                >
                  {project.imageUrl ? (
                    <div className="aspect-[21/9] max-h-72 w-full overflow-hidden md:aspect-[3/1]">
                      <img src={project.imageUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : null}
                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold md:text-2xl">{project.title}</h3>
                        {project.role ? <p className="mt-1 text-sm font-medium text-primary">{project.role}</p> : null}
                      </div>
                      {project.link ? (
                        <a
                          href={project.link.startsWith("http") ? project.link : `https://${project.link}`}
                          target="_blank"
                          rel="noreferrer"
                          className="glass-pill shrink-0 rounded-full px-5 py-2.5 text-sm font-medium"
                          onClick={() => trackProjectClick(data.slug)}
                        >
                          View work
                        </a>
                      ) : null}
                    </div>
                    <p className="mt-4 leading-relaxed text-muted-foreground md:text-lg">{project.summary}</p>
                    {project.tags ? (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {project.tags.split(",").map((tag) => (
                          <span
                            key={`${project.id}-${tag}`}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </motion.article>
              ))}
            </div>
          </section>

          <div className="no-print border-t border-white/10 pt-8">
            {data.showPoweredBy ? (
              <p className="mb-4 text-center text-xs text-muted-foreground">
                Made with{" "}
                <Link to="/" className="text-primary hover:underline">
                  PortfolioForge
                </Link>
              </p>
            ) : null}
            <Link
              to="/"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              ← PortfolioForge home
            </Link>
          </div>
        </div>
      </main>

      {isOwner && visitorPreview ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
          <button
            type="button"
            onClick={() => setVisitorPreview(false)}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border bg-background/95 px-5 py-2.5 text-sm font-semibold shadow-lg backdrop-blur-md transition hover:bg-muted"
          >
            Exit visitor preview
          </button>
        </div>
      ) : null}

      <SiteFooter />
    </div>
  );
};

export default Portfolio;
