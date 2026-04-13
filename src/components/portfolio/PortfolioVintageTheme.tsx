import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowUpRight,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SiteFooter } from "@/components/SiteFooter";
import { trackProjectClick } from "@/lib/analytics-service";
import type { PortfolioRecord } from "@/lib/portfolio-service";
import type { PortfolioProject } from "@/types/portfolio";

/** Vintage palette — “Cowhide Cocoa” through “Golden Batter” */
const V = {
  cowhide: "#442D1C",
  spiced: "#743014",
  toasted: "#84592B",
  olive: "#9D9167",
  golden: "#E8D1A7",
} as const;

const cleanTags = (tags?: string) =>
  (tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

const projectImageUrls = (project: PortfolioProject): string[] => {
  if (project.imageUrls?.length) return project.imageUrls;
  if (project.imageUrl) return [project.imageUrl];
  return [];
};

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
  setLightbox: React.Dispatch<React.SetStateAction<{ urls: string[]; index: number } | null>>;
  setVisitorPreview: (next: boolean) => void;
};

export function PortfolioVintageTheme({
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
  const [dockActive, setDockActive] = useState<string>("hero");

  const nav = [
    { id: "hero" as const, label: "Home", icon: Home },
    { id: "summary" as const, label: "Summary", icon: FileText },
    { id: "experience" as const, label: "Experience", icon: Briefcase },
    { id: "skills" as const, label: "Skills", icon: Zap },
  ];

  const skillTags = Array.from(
    new Set(
      data.projects.flatMap((p) => [...cleanTags(p.stack), ...cleanTags(p.tags)]),
    ),
  ).slice(0, 40);

  const scrollTo = (id: string) => {
    setDockActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#2a1810] text-[#E8D1A7]">
      <main>
        {/* Full-bleed hero */}
        <section
          id="hero"
          className="relative flex min-h-screen flex-col justify-end pb-36 pt-28 md:pb-40 md:pt-32"
        >
          {heroImage ? (
            <img
              src={heroImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(165deg, ${V.cowhide} 0%, ${V.spiced} 40%, ${V.toasted} 100%)`,
              }}
            />
          )}
          {/* Warm sepia stack */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#743014]/55 via-[#84592B]/35 to-[#442D1C]/80 mix-blend-multiply"
            aria-hidden
          />
          <div className="absolute inset-0 bg-amber-200/15 mix-blend-overlay" aria-hidden />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
            }}
            aria-hidden
          />

          {/* Download CV — top right */}
          {data.cvUrl ? (
            <div className="absolute right-5 top-6 z-20 md:right-10 md:top-10">
              <a
                href={data.cvUrl}
                download={data.cvFileName || `${data.fullName}-CV`}
                className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg transition hover:opacity-95"
                style={{ backgroundColor: V.spiced, color: V.golden }}
              >
                Download CV
              </a>
            </div>
          ) : null}

          <div className="relative z-10 mx-auto w-full max-w-5xl px-6 md:px-10">
            <p
              className="text-xs font-medium uppercase tracking-[0.35em] md:text-sm"
              style={{ color: V.olive }}
            >
              {data.headline}
            </p>
            <h1
              className="mt-4 max-w-4xl font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl"
              style={{ color: V.golden, textShadow: "0 2px 40px rgba(0,0,0,0.35)" }}
            >
              {data.fullName.split(/\s+/).map((word, i, arr) => (
                <span key={`${word}-${i}`} className="block">
                  {word}
                  {i < arr.length - 1 ? "" : ""}
                </span>
              ))}
            </h1>
            {data.bio ? (
              <p className="mt-6 max-w-2xl text-base leading-relaxed opacity-95 md:text-lg" style={{ color: V.golden }}>
                {data.bio}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3 text-sm" style={{ color: V.golden }}>
              {data.email ? (
                <a
                  href={`mailto:${data.email}`}
                  className="rounded-full px-4 py-2 font-medium transition hover:bg-white/10"
                  style={{ backgroundColor: `${V.cowhide}cc` }}
                >
                  {data.email}
                </a>
              ) : null}
              {data.location ? (
                <span
                  className="rounded-full px-4 py-2"
                  style={{ backgroundColor: `${V.cowhide}99` }}
                >
                  {data.location}
                </span>
              ) : null}
            </div>
          </div>

          {/* Floating dock nav */}
          <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-4">
            <nav
              className="pointer-events-auto flex max-w-md flex-wrap items-center justify-center gap-1 rounded-full border border-white/10 px-2 py-2 shadow-2xl backdrop-blur-md md:max-w-none md:gap-2 md:px-3"
              style={{ backgroundColor: `${V.cowhide}e6` }}
              aria-label="Section navigation"
            >
              {nav.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollTo(id)}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition md:px-4 md:text-sm"
                  style={{
                    color: V.golden,
                    backgroundColor: dockActive === id ? V.spiced : "transparent",
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 opacity-90 md:h-4 md:w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </section>

        {/* Summary */}
        <section
          id="summary"
          className="scroll-mt-8 border-t border-white/10 px-5 py-16 md:px-10 md:py-24"
          style={{ background: `linear-gradient(180deg, ${V.cowhide} 0%, #3d2418 100%)` }}
        >
          <div className="mx-auto max-w-5xl">
            <p className="text-xs uppercase tracking-[0.25em]" style={{ color: V.olive }}>
              Who I am
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-5xl" style={{ color: V.golden }}>
              {aboutTitle}
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed opacity-90" style={{ color: V.golden }}>
              {aboutText}
            </p>
            {hasSocial ? (
              <div className="mt-8 flex flex-wrap gap-3">
                {social?.website ? (
                  <a
                    href={social.website.startsWith("http") ? social.website : `https://${social.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full px-5 py-2 text-sm font-medium transition hover:opacity-90"
                    style={{ backgroundColor: V.spiced, color: V.golden }}
                  >
                    Website
                  </a>
                ) : null}
                {social?.linkedin ? (
                  <a
                    href={social.linkedin.startsWith("http") ? social.linkedin : `https://${social.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border px-5 py-2 text-sm font-medium transition hover:bg-white/5"
                    style={{ borderColor: `${V.olive}80`, color: V.golden }}
                  >
                    LinkedIn
                  </a>
                ) : null}
                {social?.github ? (
                  <a
                    href={social.github.startsWith("http") ? social.github : `https://${social.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border px-5 py-2 text-sm font-medium transition hover:bg-white/5"
                    style={{ borderColor: `${V.olive}80`, color: V.golden }}
                  >
                    GitHub
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        {/* Experience = projects */}
        <section
          id="experience"
          className="scroll-mt-8 px-5 py-16 md:px-10 md:py-24"
          style={{ backgroundColor: "#1f130c" }}
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-2xl font-semibold md:text-3xl" style={{ color: V.golden }}>
              Selected work
            </h2>
            <div className="mt-10 space-y-12">
              {data.projects.map((project, idx) => (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.04 }}
                  className="overflow-hidden rounded-[1.5rem] border border-white/10"
                  style={{ backgroundColor: `${V.cowhide}66` }}
                >
                  {((project.imageUrls?.length ?? 0) > 0 || project.imageUrl || (project.videoUrls?.length ?? 0) > 0) ? (
                    <div className="p-4 md:p-5">
                      {(project.imageUrls?.length ?? 0) > 0 || project.imageUrl ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {projectImageUrls(project).map((img, i) => (
                            <button
                              key={`${project.id}-img-${i}`}
                              type="button"
                              onClick={() => setLightbox({ urls: projectImageUrls(project), index: i })}
                              className="group overflow-hidden rounded-xl border border-white/10 text-left"
                            >
                              <img
                                src={img}
                                alt={`${project.title} preview ${i + 1}`}
                                className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.02] md:h-64"
                              />
                            </button>
                          ))}
                        </div>
                      ) : null}
                      {(project.videoUrls?.length ?? 0) > 0 ? (
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {(project.videoUrls ?? []).map((video, i) => (
                            <div key={`${project.id}-v-${i}`} className="overflow-hidden rounded-xl border border-white/10">
                              <video src={video} controls className="h-52 w-full object-cover md:h-64" />
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-semibold" style={{ color: V.golden }}>
                          {project.title}
                        </h3>
                        {project.role ? (
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: V.olive }}>
                            {project.role}
                          </p>
                        ) : null}
                      </div>
                      {project.link ? (
                        <a
                          href={project.link.startsWith("http") ? project.link : `https://${project.link}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition hover:opacity-90"
                          style={{ backgroundColor: V.spiced, color: V.golden }}
                          onClick={() => trackProjectClick(data.slug)}
                        >
                          View work
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      ) : null}
                    </div>
                    <p className="mt-4 leading-relaxed opacity-90" style={{ color: V.golden }}>
                      {project.summary}
                    </p>
                    {project.problem?.trim() || project.outcome?.trim() ? (
                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {project.problem?.trim() ? (
                          <div className="rounded-xl border border-white/10 p-4" style={{ backgroundColor: `${V.cowhide}55` }}>
                            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: V.olive }}>
                              Challenge
                            </p>
                            <p className="mt-2 text-sm leading-relaxed opacity-95">{project.problem.trim()}</p>
                          </div>
                        ) : null}
                        {project.outcome?.trim() ? (
                          <div className="rounded-xl border border-white/10 p-4" style={{ backgroundColor: `${V.cowhide}55` }}>
                            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: V.toasted }}>
                              Outcome
                            </p>
                            <p className="mt-2 text-sm leading-relaxed opacity-95">{project.outcome.trim()}</p>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Skills */}
        <section
          id="skills"
          className="scroll-mt-8 border-t border-white/10 px-5 py-16 md:px-10 md:py-20"
          style={{ background: `linear-gradient(180deg, #1f130c 0%, ${V.cowhide} 100%)` }}
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-2xl font-semibold md:text-3xl" style={{ color: V.golden }}>
              Skills &amp; tools
            </h2>
            <p className="mt-3 max-w-2xl text-sm opacity-80" style={{ color: V.olive }}>
              Pulled from your project tags and stack fields.
            </p>
            {skillTags.length > 0 ? (
              <div className="mt-8 flex flex-wrap gap-2">
                {skillTags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border px-4 py-1.5 text-sm"
                    style={{ borderColor: `${V.olive}99`, color: V.golden }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm opacity-70" style={{ color: V.golden }}>
                Add stack or tags to your projects to populate this section.
              </p>
            )}
          </div>
        </section>

        {/* Actions */}
        <section className="no-print border-t border-white/10 px-5 py-10 md:px-10" style={{ backgroundColor: V.cowhide }}>
          <div className="mx-auto flex max-w-5xl flex-wrap gap-3">
            {data.cvUrl ? (
              <a
                href={data.cvUrl}
                download={data.cvFileName || `${data.fullName}-CV`}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
                style={{ backgroundColor: V.spiced, color: V.golden }}
              >
                Download CV
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-[#E8D1A7] transition hover:bg-white/10"
            >
              Export PDF / print
            </button>
            {visitorChrome ? (
              <>
                {!user && hasApi ? (
                  <Link to="/auth" className="rounded-full border border-white/25 px-5 py-2.5 text-sm font-medium text-[#E8D1A7]">
                    Create your portfolio
                  </Link>
                ) : null}
                {user && !isOwner ? (
                  <Link to="/app" className="rounded-full border border-white/25 px-5 py-2.5 text-sm font-medium text-[#E8D1A7]">
                    Dashboard
                  </Link>
                ) : null}
              </>
            ) : (
              <>
                <Link to="/app" className="rounded-full border border-white/25 px-5 py-2.5 text-sm font-medium text-[#E8D1A7]">
                  Edit in dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => setVisitorPreview(true)}
                  className="rounded-full border border-white/25 px-5 py-2.5 text-sm font-medium text-[#E8D1A7]"
                >
                  Preview as visitor
                </button>
              </>
            )}
          </div>
          <div className="mx-auto mt-10 max-w-5xl">
            {data.showPoweredBy ? (
              <p className="text-center text-xs opacity-70" style={{ color: V.olive }}>
                Made with{" "}
                <Link to="/" className="underline underline-offset-2" style={{ color: V.golden }}>
                  PortfolioForge
                </Link>
              </p>
            ) : null}
            <Link to="/" className="mt-4 block text-center text-sm opacity-80 hover:underline" style={{ color: V.olive }}>
              ← PortfolioForge home
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />

      {/* Lightbox — duplicated controls pattern from main Portfolio */}
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
    </div>
  );
}
