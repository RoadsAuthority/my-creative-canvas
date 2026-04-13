import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { useMemo, type Dispatch, type SetStateAction } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { SiteFooter } from "@/components/SiteFooter";
import { trackProjectClick } from "@/lib/analytics-service";
import { cn } from "@/lib/utils";
import type { PortfolioRecord } from "@/lib/portfolio-service";
import type { PortfolioProject } from "@/types/portfolio";

/** Dark / Dev Mode — charcoal canvas, ember + cyan accents, “chaotic cute” motion on frames */
const D = {
  bg: "#060607",
  surface: "#0e0e12",
  ink: "#f4f4f5",
  muted: "#a1a1aa",
  ember: "#ff5c28",
  amber: "#fbbf24",
  cyan: "#22d3ee",
} as const;

function projectImageUrls(project: PortfolioProject): string[] {
  if (project.imageUrls?.length) return project.imageUrls;
  if (project.imageUrl) return [project.imageUrl];
  return [];
}

function chaosHash(projectId: string, slot: number, salt = 0): number {
  const s = `${projectId}\0${slot}\0${salt}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Playful, high-energy loop — each slot gets different timing & path so nothing moves in lockstep. */
function devChaosMotion(projectId: string, slot: number) {
  const h = chaosHash(projectId, slot);
  const h2 = chaosHash(projectId, slot, 7);
  const duration = 1.25 + (h % 55) / 28;
  const delay = (h2 % 70) / 35;

  const y0 = 0;
  const y1 = -14 - (h % 12);
  const y2 = 10 + (h2 % 10);
  const y3 = -5 - (h % 6);
  const x1 = 7 + (h2 % 9);
  const x2 = -11 - (h % 11);
  const x3 = 5 + (h2 % 7);
  const r1 = -7 - (h % 8);
  const r2 = 8 + (h2 % 7);
  const r3 = -4 - (h % 5);
  const s1 = 1.04 + (h % 8) / 200;
  const s2 = 0.93 - (h2 % 6) / 200;
  const s3 = 1.025;

  const glowA = `0 0 28px rgba(255, 92, 40, 0.45), 0 0 52px rgba(251, 191, 36, 0.2)`;
  const glowB = `0 0 36px rgba(34, 211, 238, 0.35), 0 0 48px rgba(255, 92, 40, 0.25)`;
  const glowC = `0 0 22px rgba(251, 191, 36, 0.4), 0 0 40px rgba(34, 211, 238, 0.15)`;

  return {
    animate: {
      y: [y0, y1, y2, y3, y0],
      x: [0, x1, x2, x3, 0],
      rotate: [0, r1, r2, r3, 0],
      scale: [1, s1, s2, s3, 1],
      boxShadow: [glowA, glowB, glowC, glowA, glowA],
    },
    transition: {
      duration,
      delay,
      repeat: Infinity,
      ease: [0.33, 1.18, 0.55, 1] as [number, number, number, number],
      times: [0, 0.22, 0.48, 0.74, 1],
    },
  };
}

type ChaosButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  projectId: string;
  slot: number;
  className?: string;
  children: ReactNode;
};

function DevChaosFrame({ projectId, slot, className, children, ...rest }: ChaosButtonProps) {
  const reduce = useReducedMotion();
  const chaos = useMemo(() => devChaosMotion(projectId, slot), [projectId, slot]);

  if (reduce) {
    return (
      <button type="button" className={className} {...rest}>
        {children}
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      className={className}
      animate={chaos.animate}
      transition={chaos.transition}
      whileHover={{
        scale: 1.06,
        rotate: slot % 2 === 0 ? 3 : -3,
        transition: { type: "spring", stiffness: 420, damping: 18 },
      }}
      whileTap={{ scale: 0.96 }}
      {...rest}
    >
      {children}
    </motion.button>
  );
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

export function PortfolioDevModeTheme({
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
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const galleryItems = data.projects.flatMap((p) => {
    const urls = projectImageUrls(p);
    return urls.slice(0, 4).map((url, i) => ({
      url,
      project: p,
      indexInProject: i,
      key: `${p.id}-${i}`,
    }));
  });

  return (
    <div
      className="min-h-screen text-zinc-100 antialiased"
      style={{
        backgroundColor: D.bg,
        fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.07]"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, ${D.ember} 0%, transparent 45%), radial-gradient(circle at 80% 80%, ${D.cyan} 0%, transparent 40%)`,
        }}
      />

      <header className="relative z-20 border-b border-white/[0.06] px-5 py-5 backdrop-blur-md md:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
            {data.fullName}
          </div>
          <nav className="flex flex-wrap items-center gap-6 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            <button type="button" onClick={() => scrollTo("frames")} className="transition hover:text-amber-400">
              Frames
            </button>
            <button type="button" onClick={() => scrollTo("about")} className="transition hover:text-cyan-400">
              About
            </button>
            {data.email ? (
              <a href={`mailto:${data.email}`} className="inline-flex items-center gap-1.5 text-amber-400/90 transition hover:text-amber-300">
                <Mail className="h-3.5 w-3.5" />
                Ping
              </a>
            ) : null}
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-5 pb-24 pt-16 md:px-10 md:pb-32 md:pt-20">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[min(90vw,520px)] w-[min(90vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl"
            style={{
              background: `radial-gradient(circle, ${D.ember}55 0%, ${D.amber}22 35%, transparent 65%)`,
            }}
          />
          <div className="relative z-[1] mx-auto max-w-4xl text-center">
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-amber-400/90">{data.headline}</p>
            <h1 className="mt-6 bg-gradient-to-br from-white via-zinc-100 to-zinc-500 bg-clip-text text-5xl font-bold leading-[0.95] tracking-tight text-transparent md:text-7xl">
              {data.fullName}
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-sm leading-relaxed text-zinc-500 md:text-base">{aboutTitle}</p>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => scrollTo("frames")}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-3 text-sm font-semibold text-black shadow-lg shadow-orange-500/25 transition hover:brightness-110"
              >
                See the chaos
              </button>
              {data.cvUrl ? (
                <a
                  href={data.cvUrl}
                  download={data.cvFileName || `${data.fullName}-CV`}
                  className="rounded-full border border-white/15 px-8 py-3 text-sm text-zinc-300 transition hover:bg-white/5"
                >
                  Download CV
                </a>
              ) : null}
            </div>
          </div>

          <div className="relative z-[1] mx-auto mt-16 flex max-w-xs justify-center md:mt-20">
            <div className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/80 shadow-2xl shadow-orange-500/10 md:max-w-[320px]">
              {heroImage ? (
                <img src={heroImage} alt="" className="h-full w-full object-cover grayscale contrast-110" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 font-mono text-xs text-zinc-600">
                  hero.jpg
                </div>
              )}
              <div
                className="pointer-events-none absolute inset-0 rounded-[2rem]"
                style={{
                  boxShadow: `inset 0 0 80px rgba(255,92,40,0.12)`,
                }}
              />
            </div>
          </div>
        </section>

        {/* Mood-board style strip — inspo: three tall cards, each with its own wild loop */}
        <section id="frames" className="scroll-mt-24 border-t border-white/[0.06] px-5 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center md:mb-16">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-400/80">Behind the builds</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Frames that won&apos;t sit still
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-sm text-zinc-500">
                {data.location ? `${data.location} · ` : null}
                Every tile runs its own loop — hover for extra bounce.
              </p>
            </div>

            {galleryItems.length === 0 ? (
              <p className="text-center text-sm text-zinc-500">
                {isOwner ? "Add project images to wake up this section." : "Nothing to show yet."}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
                {galleryItems.map((item, gi) => (
                  <DevChaosFrame
                    key={item.key}
                    projectId={item.project.id}
                    slot={gi + chaosHash(item.project.id, item.indexInProject, 3) % 40}
                    onClick={() =>
                      setLightbox({
                        urls: projectImageUrls(item.project),
                        index: item.indexInProject,
                      })
                    }
                    className={cn(
                      "relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60 text-left",
                      "grayscale transition-[filter] duration-300 hover:grayscale-0",
                    )}
                  >
                    <img src={item.url} alt="" className="h-full w-full object-cover" />
                    <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-amber-300/95 backdrop-blur-sm">
                      {item.project.title.slice(0, 18)}
                      {item.project.title.length > 18 ? "…" : ""}
                    </span>
                  </DevChaosFrame>
                ))}
              </div>
            )}

            {/* Project copy below the dancing frames */}
            {data.projects.length > 0 ? (
              <div className="mt-20 space-y-12 border-t border-white/[0.06] pt-16">
                {data.projects.map((project) => (
                  <div key={project.id} className="mx-auto max-w-3xl">
                    <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                    {project.role ? (
                      <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">{project.role}</p>
                    ) : null}
                    <p className="mt-4 text-sm leading-relaxed text-zinc-400">{project.summary}</p>
                    {project.link ? (
                      <a
                        href={project.link.startsWith("http") ? project.link : `https://${project.link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
                        onClick={() => trackProjectClick(data.slug)}
                      >
                        Open project
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section id="about" className="scroll-mt-24 border-t border-white/[0.06] px-5 py-20 md:px-10 md:py-28" style={{ backgroundColor: D.surface }}>
          <div className="mx-auto max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">About</p>
            <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">{data.fullName}</h2>
            <p className="mt-8 text-base leading-relaxed text-zinc-400 md:text-lg">{aboutText}</p>
            {hasSocial ? (
              <div className="mt-10 flex flex-wrap gap-6 text-sm text-zinc-500">
                {social?.website ? (
                  <a href={social.website.startsWith("http") ? social.website : `https://${social.website}`} target="_blank" rel="noreferrer" className="hover:text-amber-400">
                    Website
                  </a>
                ) : null}
                {social?.linkedin ? (
                  <a href={social.linkedin.startsWith("http") ? social.linkedin : `https://${social.linkedin}`} target="_blank" rel="noreferrer" className="hover:text-amber-400">
                    LinkedIn
                  </a>
                ) : null}
                {social?.github ? (
                  <a href={social.github.startsWith("http") ? social.github : `https://${social.github}`} target="_blank" rel="noreferrer" className="hover:text-amber-400">
                    GitHub
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        <section className="no-print border-t border-white/[0.07] px-5 py-12 md:px-10" style={{ backgroundColor: D.bg }}>
          <div className="mx-auto flex max-w-5xl flex-wrap gap-3">
            {data.cvUrl ? (
              <a
                href={data.cvUrl}
                download={data.cvFileName || `${data.fullName}-CV`}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-200 transition hover:bg-white/5"
              >
                Download CV
              </a>
            ) : null}
            <button type="button" onClick={() => window.print()} className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-400 transition hover:bg-white/5">
              Print / PDF
            </button>
            {visitorChrome ? (
              <>
                {!user && hasApi ? (
                  <Link to="/auth" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-400">
                    Create your portfolio
                  </Link>
                ) : null}
                {user && !isOwner ? (
                  <Link to="/app" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-400">
                    Dashboard
                  </Link>
                ) : null}
              </>
            ) : (
              <>
                <Link to="/app" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-400">
                  Edit in dashboard
                </Link>
                <button type="button" onClick={() => setVisitorPreview(true)} className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-400">
                  Preview as visitor
                </button>
              </>
            )}
          </div>
          <div className="mx-auto mt-10 max-w-5xl text-center">
            {data.showPoweredBy ? (
              <p className="text-xs text-zinc-600">
                Made with{" "}
                <Link to="/" className="underline underline-offset-4 hover:text-amber-500">
                  PortfolioForge
                </Link>
              </p>
            ) : null}
            <Link to="/" className="mt-3 block text-sm text-zinc-600 hover:underline">
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
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute right-2 top-2 z-10 rounded-full border border-white/20 bg-zinc-950/90 px-3 py-1.5 text-xs text-white"
            >
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
                onClick={() =>
                  setLightbox((prev) =>
                    prev ? { ...prev, index: (prev.index + 1) % prev.urls.length } : prev,
                  )
                }
                className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-zinc-950/90 p-2 text-white md:right-2"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            ) : null}
            <img
              src={lightbox.urls[lightbox.index]}
              alt=""
              className="max-h-[88vh] w-auto max-w-[92vw] rounded-2xl border border-white/10 object-contain"
            />
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
