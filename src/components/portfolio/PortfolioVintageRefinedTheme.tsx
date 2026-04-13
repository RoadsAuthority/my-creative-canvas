import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Mail,
} from "lucide-react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { SiteFooter } from "@/components/SiteFooter";
import { trackProjectClick } from "@/lib/analytics-service";
import { cn } from "@/lib/utils";
import type { PortfolioRecord } from "@/lib/portfolio-service";
import type { PortfolioProject } from "@/types/portfolio";

/** Refined vintage — deep olive, metallic gold, editorial serif (boutique / Hudson-inspired) */
const R = {
  bg: "#1a221c",
  bgLift: "#252d26",
  gold: "#c4a574",
  goldDim: "#8a7355",
  cream: "#e8dcc8",
  creamMuted: "#b8a896",
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

function splitDisplayName(full: string): { left: string; right: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { left: "", right: full.trim() };
  const mid = Math.ceil(parts.length / 2);
  return { left: parts.slice(0, mid).join(" "), right: parts.slice(mid).join(" ") };
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
  setLightbox: React.Dispatch<React.SetStateAction<{ urls: string[]; index: number } | null>>;
  setVisitorPreview: (next: boolean) => void;
};

type VintageMask = "arch" | "ellipse" | "circle";

function maskVariantForIndex(i: number): VintageMask {
  const cycle: VintageMask[] = ["arch", "ellipse", "circle"];
  return cycle[i % cycle.length];
}

/** Thin concentric arcs behind framed images — museum-catalog feel */
function VintageDecorRings({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute left-1/2 top-1/2 -z-0 -translate-x-1/2 -translate-y-1/2", className)}
      aria-hidden
    >
      <svg className="h-[135%] w-[135%] max-w-none text-[#c4a574]/22" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="0.4" />
        <circle cx="100" cy="100" r="76" fill="none" stroke="currentColor" strokeWidth="0.35" />
        <path d="M 100 28 A 72 72 0 0 1 172 100" fill="none" stroke="currentColor" strokeWidth="0.35" opacity="0.65" />
      </svg>
    </div>
  );
}

function maskShellStyle(
  variant: VintageMask,
  size: "hero" | "story" | "project" | "thumb",
): CSSProperties {
  const border = `1px solid ${R.gold}99`;
  const shadow = "0 22px 55px -20px rgba(0,0,0,0.6)";
  if (variant === "circle") {
    const px = size === "thumb" ? 56 : size === "hero" ? 288 : 220;
    return {
      width: size === "thumb" ? px : `min(${px}px, 88vw)`,
      aspectRatio: "1",
      borderRadius: "50%",
      overflow: "hidden",
      border,
      boxShadow: shadow,
    };
  }
  if (variant === "ellipse") {
    const px = size === "hero" ? 260 : size === "story" ? 320 : 248;
    return {
      width: size === "thumb" ? 56 : `min(${px}px, ${size === "story" ? "96vw" : "92vw"})`,
      aspectRatio: "3 / 5",
      borderRadius: "50%",
      overflow: "hidden",
      border,
      boxShadow: shadow,
    };
  }
  const px = size === "hero" ? 288 : size === "story" ? 340 : 268;
  return {
    width: size === "thumb" ? 56 : `min(${px}px, ${size === "story" ? "96vw" : "92vw"})`,
    aspectRatio: "4 / 5",
    borderTopLeftRadius: "50%",
    borderTopRightRadius: "50%",
    borderBottomLeftRadius: "0.85rem",
    borderBottomRightRadius: "0.85rem",
    overflow: "hidden",
    border,
    boxShadow: shadow,
  };
}

export function PortfolioVintageRefinedTheme({
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
  const { left: nameLeft, right: nameRight } = splitDisplayName(data.fullName);
  const storyImage =
    data.projects.find((p) => projectImageUrls(p).length > 0)?.imageUrls?.[0] ??
    data.projects.find((p) => p.imageUrl)?.imageUrl ??
    "";

  const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div
      className="min-h-screen text-[#e8dcc8]"
      style={{
        backgroundColor: R.bg,
        fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
      }}
    >
      {/* Top bar — minimal boutique nav */}
      <header className="relative z-20 border-b border-white/[0.06] px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="min-w-0 text-xs uppercase tracking-[0.2em] text-[#b8a896]">
            {data.email ? (
              <a href={`mailto:${data.email}`} className="inline-flex items-center gap-2 transition hover:text-[#c4a574]">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Contact</span>
              </a>
            ) : (
              <span>Portfolio</span>
            )}
          </div>
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-sm font-semibold tracking-tight"
            style={{ borderColor: `${R.gold}55`, color: R.gold }}
            aria-hidden
          >
            {data.fullName
              .split(/\s+/)
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "PF"}
          </div>
          <nav className="flex flex-wrap items-center justify-end gap-4 text-xs uppercase tracking-[0.18em] text-[#b8a896]">
            <button type="button" onClick={() => scrollToId("story")} className="transition hover:text-[#c4a574]">
              Story
            </button>
            <button type="button" onClick={() => scrollToId("catalog")} className="transition hover:text-[#c4a574]">
              Work
            </button>
            {data.cvUrl ? (
              <a
                href={data.cvUrl}
                download={data.cvFileName || `${data.fullName}-CV`}
                className="transition hover:text-[#c4a574]"
              >
                Résumé
              </a>
            ) : null}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero — circular portrait + split name + gold connectors */}
        <section className="relative px-5 pb-20 pt-10 md:px-10 md:pb-28 md:pt-14">
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden>
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <div className="relative mx-auto flex max-w-5xl flex-col items-center md:flex-row md:items-center md:justify-center md:gap-4 lg:gap-10">
            {/* Left name */}
            <div className="w-full max-w-[12rem] text-right font-['Cormorant_Garamond',Georgia,serif] md:flex-1">
              {nameLeft ? (
                <p
                  className="text-4xl font-semibold leading-[0.95] tracking-tight md:text-5xl lg:text-6xl"
                  style={{ color: R.gold }}
                >
                  {nameLeft}
                </p>
              ) : null}
            </div>

            {/* Decorative line + vertical oval (museum frame) */}
            <div className="relative my-8 flex items-center md:my-0">
              <div
                className="absolute -left-16 top-1/2 hidden h-px w-12 -translate-y-1/2 md:block"
                style={{ background: `linear-gradient(90deg, transparent, ${R.gold})` }}
              />
              <div
                className="absolute -right-16 top-1/2 hidden h-px w-12 -translate-y-1/2 md:block"
                style={{ background: `linear-gradient(90deg, ${R.gold}, transparent)` }}
              />
              <div className="relative z-[1] flex items-center justify-center">
                <VintageDecorRings />
                <div
                  className="relative z-[1] mx-auto"
                  style={maskShellStyle("ellipse", "hero")}
                >
                  {heroImage ? (
                    <img src={heroImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center px-4 text-center text-sm"
                      style={{ background: `linear-gradient(145deg, ${R.bgLift}, #0f1410)` }}
                    >
                      Add a profile photo
                    </div>
                  )}
                </div>
              </div>
              <span
                className="absolute -left-3 top-1/2 hidden h-2 w-2 -translate-y-1/2 rounded-full md:block"
                style={{ backgroundColor: R.gold }}
              />
              <span
                className="absolute -right-3 top-1/2 hidden h-2 w-2 -translate-y-1/2 rounded-full md:block"
                style={{ backgroundColor: R.gold }}
              />
            </div>

            <div className="w-full max-w-[12rem] text-left font-['Cormorant_Garamond',Georgia,serif] md:flex-1">
              {nameRight ? (
                <p
                  className="text-4xl font-semibold leading-[0.95] tracking-tight md:text-5xl lg:text-6xl"
                  style={{ color: R.gold }}
                >
                  {nameRight}
                </p>
              ) : null}
            </div>
          </div>

          <p
            className="mx-auto mt-8 max-w-xl text-center font-['Cormorant_Garamond',Georgia,serif] text-lg italic md:text-xl"
            style={{ color: R.creamMuted }}
          >
            {data.headline}
          </p>

          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => scrollToId("catalog")}
              className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.35em] transition hover:opacity-90"
              style={{ color: R.gold }}
            >
              Selected work
              <ArrowDownRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </button>
          </div>
        </section>

        {/* Brand story — tan / sepia band */}
        <section
          id="story"
          className="scroll-mt-6 border-y border-white/[0.07] px-5 py-20 md:px-10 md:py-28"
          style={{
            background: `linear-gradient(180deg, ${R.bgLift} 0%, #3d3429 45%, ${R.bgLift} 100%)`,
          }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-8 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#c4a574]" />
              <div className="h-1.5 w-1.5 rounded-full bg-[#c4a574]" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#c4a574]" />
            </div>
            <h2
              className="font-['Cormorant_Garamond',Georgia,serif] text-3xl font-semibold uppercase leading-tight tracking-[0.08em] md:text-4xl lg:text-[2.75rem]"
              style={{ color: R.cream }}
            >
              {aboutTitle}
            </h2>
            <p className="mt-8 text-base leading-relaxed md:text-lg" style={{ color: R.creamMuted }}>
              {aboutText}
            </p>
            {storyImage ? (
              <div className="relative mx-auto mt-12 flex max-w-md justify-center">
                <VintageDecorRings className="scale-110 opacity-90" />
                <div className="relative z-[1] w-full" style={maskShellStyle("arch", "story")}>
                  <img src={storyImage} alt="" className="h-full w-full object-cover object-center" />
                </div>
              </div>
            ) : null}
            {hasSocial ? (
              <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm" style={{ color: R.goldDim }}>
                {social?.website ? (
                  <a
                    href={social.website.startsWith("http") ? social.website : `https://${social.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="border-b border-transparent transition hover:border-[#c4a574] hover:text-[#c4a574]"
                  >
                    Website
                  </a>
                ) : null}
                {social?.linkedin ? (
                  <a
                    href={social.linkedin.startsWith("http") ? social.linkedin : `https://${social.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="border-b border-transparent transition hover:border-[#c4a574] hover:text-[#c4a574]"
                  >
                    LinkedIn
                  </a>
                ) : null}
                {social?.github ? (
                  <a
                    href={social.github.startsWith("http") ? social.github : `https://${social.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="border-b border-transparent transition hover:border-[#c4a574] hover:text-[#c4a574]"
                  >
                    GitHub
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        {/* Catalog — projects */}
        <section id="catalog" className="scroll-mt-6 px-5 py-20 md:px-10 md:py-28" style={{ backgroundColor: R.bg }}>
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 flex flex-col items-center gap-4 text-center">
              <div className="flex items-center gap-4">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c4a574]/80" />
                <h2 className="font-['Cormorant_Garamond',Georgia,serif] text-3xl font-semibold tracking-[0.12em] md:text-4xl" style={{ color: R.gold }}>
                  Selected work
                </h2>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c4a574]/80" />
              </div>
              <p className="max-w-lg text-sm" style={{ color: R.creamMuted }}>
                {data.location ? `${data.location} · ` : null}
                Case studies and shipped work
              </p>
            </div>

            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {data.projects.map((project, idx) => (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="group overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#1e2620] shadow-xl transition hover:border-[#c4a574]/25"
                >
                  {((project.imageUrls?.length ?? 0) > 0 || project.imageUrl || (project.videoUrls?.length ?? 0) > 0) ? (
                    <div className="space-y-4 p-4">
                      {(project.imageUrls?.length ?? 0) > 0 || project.imageUrl ? (
                        <>
                          <div className="relative flex justify-center">
                            <VintageDecorRings className="opacity-[0.85]" />
                            <button
                              type="button"
                              onClick={() => setLightbox({ urls: projectImageUrls(project), index: 0 })}
                              className="relative z-[1] mx-auto block max-w-full"
                            >
                              <div
                                className="mx-auto [&_img]:transition [&_img]:duration-500 [&_img]:group-hover:scale-[1.03]"
                                style={maskShellStyle(maskVariantForIndex(idx), "project")}
                              >
                                <img
                                  src={projectImageUrls(project)[0]}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            </button>
                          </div>
                          {projectImageUrls(project).length > 1 ? (
                            <div className="flex flex-wrap justify-center gap-2.5">
                              {projectImageUrls(project).slice(1).map((url, extraIdx) => (
                                <button
                                  key={`${project.id}-extra-${extraIdx}`}
                                  type="button"
                                  onClick={() =>
                                    setLightbox({ urls: projectImageUrls(project), index: extraIdx + 1 })
                                  }
                                  className="transition hover:opacity-95"
                                >
                                  <div style={maskShellStyle("circle", "thumb")}>
                                    <img src={url} alt="" className="h-full w-full object-cover" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </>
                      ) : null}
                      {(project.videoUrls?.length ?? 0) > 0 ? (
                        <div className="relative mx-auto flex max-w-sm justify-center">
                          <VintageDecorRings className="scale-95 opacity-50" />
                          <div
                            className="relative z-[1] w-full [&_video]:min-h-[12rem]"
                            style={maskShellStyle(maskVariantForIndex(idx + 2), "project")}
                          >
                            <video
                              src={project.videoUrls?.[0]}
                              controls
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="px-5 pb-6 pt-2">
                    <h3 className="font-['Cormorant_Garamond',Georgia,serif] text-2xl font-semibold" style={{ color: R.cream }}>
                      {project.title}
                    </h3>
                    {project.role ? (
                      <p className="mt-1 text-xs uppercase tracking-[0.2em]" style={{ color: R.goldDim }}>
                        {project.role}
                      </p>
                    ) : null}
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: R.creamMuted }}>
                      {project.summary}
                    </p>
                    {project.link ? (
                      <a
                        href={project.link.startsWith("http") ? project.link : `https://${project.link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] transition hover:text-[#c4a574]"
                        style={{ color: R.gold }}
                        onClick={() => trackProjectClick(data.slug)}
                      >
                        View project
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="no-print border-t border-white/[0.07] px-5 py-12 md:px-10" style={{ backgroundColor: R.bgLift }}>
          <div className="mx-auto flex max-w-5xl flex-wrap gap-3">
            {data.cvUrl ? (
              <a
                href={data.cvUrl}
                download={data.cvFileName || `${data.fullName}-CV`}
                className="rounded-full border px-5 py-2.5 text-sm font-medium transition hover:bg-white/5"
                style={{ borderColor: `${R.gold}55`, color: R.cream }}
              >
                Download CV
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-[#e8dcc8] transition hover:bg-white/5"
            >
              Print / PDF
            </button>
            {visitorChrome ? (
              <>
                {!user && hasApi ? (
                  <Link to="/auth" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-[#e8dcc8]">
                    Create your portfolio
                  </Link>
                ) : null}
                {user && !isOwner ? (
                  <Link to="/app" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-[#e8dcc8]">
                    Dashboard
                  </Link>
                ) : null}
              </>
            ) : (
              <>
                <Link to="/app" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-[#e8dcc8]">
                  Edit in dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => setVisitorPreview(true)}
                  className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-[#e8dcc8]"
                >
                  Preview as visitor
                </button>
              </>
            )}
          </div>
          <div className="mx-auto mt-10 max-w-5xl text-center">
            {data.showPoweredBy ? (
              <p className="text-xs" style={{ color: R.creamMuted }}>
                Made with{" "}
                <Link to="/" className="underline underline-offset-4 hover:text-[#c4a574]">
                  PortfolioForge
                </Link>
              </p>
            ) : null}
            <Link to="/" className="mt-3 block text-sm opacity-80 hover:underline" style={{ color: R.creamMuted }}>
              ← Home
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />

      {lightbox ? (
        <div
          className="no-print fixed inset-0 z-[100] flex items-center justify-center bg-black/88 p-4 backdrop-blur-sm"
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
                aria-label="Previous"
                onClick={() =>
                  setLightbox((prev) =>
                    prev
                      ? { ...prev, index: (prev.index - 1 + prev.urls.length) % prev.urls.length }
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
                aria-label="Next"
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
              alt=""
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
