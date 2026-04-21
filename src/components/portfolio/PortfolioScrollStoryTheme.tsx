import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
} from "lucide-react";
import { useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Link } from "react-router-dom";
import { SiteFooter } from "@/components/SiteFooter";
import { trackProjectClick } from "@/lib/analytics-service";
import type { PortfolioRecord } from "@/lib/portfolio-service";
import type { PortfolioProject } from "@/types/portfolio";

/** Dark developer canvas */
const S = {
  bg: "#09090b",
  surface: "#0c0c0f",
  elevated: "#12121a",
  border: "rgba(255,255,255,0.08)",
  ink: "#fafafa",
  muted: "#a1a1aa",
  dim: "#71717a",
  accent: "#34d399",
  accent2: "#22d3ee",
} as const;

function projectImageUrls(project: PortfolioProject): string[] {
  if (project.imageUrls?.length) return project.imageUrls;
  if (project.imageUrl) return [project.imageUrl];
  return [];
}

const cleanTags = (tags?: string) =>
  (tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 56 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
};

const popItem: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const DIR = 52;

/** Cycle: up → down → left → right — one-at-a-time via parent stagger */
function enterFromDirVariants(index: number): Variants {
  const mod = index % 4;
  const hidden =
    mod === 0
      ? { opacity: 0, y: -DIR }
      : mod === 1
        ? { opacity: 0, y: DIR }
        : mod === 2
          ? { opacity: 0, x: -DIR }
          : { opacity: 0, x: DIR };
  return {
    hidden,
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
    },
  };
}

const dirStaggerParent: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.14, delayChildren: 0.05 },
  },
};

/** Re-run section entrances whenever blocks scroll into view again (disabled when reduced motion). */
function scrollViewport(reduceMotion: boolean | null) {
  return reduceMotion
    ? { once: true as const, amount: 0.15 as const }
    : { once: false as const, amount: 0.18 as const, margin: "0px 0px -14% 0px" as const };
}

type Props = {
  data: PortfolioRecord;
  heroImage: string;
  aboutTitle: string;
  aboutText: string;
  hasSocial: boolean;
  social: PortfolioRecord["socialLinks"];
  visitorChrome: boolean;
  isOwner: boolean;
  user: { id: string } | null;
  hasApi: boolean;
  lightbox: { urls: string[]; index: number } | null;
  setLightbox: Dispatch<SetStateAction<{ urls: string[]; index: number } | null>>;
  setVisitorPreview: (next: boolean) => void;
};

export function PortfolioScrollStoryTheme({
  data,
  heroImage,
  aboutTitle,
  aboutText,
  hasSocial,
  social,
  visitorChrome,
  isOwner,
  user,
  hasApi,
  lightbox,
  setLightbox,
  setVisitorPreview,
}: Props) {
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLSectionElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.94]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -48]);
  const heroBlur = useTransform(scrollYProgress, [0, 0.45], [0, 6]);
  const heroFilter = useTransform(heroBlur, (v) => `blur(${v}px)`);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const bioTrim = data.bio?.trim() ?? "";
  const aboutTrim = aboutText.trim();
  const bioSameAsAbout = Boolean(bioTrim && aboutTrim && bioTrim === aboutTrim);

  const hasSeoMeta =
    Boolean(social?.seoTitle?.trim()) ||
    Boolean(social?.seoDescription?.trim()) ||
    Boolean(social?.seoOgImageUrl?.trim());

  const hasConnect =
    Boolean(data.email?.trim()) ||
    Boolean(data.location?.trim()) ||
    Boolean(data.cvUrl) ||
    hasSocial;

  return (
    <div
      className="min-h-screen text-zinc-100 antialiased"
      style={{ backgroundColor: S.bg, fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif' }}
    >
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage: `linear-gradient(rgba(52,211,153,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.03) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/[0.08] bg-[#09090b]/90 px-5 py-4 backdrop-blur-md md:px-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <span className="font-mono text-xs font-medium tracking-tight text-emerald-400/90">
            <span className="text-zinc-500">~/</span>
            {data.slug || "portfolio"}
          </span>
          <nav className="flex flex-wrap items-center gap-5 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-zinc-500">
            <button type="button" onClick={() => scrollTo("connect")} className="transition hover:text-emerald-400">
              Connect
            </button>
            <button type="button" onClick={() => scrollTo("story")} className="transition hover:text-cyan-400">
              Story
            </button>
            <button type="button" onClick={() => scrollTo("work")} className="transition hover:text-amber-400">
              Work
            </button>
            {data.email ? (
              <a href={`mailto:${data.email}`} className="inline-flex items-center gap-1.5 text-cyan-400/90 transition hover:text-cyan-300">
                <Mail className="h-3.5 w-3.5" />
                Email
              </a>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="relative z-[1]">
        {/* Layer 1 */}
        <section
          ref={heroRef}
          className="relative flex min-h-[100dvh] flex-col justify-center px-5 pb-24 pt-28 md:px-10 md:pb-32 md:pt-32"
        >
          <motion.div
            className="mx-auto w-full max-w-3xl text-center"
            style={
              reduceMotion
                ? undefined
                : {
                    opacity: heroOpacity,
                    scale: heroScale,
                    y: heroY,
                    filter: heroFilter,
                  }
            }
          >
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-emerald-400/90">{data.headline}</p>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">{data.fullName}</h1>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-zinc-400 md:text-xl">{aboutTitle}</p>
            <div className="mx-auto mt-12 max-w-lg">
              {heroImage ? (
                <button
                  type="button"
                  onClick={() => setLightbox({ urls: [heroImage], index: 0 })}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 shadow-2xl shadow-emerald-500/5 transition hover:opacity-95"
                >
                  <img src={heroImage} alt="" className="aspect-[16/10] w-full object-cover md:aspect-[2/1]" />
                </button>
              ) : (
                <div className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl border border-dashed border-white/15 bg-zinc-900/40 font-mono text-sm text-zinc-600">
                  profile_image — optional
                </div>
              )}
            </div>
            <p
              className={`mt-14 text-xs font-medium uppercase tracking-[0.25em] text-zinc-600 ${reduceMotion ? "" : "animate-bounce"}`}
            >
              Scroll
            </p>
          </motion.div>
        </section>

        {/* Contact & links — everything from the editor’s profile strip */}
        {hasConnect ? (
          <motion.section
            id="connect"
            className="scroll-mt-24 border-t border-white/[0.08] px-5 py-20 md:px-10 md:py-24"
            style={{ backgroundColor: S.surface }}
            initial="hidden"
            whileInView="show"
            viewport={scrollViewport(reduceMotion)}
            variants={sectionVariants}
          >
            <div className="mx-auto max-w-4xl">
              <h2 className="font-mono text-xs uppercase tracking-[0.35em] text-emerald-400/90">Connect</h2>
              <p className="mt-3 text-sm text-zinc-500">Get in touch for collaborations, freelance work, or full-time opportunities.</p>
              <motion.div
                className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                variants={dirStaggerParent}
                initial="hidden"
                whileInView="show"
                viewport={scrollViewport(reduceMotion)}
              >
                {(() => {
                  let i = 0;
                  return (
                    <>
                      {data.email ? (
                        <motion.a
                          href={`mailto:${data.email}`}
                          variants={enterFromDirVariants(i++)}
                          className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-zinc-950/80 p-4 transition hover:border-emerald-500/30"
                        >
                          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                          <div>
                            <p className="font-mono text-[0.65rem] uppercase tracking-wider text-zinc-500">Email</p>
                            <p className="mt-1 break-all text-sm text-zinc-200">{data.email}</p>
                          </div>
                        </motion.a>
                      ) : null}
                      {data.location ? (
                        <motion.div variants={enterFromDirVariants(i++)} className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-zinc-950/80 p-4">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                          <div>
                            <p className="font-mono text-[0.65rem] uppercase tracking-wider text-zinc-500">Location</p>
                            <p className="mt-1 text-sm text-zinc-200">{data.location}</p>
                          </div>
                        </motion.div>
                      ) : null}
                      {data.cvUrl ? (
                        <motion.a
                          href={data.cvUrl}
                          download={data.cvFileName || `${data.fullName}-CV`}
                          variants={enterFromDirVariants(i++)}
                          className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-zinc-950/80 p-4 transition hover:border-amber-500/30"
                        >
                          <FileDown className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                          <div>
                            <p className="font-mono text-[0.65rem] uppercase tracking-wider text-zinc-500">Résumé</p>
                            <p className="mt-1 text-sm text-zinc-200">Download CV</p>
                          </div>
                        </motion.a>
                      ) : null}
                      {social?.website ? (
                        <motion.a
                          href={social.website.startsWith("http") ? social.website : `https://${social.website}`}
                          target="_blank"
                          rel="noreferrer"
                          variants={enterFromDirVariants(i++)}
                          className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-zinc-950/80 p-4 transition hover:border-cyan-500/30"
                        >
                          <Globe className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                          <div>
                            <p className="font-mono text-[0.65rem] uppercase tracking-wider text-zinc-500">Website</p>
                            <p className="mt-1 break-all text-sm text-zinc-200">{social.website}</p>
                          </div>
                        </motion.a>
                      ) : null}
                      {social?.linkedin ? (
                        <motion.a
                          href={social.linkedin.startsWith("http") ? social.linkedin : `https://${social.linkedin}`}
                          target="_blank"
                          rel="noreferrer"
                          variants={enterFromDirVariants(i++)}
                          className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-zinc-950/80 p-4 transition hover:border-cyan-500/30"
                        >
                          <Linkedin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                          <div>
                            <p className="font-mono text-[0.65rem] uppercase tracking-wider text-zinc-500">LinkedIn</p>
                            <p className="mt-1 break-all text-sm text-zinc-200">{social.linkedin}</p>
                          </div>
                        </motion.a>
                      ) : null}
                      {social?.github ? (
                        <motion.a
                          href={social.github.startsWith("http") ? social.github : `https://${social.github}`}
                          target="_blank"
                          rel="noreferrer"
                          variants={enterFromDirVariants(i++)}
                          className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-zinc-950/80 p-4 transition hover:border-zinc-500/50"
                        >
                          <Github className="mt-0.5 h-4 w-4 shrink-0 text-zinc-300" />
                          <div>
                            <p className="font-mono text-[0.65rem] uppercase tracking-wider text-zinc-500">GitHub</p>
                            <p className="mt-1 break-all text-sm text-zinc-200">{social.github}</p>
                          </div>
                        </motion.a>
                      ) : null}
                    </>
                  );
                })()}
              </motion.div>
            </div>
          </motion.section>
        ) : null}

        {/* Bio + about copy from the editor (About title & text + bio field) */}
        <section id="story" className="scroll-mt-24 border-t border-white/[0.08] px-5 py-20 md:px-10 md:py-28">
          <motion.div
            className="mx-auto max-w-3xl"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={scrollViewport(reduceMotion)}
          >
            {bioTrim && !bioSameAsAbout ? (
              <motion.div variants={popItem} className="rounded-2xl border border-white/[0.08] bg-zinc-950/40 p-8 md:p-10">
                <h2 className="font-mono text-xs uppercase tracking-[0.35em] text-cyan-400/90">Bio</h2>
                <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-zinc-300 md:text-lg">{data.bio}</p>
              </motion.div>
            ) : null}
            <motion.div
              variants={popItem}
              className={`rounded-2xl border border-white/[0.08] bg-gradient-to-b from-emerald-950/20 to-transparent p-8 md:p-10 ${bioTrim && !bioSameAsAbout ? "mt-10" : ""}`}
            >
              <h2 className="font-mono text-xs uppercase tracking-[0.35em] text-emerald-400/90">{aboutTitle}</h2>
              <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-zinc-300 md:text-lg">{aboutText}</p>
            </motion.div>
          </motion.div>
        </section>

        {/* Projects — full case-study fields from the editor */}
        <motion.section
          id="work"
          className="scroll-mt-24 border-t border-white/[0.08] px-5 py-24 md:px-10 md:py-32"
          style={{ backgroundColor: S.elevated }}
          initial="hidden"
          whileInView="show"
          viewport={scrollViewport(reduceMotion)}
          variants={sectionVariants}
        >
          <div className="mx-auto max-w-4xl">
            <h2 className="font-mono text-xs uppercase tracking-[0.35em] text-amber-400/90">Selected work</h2>
            <p className="mt-4 max-w-2xl text-2xl font-semibold leading-tight text-white md:text-3xl">Projects & case studies</p>
            <p className="mt-3 text-sm text-zinc-500">
              Selected projects with context, outcomes, tools, and supporting visuals.
            </p>

            {data.projects.length === 0 ? (
              <p className="mt-12 font-mono text-sm text-zinc-600">{isOwner ? "Add projects from your dashboard." : "Nothing here yet."}</p>
            ) : (
              <motion.div className="mt-16 space-y-16" variants={staggerContainer} initial="hidden" whileInView="show" viewport={scrollViewport(reduceMotion)}>
                {data.projects.map((project) => {
                  const urls = projectImageUrls(project);
                  const tagList = cleanTags(project.tags);
                  return (
                    <motion.article key={project.id} variants={popItem} className="rounded-2xl border border-white/[0.08] bg-[#0a0a0d] p-6 md:p-10">
                      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
                        <div className="space-y-4">
                          {urls.length > 0 ? (
                            <motion.div
                              className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                              variants={dirStaggerParent}
                              initial="hidden"
                              whileInView="show"
                              viewport={scrollViewport(reduceMotion)}
                            >
                              {urls.map((url, i) => (
                                <motion.button
                                  key={`${project.id}-img-${i}`}
                                  type="button"
                                  variants={enterFromDirVariants(i)}
                                  onClick={() => setLightbox({ urls, index: i })}
                                  className="overflow-hidden rounded-lg border border-white/[0.06] text-left transition hover:opacity-95"
                                >
                                  <img src={url} alt="" className="aspect-square w-full object-cover sm:aspect-[4/3]" />
                                </motion.button>
                              ))}
                            </motion.div>
                          ) : (
                            <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-white/10 font-mono text-xs text-zinc-600">
                              No images
                            </div>
                          )}
                          {(project.videoUrls?.length ?? 0) > 0 ? (
                            <motion.div
                              className="overflow-hidden rounded-lg border border-white/[0.06]"
                              variants={enterFromDirVariants(urls.length)}
                              initial="hidden"
                              whileInView="show"
                              viewport={scrollViewport(reduceMotion)}
                            >
                              <video src={project.videoUrls?.[0]} controls className="aspect-video w-full object-cover" />
                            </motion.div>
                          ) : null}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">{project.title}</h3>
                          {project.role ? (
                            <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">{project.role}</p>
                          ) : null}
                          <p className="mt-5 leading-relaxed text-zinc-400">{project.summary}</p>
                          {project.problem ? (
                            <div className="mt-8 border-l-2 border-amber-500/50 pl-4">
                              <p className="font-mono text-[0.65rem] uppercase tracking-wider text-amber-500/90">Context / problem</p>
                              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{project.problem}</p>
                            </div>
                          ) : null}
                          {project.outcome ? (
                            <div className="mt-6 border-l-2 border-emerald-500/50 pl-4">
                              <p className="font-mono text-[0.65rem] uppercase tracking-wider text-emerald-400/90">Outcomes</p>
                              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{project.outcome}</p>
                            </div>
                          ) : null}
                          {project.stack ? (
                            <p className="mt-6 font-mono text-xs text-zinc-500">
                              <span className="text-zinc-600">Stack:</span> {project.stack}
                            </p>
                          ) : null}
                          {tagList.length > 0 ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {tagList.map((t) => (
                                <span key={t} className="rounded-md border border-white/10 bg-zinc-900/80 px-2.5 py-1 font-mono text-[0.65rem] text-zinc-400">
                                  {t}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          {project.link ? (
                            <a
                              href={project.link.startsWith("http") ? project.link : `https://${project.link}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
                              onClick={() => trackProjectClick(data.slug)}
                            >
                              View project
                              <ArrowUpRight className="h-4 w-4" />
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Optional: link preview fields (editor “Link previews”) — dev-facing meta */}
        {hasSeoMeta ? (
          <motion.section
            className="border-t border-white/[0.08] px-5 py-16 md:px-10"
            style={{ backgroundColor: S.bg }}
            initial="hidden"
            whileInView="show"
            viewport={scrollViewport(reduceMotion)}
            variants={sectionVariants}
          >
            <div className="mx-auto max-w-3xl">
              <details className="group rounded-xl border border-white/[0.06] bg-zinc-950/50 p-5">
                <summary className="cursor-pointer font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 marker:text-zinc-600">
                  Link preview &amp; SEO meta
                </summary>
                <div className="mt-6 space-y-4 text-sm text-zinc-400">
                  {social?.seoTitle ? (
                    <p>
                      <span className="font-mono text-[0.65rem] text-zinc-600">og:title · </span>
                      {social.seoTitle}
                    </p>
                  ) : null}
                  {social?.seoDescription ? (
                    <p className="whitespace-pre-wrap">
                      <span className="font-mono text-[0.65rem] text-zinc-600">description · </span>
                      {social.seoDescription}
                    </p>
                  ) : null}
                  {social?.seoOgImageUrl ? (
                    <p className="break-all">
                      <span className="font-mono text-[0.65rem] text-zinc-600">og:image · </span>
                      {social.seoOgImageUrl}
                    </p>
                  ) : null}
                </div>
              </details>
            </div>
          </motion.section>
        ) : null}

        <section className="no-print border-t border-white/[0.08] px-5 py-12 md:px-10" style={{ backgroundColor: S.surface }}>
          <div className="mx-auto flex max-w-5xl flex-wrap gap-3">
            {data.cvUrl ? (
              <a
                href={data.cvUrl}
                download={data.cvFileName || `${data.fullName}-CV`}
                className="rounded-full border border-white/15 bg-zinc-900/80 px-5 py-2.5 text-sm text-zinc-200 transition hover:border-emerald-500/40"
              >
                Download CV
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-500 transition hover:bg-white/5"
            >
              Print / PDF
            </button>
            {visitorChrome ? (
              <>
                {!user && hasApi ? (
                  <Link to="/auth" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-500">
                    Create your portfolio
                  </Link>
                ) : null}
                {user && !isOwner ? (
                  <Link to="/app" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-500">
                    Dashboard
                  </Link>
                ) : null}
              </>
            ) : (
              <>
                <Link to="/app" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-500">
                  Edit in dashboard
                </Link>
                <button type="button" onClick={() => setVisitorPreview(true)} className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-500">
                  Preview as visitor
                </button>
              </>
            )}
          </div>
          <div className="mx-auto mt-10 max-w-5xl text-center">
            {data.showPoweredBy ? (
              <p className="text-xs text-zinc-600">
                Made with{" "}
                <Link to="/" className="underline underline-offset-4 hover:text-emerald-500">
                  PortfolioForge
                </Link>
              </p>
            ) : null}
            <Link to="/" className="mt-3 block text-sm text-zinc-600 hover:text-zinc-400">
              ← Home
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />

      {lightbox ? (
        <div
          className="no-print fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setLightbox(null)}
          role="presentation"
        >
          <div className="relative flex max-h-[92vh] w-full max-w-6xl items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setLightbox(null)} className="absolute right-2 top-2 z-10 rounded-full border border-white/20 bg-zinc-950/90 px-3 py-1.5 text-xs text-white">
              Close
            </button>
            {lightbox.urls.length > 1 ? (
              <button
                type="button"
                aria-label="Previous"
                onClick={() =>
                  setLightbox((prev) =>
                    prev ? { ...prev, index: (prev.index - 1 + prev.urls.length) % prev.urls.length } : prev,
                  )
                }
                className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-zinc-950/90 p-2 text-white md:left-2"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            ) : null}
            {lightbox.urls.length > 1 ? (
              <button
                type="button"
                aria-label="Next"
                onClick={() => setLightbox((prev) => (prev ? { ...prev, index: (prev.index + 1) % prev.urls.length } : prev))}
                className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-zinc-950/90 p-2 text-white md:right-2"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            ) : null}
            <img src={lightbox.urls[lightbox.index]} alt="" className="max-h-[88vh] w-auto max-w-[92vw] rounded-xl border border-white/10 object-contain" />
            {lightbox.urls.length > 1 ? (
              <p className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs text-zinc-300">
                {lightbox.index + 1} / {lightbox.urls.length}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

