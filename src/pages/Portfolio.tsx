import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Eye,
  Github,
  Globe,
  Linkedin,
  MapPin,
  Mail,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PortfolioDevModeTheme } from "@/components/portfolio/PortfolioDevModeTheme";
import { PortfolioAtriumTheme } from "@/components/portfolio/PortfolioAtriumTheme";
import { PortfolioEvergreenTheme } from "@/components/portfolio/PortfolioEvergreenTheme";
import { PortfolioMidnightGoldTheme } from "@/components/portfolio/PortfolioMidnightGoldTheme";
import { PortfolioMustardTheme } from "@/components/portfolio/PortfolioMustardTheme";
import { PortfolioScrollStoryTheme } from "@/components/portfolio/PortfolioScrollStoryTheme";
import { PortfolioVintageEditorialTheme } from "@/components/portfolio/PortfolioVintageEditorialTheme";
import { PortfolioVintageRefinedTheme } from "@/components/portfolio/PortfolioVintageRefinedTheme";
import { PortfolioVintageTheme } from "@/components/portfolio/PortfolioVintageTheme";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/contexts/AuthContext";
import { getPortfolioAnalytics, trackPortfolioView, trackProjectClick } from "@/lib/analytics-service";
import { buildPortfolioSeo } from "@/lib/portfolio-seo";
import { getPortfolioBySlug } from "@/lib/portfolio-service";
import type { PortfolioRecord } from "@/lib/portfolio-service";
import type { PortfolioProject } from "@/types/portfolio";

const hasApi = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());

const cleanTags = (tags?: string) =>
  (tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const projectImageUrls = (project: PortfolioProject): string[] => {
  if (project.imageUrls?.length) return project.imageUrls;
  if (project.imageUrl) return [project.imageUrl];
  return [];
};

const Portfolio = () => {
  const { slug = "" } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<PortfolioRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [visitorPreview, setVisitorPreviewState] = useState(false);
  const [ownerStats, setOwnerStats] = useState<{ views: number; clicks: number } | null>(null);
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(null);

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

  useEffect(() => {
    if (!data || typeof window === "undefined") return;
    const origin = window.location.origin;
    const { title, description, ogImage, url } = buildPortfolioSeo(data, origin);

    const prevTitle = document.title;
    const metaSnapshots: { el: Element; attr: string; prev: string | null }[] = [];
    const touch = (selector: string, attr: "content" | "href", value: string) => {
      const el = document.querySelector(selector);
      if (!el) return;
      metaSnapshots.push({ el, attr, prev: el.getAttribute(attr) });
      el.setAttribute(attr, value);
    };

    document.title = title;
    touch('meta[name="description"]', "content", description);
    touch('meta[property="og:title"]', "content", title);
    touch('meta[property="og:description"]', "content", description);
    touch('meta[property="og:image"]', "content", ogImage);
    touch('meta[property="og:url"]', "content", url);
    touch('meta[name="twitter:title"]', "content", title);
    touch('meta[name="twitter:description"]', "content", description);
    touch('meta[name="twitter:image"]', "content", ogImage);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    let canonicalCreated = false;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
      canonicalCreated = true;
    } else {
      metaSnapshots.push({ el: canonical, attr: "href", prev: canonical.getAttribute("href") });
    }
    canonical.setAttribute("href", url);

    return () => {
      document.title = prevTitle;
      metaSnapshots.forEach(({ el, attr, prev }) => {
        if (prev === null) el.removeAttribute(attr);
        else el.setAttribute(attr, prev);
      });
      if (canonicalCreated && canonical?.parentNode) {
        canonical.parentNode.removeChild(canonical);
      }
    };
  }, [data]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowLeft") {
        setLightbox((prev) =>
          prev && prev.urls.length
            ? { ...prev, index: (prev.index - 1 + prev.urls.length) % prev.urls.length }
            : prev,
        );
      }
      if (e.key === "ArrowRight") {
        setLightbox((prev) =>
          prev && prev.urls.length ? { ...prev, index: (prev.index + 1) % prev.urls.length } : prev,
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

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
  const aboutTitle = social?.aboutTitle?.trim() || "Design with purpose and personality";
  const aboutText =
    social?.aboutText?.trim() ||
    data.bio ||
    "I create thoughtful digital experiences with clear storytelling, strong visual systems, and practical product outcomes. Each project balances strategy, identity, and user usability.";
  const heroImage =
    data.profileImageUrl ||
    data.projects.find((project) => (project.imageUrls?.length ?? 0) > 0 || project.imageUrl)?.imageUrls?.[0] ||
    data.projects.find((project) => project.imageUrl)?.imageUrl ||
    "";

  if (
    data.theme === "vintage" ||
    data.theme === "vintageRefined" ||
    data.theme === "vintageEditorial" ||
    data.theme === "devMode" ||
    data.theme === "scrollStory" ||
    data.theme === "atrium" ||
    data.theme === "mustard" ||
    data.theme === "evergreen" ||
    data.theme === "midnightGold"
  ) {
    return (
      <div className="min-h-screen">
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
        {data.theme === "devMode" ? (
          <PortfolioDevModeTheme
            data={data}
            heroImage={heroImage}
            aboutTitle={aboutTitle}
            aboutText={aboutText}
            hasSocial={Boolean(hasSocial)}
            social={social}
            visitorChrome={visitorChrome}
            isOwner={isOwner}
            user={user}
            hasApi={hasApi}
            lightbox={lightbox}
            setLightbox={setLightbox}
            setVisitorPreview={setVisitorPreview}
          />
        ) : data.theme === "scrollStory" ? (
          <PortfolioScrollStoryTheme
            data={data}
            heroImage={heroImage}
            aboutTitle={aboutTitle}
            aboutText={aboutText}
            hasSocial={Boolean(hasSocial)}
            social={social}
            visitorChrome={visitorChrome}
            isOwner={isOwner}
            user={user}
            hasApi={hasApi}
            lightbox={lightbox}
            setLightbox={setLightbox}
            setVisitorPreview={setVisitorPreview}
          />
        ) : data.theme === "atrium" ? (
          <PortfolioAtriumTheme
            data={data}
            heroImage={heroImage}
            aboutTitle={aboutTitle}
            aboutText={aboutText}
            hasSocial={Boolean(hasSocial)}
            social={social}
            visitorChrome={visitorChrome}
            isOwner={isOwner}
            user={user}
            hasApi={hasApi}
            lightbox={lightbox}
            setLightbox={setLightbox}
            setVisitorPreview={setVisitorPreview}
          />
        ) : data.theme === "mustard" ? (
          <PortfolioMustardTheme
            data={data}
            heroImage={heroImage}
            aboutTitle={aboutTitle}
            aboutText={aboutText}
            hasSocial={Boolean(hasSocial)}
            social={social}
            visitorChrome={visitorChrome}
            isOwner={isOwner}
            user={user}
            hasApi={hasApi}
            lightbox={lightbox}
            setLightbox={setLightbox}
            setVisitorPreview={setVisitorPreview}
          />
        ) : data.theme === "evergreen" ? (
          <PortfolioEvergreenTheme
            data={data}
            heroImage={heroImage}
            aboutTitle={aboutTitle}
            aboutText={aboutText}
            hasSocial={Boolean(hasSocial)}
            social={social}
            visitorChrome={visitorChrome}
            isOwner={isOwner}
            user={user}
            hasApi={hasApi}
            lightbox={lightbox}
            setLightbox={setLightbox}
            setVisitorPreview={setVisitorPreview}
          />
        ) : data.theme === "midnightGold" ? (
          <PortfolioMidnightGoldTheme
            data={data}
            heroImage={heroImage}
            aboutTitle={aboutTitle}
            aboutText={aboutText}
            hasSocial={Boolean(hasSocial)}
            social={social}
            visitorChrome={visitorChrome}
            isOwner={isOwner}
            user={user}
            hasApi={hasApi}
            lightbox={lightbox}
            setLightbox={setLightbox}
            setVisitorPreview={setVisitorPreview}
          />
        ) : data.theme === "vintage" ? (
          <PortfolioVintageTheme
            data={data}
            heroImage={heroImage}
            aboutTitle={aboutTitle}
            aboutText={aboutText}
            hasSocial={Boolean(hasSocial)}
            social={social}
            visitorChrome={visitorChrome}
            isOwner={isOwner}
            user={user}
            hasApi={hasApi}
            lightbox={lightbox}
            setLightbox={setLightbox}
            setVisitorPreview={setVisitorPreview}
          />
        ) : data.theme === "vintageRefined" ? (
          <PortfolioVintageRefinedTheme
            data={data}
            heroImage={heroImage}
            aboutTitle={aboutTitle}
            aboutText={aboutText}
            hasSocial={Boolean(hasSocial)}
            social={social}
            visitorChrome={visitorChrome}
            isOwner={isOwner}
            user={user}
            hasApi={hasApi}
            lightbox={lightbox}
            setLightbox={setLightbox}
            setVisitorPreview={setVisitorPreview}
          />
        ) : (
          <PortfolioVintageEditorialTheme
            data={data}
            heroImage={heroImage}
            aboutTitle={aboutTitle}
            aboutText={aboutText}
            hasSocial={Boolean(hasSocial)}
            social={social}
            visitorChrome={visitorChrome}
            isOwner={isOwner}
            user={user}
            hasApi={hasApi}
            lightbox={lightbox}
            setLightbox={setLightbox}
            setVisitorPreview={setVisitorPreview}
          />
        )}
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b12] text-foreground">
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

      <main className="px-5 pb-16 pt-8 md:px-10">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_90%_70%_at_70%_-15%,rgba(42,137,255,0.22),transparent_62%)]" />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_65%_at_0%_100%,rgba(238,121,50,0.16),transparent_58%)]" />

        <div className="mx-auto max-w-6xl space-y-10">
          <motion.header
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1422] p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] md:p-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {heroImage ? (
              <>
                <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45" />
              </>
            ) : null}
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/75">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Open to work
              </div>
              <h1 className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-[0.95] tracking-tight text-white md:text-7xl">
                {data.fullName}
              </h1>
              <p className="mt-4 max-w-3xl text-lg text-white/80 md:text-2xl">{data.headline}</p>
              {data.bio ? (
                <p className="mt-6 max-w-3xl leading-relaxed text-white/70 md:text-lg">{data.bio}</p>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3 text-sm">
                {data.email ? (
                  <a
                    href={`mailto:${data.email}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-white/85 transition-colors hover:bg-black/60"
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    {data.email}
                  </a>
                ) : null}
                {data.location ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-white/80">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {data.location}
                  </span>
                ) : null}
              </div>
            </div>

            {hasSocial ? (
              <div className="relative mt-6 flex flex-wrap gap-3">
                {social?.website ? (
                  <a
                    href={social.website.startsWith("http") ? social.website : `https://${social.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-black/60"
                  >
                    <Globe className="h-4 w-4" /> Website
                  </a>
                ) : null}
                {social?.linkedin ? (
                  <a
                    href={social.linkedin.startsWith("http") ? social.linkedin : `https://${social.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-black/60"
                  >
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                ) : null}
                {social?.github ? (
                  <a
                    href={social.github.startsWith("http") ? social.github : `https://${social.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-black/60"
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

            <div className="no-print relative mt-8 flex flex-wrap gap-3">
              {data.cvUrl ? (
                <a
                  href={data.cvUrl}
                  download={data.cvFileName || `${data.fullName}-CV`}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-300 px-5 py-2.5 text-sm font-semibold text-black"
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

          <section className="space-y-8">
            <div className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:grid-cols-2 md:p-10">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-primary">Who I am</p>
                <h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
                  {aboutTitle}
                </h2>
              </div>
              <p className="text-muted-foreground md:text-lg">
                {aboutText}
              </p>
            </div>

            <h2 className="font-display text-2xl font-semibold md:text-3xl">Selected work</h2>
            <div className="space-y-6">
              {data.projects.map((project, idx) => (
                <motion.article
                  key={project.id}
                  className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b111d] md:rounded-[2rem]"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                >
                  {((project.imageUrls?.length ?? 0) > 0 || project.imageUrl || (project.videoUrls?.length ?? 0) > 0) ? (
                    <div className="p-4 md:p-5">
                      {(project.imageUrls?.length ?? 0) > 0 || project.imageUrl ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {projectImageUrls(project).map((img, i) => (
                            <button
                              key={`${project.id}-img-${i}`}
                              type="button"
                              onClick={() => setLightbox({ urls: projectImageUrls(project), index: i })}
                              className="group overflow-hidden rounded-xl border border-white/10 bg-black text-left"
                            >
                              <img
                                src={img}
                                alt={`${project.title} preview ${i + 1}`}
                                className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03] md:h-72"
                              />
                            </button>
                          ))}
                        </div>
                      ) : null}
                      {(project.videoUrls?.length ?? 0) > 0 ? (
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {(project.videoUrls ?? []).map((video, i) => (
                            <div key={`${project.id}-video-${i}`} className="overflow-hidden rounded-xl border border-white/10 bg-black">
                              <video src={video} controls className="h-56 w-full object-cover md:h-72" />
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-semibold md:text-3xl">{project.title}</h3>
                        {project.role ? (
                          <p className="mt-1 text-sm font-medium uppercase tracking-[0.08em] text-primary">{project.role}</p>
                        ) : null}
                      </div>
                      {project.link ? (
                        <a
                          href={project.link.startsWith("http") ? project.link : `https://${project.link}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-medium transition hover:bg-white/20"
                          onClick={() => trackProjectClick(data.slug)}
                        >
                          View work
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      ) : null}
                    </div>
                    <p className="mt-4 max-w-4xl leading-relaxed text-muted-foreground md:text-lg">{project.summary}</p>
                    {project.problem?.trim() || project.outcome?.trim() ? (
                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {project.problem?.trim() ? (
                          <div className="rounded-xl border border-white/10 bg-black/25 p-4 md:p-5">
                            <p className="text-xs font-medium uppercase tracking-[0.12em] text-primary">Challenge</p>
                            <p className="mt-2 text-sm leading-relaxed text-white/85 md:text-base">{project.problem.trim()}</p>
                          </div>
                        ) : null}
                        {project.outcome?.trim() ? (
                          <div className="rounded-xl border border-white/10 bg-black/25 p-4 md:p-5">
                            <p className="text-xs font-medium uppercase tracking-[0.12em] text-emerald-400/90">Outcome</p>
                            <p className="mt-2 text-sm leading-relaxed text-white/85 md:text-base">{project.outcome.trim()}</p>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    {cleanTags(project.stack).length > 0 ? (
                      <div className="mt-6">
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Tools &amp; stack</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {cleanTags(project.stack).map((tool) => (
                            <span
                              key={`${project.id}-stack-${tool}`}
                              className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-xs text-white/75"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {cleanTags(project.tags).length > 0 ? (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {cleanTags(project.tags).map((tag) => (
                          <span
                            key={`${project.id}-${tag}`}
                            className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.06em] text-muted-foreground"
                          >
                            {tag}
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

      {lightbox ? (
        <div
          className="no-print fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
          role="presentation"
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-6xl items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute right-2 top-2 z-10 rounded-full border border-white/20 bg-black/70 px-3 py-1.5 text-xs text-white"
            >
              Close
            </button>
            {lightbox.urls.length > 1 ? (
              <button
                type="button"
                aria-label="Previous image"
                onClick={() =>
                  setLightbox((prev) =>
                    prev
                      ? {
                          ...prev,
                          index: (prev.index - 1 + prev.urls.length) % prev.urls.length,
                        }
                      : prev,
                  )
                }
                className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/70 p-2 text-white md:left-2"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            ) : null}
            {lightbox.urls.length > 1 ? (
              <button
                type="button"
                aria-label="Next image"
                onClick={() =>
                  setLightbox((prev) =>
                    prev ? { ...prev, index: (prev.index + 1) % prev.urls.length } : prev,
                  )
                }
                className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/70 p-2 text-white md:right-2"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            ) : null}
            <img
              src={lightbox.urls[lightbox.index]}
              alt="Expanded project image"
              className="max-h-[88vh] w-auto max-w-[92vw] rounded-xl border border-white/15 object-contain"
            />
            {lightbox.urls.length > 1 ? (
              <p className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white/80">
                {lightbox.index + 1} / {lightbox.urls.length}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <SiteFooter />
    </div>
  );
};

export default Portfolio;
