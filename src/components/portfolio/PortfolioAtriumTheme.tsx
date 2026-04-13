import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  ArrowDown,
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
import { useRef, type Dispatch, type SetStateAction } from "react";
import { Link } from "react-router-dom";
import { SiteFooter } from "@/components/SiteFooter";
import { trackProjectClick } from "@/lib/analytics-service";
import type { PortfolioRecord } from "@/lib/portfolio-service";
import type { PortfolioProject } from "@/types/portfolio";

/** Night conservatory — aurora glass, numbered cases, editorial rhythm */
const A = {
  void: "#030306",
  panel: "#0a0a10",
  violet: "#a78bfa",
  mint: "#5eead4",
  rose: "#fda4af",
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

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};

function scrollViewport(reduceMotion: boolean | null) {
  return reduceMotion
    ? { once: true as const, amount: 0.15 as const }
    : { once: false as const, amount: 0.2 as const, margin: "0px 0px -12% 0px" as const };
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

export function PortfolioAtriumTheme({
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
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroBgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const heroDim = useTransform(scrollYProgress, [0, 0.55], [1, 0.35]);

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

  const firstProjectThumb = data.projects[0] ? projectImageUrls(data.projects[0])[0] : undefined;

  return (
    <div
      className="min-h-screen overflow-x-hidden text-[#e8e6f4] antialiased selection:bg-violet-500/30 selection:text-white"
      style={{
        backgroundColor: A.void,
        fontFamily: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
      }}
    >
      {/* Aurora mesh */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute -left-[20%] top-[-10%] h-[70vmin] w-[70vmin] rounded-full opacity-50 blur-[100px]"
          style={{
            background: `radial-gradient(circle, ${A.violet}55 0%, transparent 65%)`,
            y: heroBgY,
          }}
        />
        <motion.div
          className="absolute -right-[15%] top-[20%] h-[55vmin] w-[55vmin] rounded-full opacity-40 blur-[90px]"
          style={{
            background: `radial-gradient(circle, ${A.mint}44 0%, transparent 60%)`,
            y: heroBgY,
          }}
        />
        <motion.div
          className="absolute bottom-[-20%] left-[25%] h-[45vmin] w-[45vmin] rounded-full opacity-35 blur-[85px]"
          style={{ background: `radial-gradient(circle, ${A.rose}33 0%, transparent 62%)` }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/[0.06] bg-[#030306]/75 px-5 py-4 backdrop-blur-xl md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] font-mono text-xs font-bold text-violet-200/90" aria-hidden>
              A
            </span>
            <div className="leading-tight">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.35em] text-zinc-500">Portfolio</p>
              <p className="text-sm font-medium text-zinc-200">{data.slug || "studio"}</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-zinc-500 sm:flex">
            <button type="button" onClick={() => scrollTo("garden")} className="transition hover:text-violet-300">
              Story
            </button>
            <button type="button" onClick={() => scrollTo("cases")} className="transition hover:text-teal-300">
              Work
            </button>
            <button type="button" onClick={() => scrollTo("reach")} className="transition hover:text-rose-200">
              Contact
            </button>
          </nav>
        </div>
      </header>

      <main className="relative z-[1]">
        <section
          ref={heroRef}
          className="relative flex min-h-[100dvh] flex-col justify-end px-5 pb-16 pt-28 md:px-10 md:pb-24 md:pt-32"
        >
          {firstProjectThumb ? (
            <motion.div
              className="pointer-events-none absolute inset-0 z-0"
              style={{ opacity: heroDim }}
              aria-hidden
            >
              <img src={firstProjectThumb} alt="" className="h-full w-full object-cover opacity-30 blur-3xl" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#030306] via-[#030306]/80 to-[#030306]" />
            </motion.div>
          ) : null}

          <div className="relative z-[1] mx-auto w-full max-w-6xl">
            <motion.div variants={stagger} initial="hidden" animate="show">
              <motion.p
                variants={fadeUp}
                className="font-medium uppercase tracking-[0.45em] text-violet-300/90"
              >
                {data.headline}
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="mt-6 max-w-4xl text-5xl font-bold leading-[0.95] tracking-tight text-white md:text-7xl lg:text-8xl"
              >
                <span className="bg-gradient-to-br from-white via-violet-100 to-teal-200/90 bg-clip-text text-transparent">
                  {data.fullName}
                </span>
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
                {aboutTitle}
              </motion.p>
              <motion.div variants={fadeUp} className="mt-12 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => scrollTo("cases")}
                  className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-violet-400/40 hover:bg-white/[0.1]"
                >
                  View selected work
                  <ArrowDown className="h-4 w-4 transition group-hover:translate-y-0.5" />
                </button>
                {data.email ? (
                  <a
                    href={`mailto:${data.email}`}
                    className="text-sm font-medium text-zinc-500 underline-offset-4 transition hover:text-teal-300 hover:underline"
                  >
                    {data.email}
                  </a>
                ) : null}
              </motion.div>
            </motion.div>

            <motion.div
              className="mt-16 grid gap-6 lg:grid-cols-12 lg:items-end"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="lg:col-span-5">
                {heroImage ? (
                  <button
                    type="button"
                    onClick={() => setLightbox({ urls: [heroImage], index: 0 })}
                    className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 shadow-2xl shadow-violet-500/10 transition hover:border-violet-400/25"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030306]/60 to-transparent opacity-80 transition group-hover:opacity-60" />
                    <img src={heroImage} alt="" className="aspect-[5/4] w-full object-cover md:aspect-[16/10]" />
                    <span className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-wider text-zinc-300 backdrop-blur-md">
                      Profile
                    </span>
                  </button>
                ) : (
                  <div className="flex aspect-[5/4] w-full items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] font-mono text-sm text-zinc-600 md:aspect-[16/10]">
                    Add a profile image
                  </div>
                )}
              </div>
              <div className="lg:col-span-7 lg:pl-8">
                <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-transparent p-6 md:p-8">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-violet-300/80">At a glance</p>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-400 md:text-base">
                    {aboutText.slice(0, 280)}
                    {aboutText.length > 280 ? "…" : ""}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {data.location ? (
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-400">
                        {data.location}
                      </span>
                    ) : null}
                    <span className="rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs text-teal-200/90">
                      {data.projects.length} project{data.projects.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Story */}
        <section id="garden" className="scroll-mt-24 border-t border-white/[0.06] px-5 py-24 md:px-10 md:py-32">
          <motion.div
            className="mx-auto max-w-3xl"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={scrollViewport(reduceMotion)}
          >
            {bioTrim && !bioSameAsAbout ? (
              <motion.div variants={fadeUp} className="rounded-3xl border border-white/[0.08] bg-[#0a0a10]/80 p-8 backdrop-blur-sm md:p-12">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-rose-300/90">Bio</p>
                <p className="mt-6 whitespace-pre-wrap text-lg leading-relaxed text-zinc-300">{data.bio}</p>
              </motion.div>
            ) : null}
            <motion.div
              variants={fadeUp}
              className={`rounded-3xl border border-white/[0.08] bg-gradient-to-b from-violet-950/20 to-transparent p-8 md:p-12 ${bioTrim && !bioSameAsAbout ? "mt-10" : ""}`}
            >
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-violet-300/90">{aboutTitle}</p>
              <p className="mt-6 whitespace-pre-wrap text-lg leading-relaxed text-zinc-300">{aboutText}</p>
            </motion.div>
          </motion.div>
        </section>

        {/* Work */}
        <section
          id="cases"
          className="scroll-mt-24 border-t border-white/[0.06] px-5 py-24 md:px-10 md:py-32"
          style={{ background: `linear-gradient(180deg, ${A.void} 0%, #08081a 50%, ${A.void} 100%)` }}
        >
          <motion.div
            className="mx-auto max-w-6xl"
            initial="hidden"
            whileInView="show"
            viewport={scrollViewport(reduceMotion)}
            variants={fadeUp}
          >
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.35em] text-teal-300/90">Selected work</p>
                <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">Case studies</h2>
                <p className="mt-4 max-w-xl text-zinc-500">
                  Full narrative: role, context, outcomes, and media — pulled from your dashboard.
                </p>
              </div>
              <div className="hidden h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent md:block" />
            </div>

            {data.projects.length === 0 ? (
              <p className="mt-16 font-mono text-sm text-zinc-600">
                {isOwner ? "Add projects from your dashboard to fill this conservatory." : "Nothing planted yet."}
              </p>
            ) : (
              <div className="mt-20 space-y-28 md:space-y-36">
                {data.projects.map((project, pi) => {
                  const urls = projectImageUrls(project);
                  const tagList = cleanTags(project.tags);
                  const flip = pi % 2 === 1;
                  return (
                    <motion.article
                      key={project.id}
                      initial="hidden"
                      whileInView="show"
                      viewport={scrollViewport(reduceMotion)}
                      variants={fadeUp}
                      className="relative"
                    >
                      <div
                        className={`flex flex-col gap-10 lg:gap-16 ${flip ? "lg:flex-row-reverse" : "lg:flex-row"} lg:items-start`}
                      >
                        <div className="relative lg:w-[52%]">
                          <span className="absolute -left-1 -top-8 font-mono text-7xl font-bold tabular-nums text-white/[0.04] md:-top-10 md:text-8xl">
                            {String(pi + 1).padStart(2, "0")}
                          </span>
                          {urls.length > 0 ? (
                            <div className={`grid gap-3 ${urls.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"}`}>
                              {urls.map((url, i) => (
                                <button
                                  key={`${project.id}-img-${i}`}
                                  type="button"
                                  onClick={() => setLightbox({ urls, index: i })}
                                  className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/50 transition hover:border-violet-400/30"
                                >
                                  <img
                                    src={url}
                                    alt=""
                                    className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.03] sm:aspect-[4/3]"
                                  />
                                  <span className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition group-hover:opacity-100" />
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-white/12 font-mono text-xs text-zinc-600">
                              No images
                            </div>
                          )}
                          {(project.videoUrls?.length ?? 0) > 0 ? (
                            <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.08]">
                              <video src={project.videoUrls?.[0]} controls className="aspect-video w-full object-cover" />
                            </div>
                          ) : null}
                        </div>

                        <div className="flex-1 lg:pt-4">
                          <h3 className="text-3xl font-bold text-white md:text-4xl">{project.title}</h3>
                          {project.role ? (
                            <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">{project.role}</p>
                          ) : null}
                          <p className="mt-6 text-base leading-relaxed text-zinc-400">{project.summary}</p>
                          {project.problem ? (
                            <div className="mt-8 border-l-2 border-violet-500/40 pl-5">
                              <p className="font-mono text-[0.65rem] uppercase tracking-wider text-violet-300/90">Context</p>
                              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{project.problem}</p>
                            </div>
                          ) : null}
                          {project.outcome ? (
                            <div className="mt-6 border-l-2 border-teal-500/40 pl-5">
                              <p className="font-mono text-[0.65rem] uppercase tracking-wider text-teal-300/90">Outcomes</p>
                              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{project.outcome}</p>
                            </div>
                          ) : null}
                          {project.stack ? (
                            <p className="mt-6 font-mono text-xs text-zinc-500">
                              <span className="text-zinc-600">Stack · </span>
                              {project.stack}
                            </p>
                          ) : null}
                          {tagList.length > 0 ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {tagList.map((t) => (
                                <span
                                  key={t}
                                  className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[0.65rem] text-zinc-400"
                                >
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
                              className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-teal-300 transition hover:text-teal-200"
                              onClick={() => trackProjectClick(data.slug)}
                            >
                              Open project
                              <ArrowUpRight className="h-4 w-4" />
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </motion.div>
        </section>

        {/* Contact */}
        {hasConnect ? (
          <section id="reach" className="scroll-mt-24 border-t border-white/[0.06] px-5 py-24 md:px-10 md:py-28">
            <motion.div
              className="mx-auto max-w-4xl"
              initial="hidden"
              whileInView="show"
              viewport={scrollViewport(reduceMotion)}
              variants={fadeUp}
            >
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-rose-200/80">Reach</p>
              <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">Let&apos;s build something luminous</h2>
              <div className="mt-12 grid gap-4 sm:grid-cols-2">
                {data.email ? (
                  <a
                    href={`mailto:${data.email}`}
                    className="flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-violet-400/35"
                  >
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" />
                    <div>
                      <p className="font-mono text-[0.65rem] uppercase tracking-wider text-zinc-500">Email</p>
                      <p className="mt-1 break-all text-sm text-zinc-200">{data.email}</p>
                    </div>
                  </a>
                ) : null}
                {data.location ? (
                  <div className="flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" />
                    <div>
                      <p className="font-mono text-[0.65rem] uppercase tracking-wider text-zinc-500">Location</p>
                      <p className="mt-1 text-sm text-zinc-200">{data.location}</p>
                    </div>
                  </div>
                ) : null}
                {data.cvUrl ? (
                  <a
                    href={data.cvUrl}
                    download={data.cvFileName || `${data.fullName}-CV`}
                    className="flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-amber-400/35"
                  >
                    <FileDown className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                    <div>
                      <p className="font-mono text-[0.65rem] uppercase tracking-wider text-zinc-500">Résumé</p>
                      <p className="mt-1 text-sm text-zinc-200">Download CV</p>
                    </div>
                  </a>
                ) : null}
                {social?.website ? (
                  <a
                    href={social.website.startsWith("http") ? social.website : `https://${social.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-teal-400/35"
                  >
                    <Globe className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" />
                    <div>
                      <p className="font-mono text-[0.65rem] uppercase tracking-wider text-zinc-500">Website</p>
                      <p className="mt-1 break-all text-sm text-zinc-200">{social.website}</p>
                    </div>
                  </a>
                ) : null}
                {social?.linkedin ? (
                  <a
                    href={social.linkedin.startsWith("http") ? social.linkedin : `https://${social.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-cyan-400/35"
                  >
                    <Linkedin className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                    <div>
                      <p className="font-mono text-[0.65rem] uppercase tracking-wider text-zinc-500">LinkedIn</p>
                      <p className="mt-1 break-all text-sm text-zinc-200">{social.linkedin}</p>
                    </div>
                  </a>
                ) : null}
                {social?.github ? (
                  <a
                    href={social.github.startsWith("http") ? social.github : `https://${social.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-zinc-400/40"
                  >
                    <Github className="mt-0.5 h-5 w-5 shrink-0 text-zinc-300" />
                    <div>
                      <p className="font-mono text-[0.65rem] uppercase tracking-wider text-zinc-500">GitHub</p>
                      <p className="mt-1 break-all text-sm text-zinc-200">{social.github}</p>
                    </div>
                  </a>
                ) : null}
              </div>
            </motion.div>
          </section>
        ) : null}

        {hasSeoMeta ? (
          <motion.section
            className="border-t border-white/[0.06] px-5 py-14 md:px-10"
            style={{ backgroundColor: A.panel }}
            initial="hidden"
            whileInView="show"
            viewport={scrollViewport(reduceMotion)}
            variants={fadeUp}
          >
            <div className="mx-auto max-w-3xl">
              <details className="group rounded-2xl border border-white/[0.06] bg-[#06060c]/80 p-6">
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

        <section className="no-print border-t border-white/[0.08] px-5 py-12 md:px-10" style={{ backgroundColor: A.panel }}>
          <div className="mx-auto flex max-w-5xl flex-wrap gap-3">
            {data.cvUrl ? (
              <a
                href={data.cvUrl}
                download={data.cvFileName || `${data.fullName}-CV`}
                className="rounded-full border border-white/12 bg-white/[0.04] px-5 py-2.5 text-sm text-zinc-200 transition hover:border-violet-400/40"
              >
                Download CV
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full border border-white/12 px-5 py-2.5 text-sm text-zinc-500 transition hover:bg-white/5"
            >
              Print / PDF
            </button>
            {visitorChrome ? (
              <>
                {!user && hasApi ? (
                  <Link to="/auth" className="rounded-full border border-white/12 px-5 py-2.5 text-sm text-zinc-500">
                    Create your portfolio
                  </Link>
                ) : null}
                {user && !isOwner ? (
                  <Link to="/app" className="rounded-full border border-white/12 px-5 py-2.5 text-sm text-zinc-500">
                    Dashboard
                  </Link>
                ) : null}
              </>
            ) : (
              <>
                <Link to="/app" className="rounded-full border border-white/12 px-5 py-2.5 text-sm text-zinc-500">
                  Edit in dashboard
                </Link>
                <button type="button" onClick={() => setVisitorPreview(true)} className="rounded-full border border-white/12 px-5 py-2.5 text-sm text-zinc-500">
                  Preview as visitor
                </button>
              </>
            )}
          </div>
          <div className="mx-auto mt-10 max-w-5xl text-center">
            {data.showPoweredBy ? (
              <p className="text-xs text-zinc-600">
                Made with{" "}
                <Link to="/" className="underline underline-offset-4 hover:text-violet-400">
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
          className="no-print fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 backdrop-blur-md"
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
