import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { useMemo, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { SiteFooter } from "@/components/SiteFooter";
import { trackProjectClick } from "@/lib/analytics-service";
import { cn } from "@/lib/utils";
import type { PortfolioRecord } from "@/lib/portfolio-service";
import type { PortfolioProject } from "@/types/portfolio";

/** Editorial vintage — dark canvas; work blocks read as floating mood boards on neutral “paper” */
const E = {
  bg: "#0a0a0a",
  bgLift: "#121210",
  moodPaper: "#e6e4df",
  moodLine: "#c4c2bc",
  ink: "#f2ede4",
  muted: "#9a9288",
  gold: "#c9a962",
  goldDim: "#8a7a5c",
} as const;

/** Tailwind cell classes for an overlapping 12-col mood grid (sm+). Mobile stacks naturally. */
const MOOD_GRID: Record<number, string[]> = {
  1: ["col-span-12 mx-auto w-full max-w-lg justify-self-center aspect-[3/4]"],
  2: [
    "col-span-12 sm:col-span-7 sm:row-start-1 aspect-[3/5] max-h-[min(72vh,560px)]",
    "col-span-12 sm:col-span-5 sm:col-start-8 sm:row-start-1 sm:-mt-14 sm:self-start aspect-[4/5] sm:z-10 sm:max-h-[min(56vh,440px)]",
  ],
  3: [
    "col-span-12 sm:col-span-5 sm:row-start-1 aspect-[3/4]",
    "col-span-6 sm:col-span-4 sm:col-start-6 sm:row-start-1 sm:-mt-6 aspect-square sm:z-10",
    "col-span-6 sm:col-span-3 sm:col-start-10 sm:row-start-2 aspect-[5/6] sm:translate-y-[-0.75rem]",
  ],
  4: [
    "col-span-12 sm:col-span-5 sm:row-span-2 sm:row-start-1 aspect-[3/5] max-h-[min(70vh,520px)]",
    "col-span-12 sm:col-span-7 sm:col-start-6 sm:row-start-1 aspect-video sm:-translate-x-1",
    "col-span-6 sm:col-span-4 sm:col-start-1 sm:row-start-3 aspect-square sm:-mt-8 sm:translate-x-1",
    "col-span-6 sm:col-span-8 sm:col-start-5 sm:row-start-3 aspect-[16/10]",
  ],
  5: [
    "col-span-6 sm:col-span-4 aspect-[3/4]",
    "col-span-6 sm:col-span-4 sm:col-start-5 sm:-mt-4 aspect-square sm:z-10",
    "col-span-6 sm:col-span-4 sm:col-start-9 sm:row-start-1 aspect-[5/7] sm:translate-y-4",
    "col-span-6 sm:col-span-5 sm:col-start-2 sm:row-start-3 aspect-video",
    "col-span-6 sm:col-span-5 sm:col-start-8 sm:row-start-3 aspect-[4/5] sm:-translate-y-3",
  ],
  6: [
    "col-span-6 sm:col-span-4 aspect-[3/5]",
    "col-span-6 sm:col-span-4 sm:col-start-5 aspect-square sm:-mt-6 sm:z-10",
    "col-span-6 sm:col-span-4 sm:col-start-9 sm:row-start-1 aspect-[4/5] sm:translate-y-2",
    "col-span-6 sm:col-span-5 sm:col-start-1 sm:row-start-3 aspect-[2/3]",
    "col-span-6 sm:col-span-7 sm:col-start-6 sm:row-start-3 aspect-video sm:-translate-y-2",
    "col-span-12 sm:col-span-4 sm:col-start-5 sm:row-start-4 aspect-[5/6] sm:mx-auto sm:translate-y-[-0.5rem]",
  ],
};

function moodCellClass(index: number, total: number): string {
  const key = Math.min(Math.max(total, 1), 6) as keyof typeof MOOD_GRID;
  const row = MOOD_GRID[key]?.[index];
  return row ?? "col-span-6 sm:col-span-4 aspect-[3/4]";
}

/** Flat “tear sheet” tile — no gold frame, sharp corners, optional hairline for separation */
function moodTileClass(extra?: string) {
  return cn(
    "block w-full overflow-hidden rounded-none bg-neutral-300/25 shadow-none ring-0 transition duration-300 hover:opacity-[0.96] hover:brightness-[1.02]",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a962]/50",
    extra,
  );
}

/** Stable hash for per-image drift params (deterministic across renders). */
function driftHash(projectId: string, imageIndex: number, salt = 0): number {
  const s = `${projectId}\0${imageIndex}\0${salt}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function moodDriftMotion(projectId: string, imageIndex: number) {
  const h = driftHash(projectId, imageIndex);
  const h2 = driftHash(projectId, imageIndex, 1);
  const duration = 4.1 + (h % 50) / 10;
  const delay = (h2 % 90) / 24;
  const yAmp = 2.5 + (h % 50) / 25;
  const xAmp = 1.2 + (h2 % 35) / 25;
  const rot = ((h >> 3) % 17) / 10 - 0.8;
  return {
    animate: {
      y: [0, -yAmp, yAmp * 0.45, 0],
      x: [0, xAmp * 0.55, -xAmp, 0],
      rotate: [0, rot * 0.45, -rot * 0.35, 0],
    },
    transition: {
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut" as const,
      times: [0, 0.33, 0.66, 1],
    },
  };
}

type MoodDriftButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  projectId: string;
  imageIndex: number;
  className?: string;
  children: ReactNode;
};

function MoodDriftButton({ projectId, imageIndex, className, children, ...rest }: MoodDriftButtonProps) {
  const reduceMotion = useReducedMotion();
  const drift = useMemo(() => moodDriftMotion(projectId, imageIndex), [projectId, imageIndex]);

  if (reduceMotion) {
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
      animate={drift.animate}
      transition={drift.transition}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

/** Same drift logic for a non-button wrapper (e.g. video block) — uses a dedicated slot index. */
function MoodDriftSurface({
  projectId,
  slotIndex,
  className,
  children,
}: {
  projectId: string;
  slotIndex: number;
  className?: string;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const drift = useMemo(() => moodDriftMotion(projectId, slotIndex), [projectId, slotIndex]);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} animate={drift.animate} transition={drift.transition}>
      {children}
    </motion.div>
  );
}

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

export function PortfolioVintageEditorialTheme({
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
  const aboutImage =
    data.profileImageUrl ||
    data.projects.find((p) => projectImageUrls(p).length > 0)?.imageUrls?.[0] ||
    data.projects.find((p) => p.imageUrl)?.imageUrl ||
    "";

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div
      className="min-h-screen text-[#f2ede4]"
      style={{
        backgroundColor: E.bg,
        fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0a0a0a]/90 px-5 py-5 backdrop-blur-md md:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <p
            className="font-['Cormorant_Garamond',Georgia,serif] text-lg font-semibold uppercase tracking-[0.28em] md:text-xl"
            style={{ color: E.ink }}
          >
            {data.fullName}
          </p>
          <nav className="flex flex-wrap items-center gap-6 text-[0.65rem] uppercase tracking-[0.22em]" style={{ color: E.muted }}>
            <button type="button" onClick={() => scrollTo("hero")} className="transition hover:text-[#c9a962]">
              Home
            </button>
            <button type="button" onClick={() => scrollTo("work")} className="transition hover:text-[#c9a962]">
              Work
            </button>
            <button type="button" onClick={() => scrollTo("about")} className="transition hover:text-[#c9a962]">
              About
            </button>
            {data.email ? (
              <a href={`mailto:${data.email}`} className="inline-flex items-center gap-1.5 transition hover:text-[#c9a962]">
                <Mail className="h-3.5 w-3.5" />
                Contact
              </a>
            ) : null}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section
          id="hero"
          className="relative flex min-h-[88vh] flex-col justify-end pb-24 pt-8 md:min-h-[90vh] md:pb-32"
        >
          {heroImage ? (
            <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(165deg, #1a1510 0%, ${E.bgLift} 50%, ${E.bg} 100%)`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/25" aria-hidden />
          <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden>
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-5xl px-5 md:px-10">
            {data.location ? (
              <p className="text-[0.65rem] uppercase tracking-[0.35em]" style={{ color: E.goldDim }}>
                {data.location}
              </p>
            ) : null}
            <h1
              className="mt-4 max-w-4xl font-['Cormorant_Garamond',Georgia,serif] text-4xl font-semibold uppercase leading-[1.05] tracking-[0.06em] md:text-5xl lg:text-6xl"
              style={{ color: E.ink, textShadow: "0 2px 48px rgba(0,0,0,0.5)" }}
            >
              {data.headline}
            </h1>
            <div className="mt-10 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => scrollTo("tagline")}
                className="rounded-sm border px-8 py-3 text-[0.65rem] font-medium uppercase tracking-[0.3em] transition hover:bg-white/[0.06]"
                style={{ borderColor: `${E.gold}88`, color: E.gold }}
              >
                Learn more
              </button>
              {data.cvUrl ? (
                <a
                  href={data.cvUrl}
                  download={data.cvFileName || `${data.fullName}-CV`}
                  className="rounded-sm border border-white/15 px-8 py-3 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-[#e8e4dc] transition hover:bg-white/[0.06]"
                >
                  Résumé
                </a>
              ) : null}
            </div>
          </div>
        </section>

        {/* Tagline band */}
        <section id="tagline" className="scroll-mt-24 border-y border-white/[0.06] px-5 py-20 md:px-10 md:py-28" style={{ backgroundColor: E.bgLift }}>
          <p
            className="mx-auto max-w-4xl text-center font-['Cormorant_Garamond',Georgia,serif] text-xl font-medium uppercase leading-relaxed tracking-[0.14em] md:text-2xl"
            style={{ color: E.ink }}
          >
            {aboutTitle}
          </p>
        </section>

        {/* Work — mood boards on neutral paper; images float (no boxed frame); captions on dark canvas */}
        <section id="work" className="scroll-mt-24 py-20 md:py-28" style={{ backgroundColor: E.bg }}>
          <div className="mx-auto max-w-6xl px-5 md:px-10">
            <div className="mb-14 text-center">
              <p className="text-[0.65rem] uppercase tracking-[0.35em]" style={{ color: E.goldDim }}>
                Portfolio
              </p>
              <h2
                className="mt-3 font-['Cormorant_Garamond',Georgia,serif] text-3xl font-semibold uppercase tracking-[0.12em] md:text-4xl"
                style={{ color: E.ink }}
              >
                Selected work
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-sm" style={{ color: E.muted }}>
                {data.location ? `${data.location} · ` : null}
                Tap any image to expand — laid out as a mood board, not a gallery grid
              </p>
            </div>

            {data.projects.length === 0 ? (
              <p className="text-center text-sm" style={{ color: E.muted }}>
                {isOwner ? "Add projects from your dashboard to fill this section." : "Work will appear here soon."}
              </p>
            ) : (
              <div className="divide-y divide-white/[0.08]">
                {data.projects.map((project, idx) => {
                  const urls = projectImageUrls(project);
                  const n = urls.length;
                  const hasMedia = n > 0 || (project.videoUrls?.length ?? 0) > 0;
                  const many = n > 6;
                  const aspectCycle = [
                    "aspect-[3/4]",
                    "aspect-square",
                    "aspect-[5/6]",
                    "aspect-video",
                    "aspect-[2/3]",
                    "aspect-[4/5]",
                  ];

                  return (
                    <motion.article
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.04 }}
                      className="group pb-20 pt-16 first:pt-0 md:pb-24"
                    >
                      {/* Full-bleed “paper” strip — not a card; images sit directly on the sheet */}
                      <div className="relative -mx-5 border-y border-black/[0.07] md:-mx-10" style={{ backgroundColor: E.moodPaper }}>
                        <div
                          className="pointer-events-none absolute inset-0 opacity-[0.45]"
                          aria-hidden
                          style={{
                            backgroundImage: `linear-gradient(${E.moodLine}33 1px, transparent 1px)`,
                            backgroundSize: "100% 11px",
                          }}
                        />
                        <div className="pointer-events-none absolute left-5 top-8 flex gap-1.5 opacity-40 md:left-10 md:top-10">
                          <span className="inline-block h-12 w-px" style={{ backgroundColor: E.moodLine }} />
                          <span className="inline-block h-16 w-px" style={{ backgroundColor: E.moodLine }} />
                        </div>

                        <div className="relative z-[1] mx-auto max-w-5xl px-6 pb-14 pt-16 md:px-14 md:pb-16 md:pt-20">
                          <p className="mb-10 pl-2 font-mono text-[0.65rem] tracking-[0.12em] text-neutral-600 md:pl-4">
                            {(idx + 1).toString().padStart(2, "0")} · mood board
                          </p>

                          {hasMedia ? (
                            <>
                              {n > 0 ? (
                                many ? (
                                  <div className="columns-2 gap-x-3 md:columns-3 md:gap-x-4">
                                    {urls.map((url, i) => (
                                      <MoodDriftButton
                                        key={`${project.id}-c-${i}`}
                                        projectId={project.id}
                                        imageIndex={i}
                                        onClick={() => setLightbox({ urls, index: i })}
                                        className={cn(
                                          moodTileClass("mb-3 break-inside-avoid"),
                                          aspectCycle[i % aspectCycle.length],
                                          i % 5 === 2 && "-translate-y-1",
                                          i % 7 === 4 && "md:translate-y-1",
                                        )}
                                      >
                                        <img src={url} alt="" className="h-full w-full object-cover" />
                                      </MoodDriftButton>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:auto-rows-auto sm:gap-x-3 sm:gap-y-3">
                                    {urls.map((url, i) => (
                                      <MoodDriftButton
                                        key={`${project.id}-g-${i}`}
                                        projectId={project.id}
                                        imageIndex={i}
                                        onClick={() => setLightbox({ urls, index: i })}
                                        className={cn(moodTileClass(), moodCellClass(i, n))}
                                      >
                                        <img
                                          src={url}
                                          alt=""
                                          className="h-full w-full min-h-0 object-cover"
                                        />
                                      </MoodDriftButton>
                                    ))}
                                  </div>
                                )
                              ) : null}

                              {(project.videoUrls?.length ?? 0) > 0 ? (
                                <MoodDriftSurface
                                  projectId={project.id}
                                  slotIndex={823}
                                  className={cn(
                                    "mt-8 overflow-hidden rounded-none bg-black/[0.06] sm:mt-10",
                                    n === 0 && "mt-0",
                                  )}
                                >
                                  <video
                                    src={project.videoUrls?.[0]}
                                    controls
                                    className="aspect-video w-full object-cover"
                                  />
                                </MoodDriftSurface>
                              ) : null}
                            </>
                          ) : (
                            <div className="flex min-h-[10rem] items-center justify-center border border-dashed border-neutral-400/50 bg-white/30 px-6 text-center text-[0.65rem] uppercase tracking-[0.2em] text-neutral-500">
                              Add images in the editor
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mx-auto mt-12 max-w-3xl px-1 md:mt-14">
                        <h3
                          className="font-['Cormorant_Garamond',Georgia,serif] text-2xl font-semibold leading-tight md:text-[1.75rem]"
                          style={{ color: E.ink }}
                        >
                          {project.title}
                        </h3>
                        {project.role ? (
                          <p className="mt-2 text-[0.65rem] uppercase tracking-[0.22em]" style={{ color: E.goldDim }}>
                            {project.role}
                          </p>
                        ) : null}
                        <p className="mt-5 text-sm leading-relaxed" style={{ color: E.muted }}>
                          {project.summary}
                        </p>
                        {project.link ? (
                          <a
                            href={project.link.startsWith("http") ? project.link : `https://${project.link}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-[0.65rem] uppercase tracking-[0.22em] transition hover:bg-white/[0.06]"
                            style={{ color: E.gold }}
                            onClick={() => trackProjectClick(data.slug)}
                          >
                            View project
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="mt-8 inline-block text-[0.65rem] uppercase tracking-[0.22em]" style={{ color: E.muted }}>
                            —
                          </span>
                        )}
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* About */}
        <section id="about" className="scroll-mt-24 border-t border-white/[0.06] px-5 py-20 md:px-10 md:py-28" style={{ backgroundColor: E.bgLift }}>
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center md:gap-16">
            <div className="relative order-2 md:order-1">
              {aboutImage ? (
                <button
                  type="button"
                  onClick={() => setLightbox({ urls: [aboutImage], index: 0 })}
                  className="mx-auto block w-full max-w-md overflow-hidden rounded-none bg-neutral-800/30 transition hover:opacity-95"
                >
                  <img src={aboutImage} alt="" className="aspect-[3/4] w-full object-cover" />
                </button>
              ) : (
                <div className="mx-auto flex aspect-[3/4] w-full max-w-md items-center justify-center rounded-none border border-dashed border-white/15 bg-white/[0.03]">
                  <span className="px-6 text-xs uppercase tracking-[0.2em]" style={{ color: E.muted }}>
                    Photo
                  </span>
                </div>
              )}
            </div>
            <div className="order-1 md:order-2">
              <p className="text-[0.65rem] uppercase tracking-[0.35em]" style={{ color: E.goldDim }}>
                About
              </p>
              <h2
                className="mt-4 font-['Cormorant_Garamond',Georgia,serif] text-3xl font-semibold uppercase leading-tight tracking-[0.08em] md:text-4xl"
                style={{ color: E.ink }}
              >
                {data.fullName}
              </h2>
              <p className="mt-8 text-base leading-relaxed md:text-lg" style={{ color: E.muted }}>
                {aboutText}
              </p>
              {hasSocial ? (
                <div className="mt-10 flex flex-wrap gap-6 text-sm" style={{ color: E.goldDim }}>
                  {social?.website ? (
                    <a
                      href={social.website.startsWith("http") ? social.website : `https://${social.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="border-b border-transparent transition hover:border-[#c9a962] hover:text-[#c9a962]"
                    >
                      Website
                    </a>
                  ) : null}
                  {social?.linkedin ? (
                    <a
                      href={social.linkedin.startsWith("http") ? social.linkedin : `https://${social.linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                      className="border-b border-transparent transition hover:border-[#c9a962] hover:text-[#c9a962]"
                    >
                      LinkedIn
                    </a>
                  ) : null}
                  {social?.github ? (
                    <a
                      href={social.github.startsWith("http") ? social.github : `https://${social.github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="border-b border-transparent transition hover:border-[#c9a962] hover:text-[#c9a962]"
                    >
                      GitHub
                    </a>
                  ) : null}
                </div>
              ) : null}
              <div className="mt-10 flex flex-wrap gap-4">
                {data.cvUrl ? (
                  <a
                    href={data.cvUrl}
                    download={data.cvFileName || `${data.fullName}-CV`}
                    className="rounded-sm border px-8 py-3 text-[0.65rem] font-medium uppercase tracking-[0.3em] transition hover:bg-white/[0.06]"
                    style={{ borderColor: `${E.gold}88`, color: E.gold }}
                  >
                    Learn more
                  </a>
                ) : null}
                {data.email ? (
                  <a
                    href={`mailto:${data.email}`}
                    className="rounded-sm border border-white/15 px-8 py-3 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-[#e8e4dc] transition hover:bg-white/[0.06]"
                  >
                    Get in touch
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="no-print border-t border-white/[0.07] px-5 py-12 md:px-10" style={{ backgroundColor: E.bg }}>
          <div className="mx-auto flex max-w-5xl flex-wrap gap-3">
            {data.cvUrl ? (
              <a
                href={data.cvUrl}
                download={data.cvFileName || `${data.fullName}-CV`}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm transition hover:bg-white/5"
                style={{ color: E.ink }}
              >
                Download CV
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-[#e8e4dc] transition hover:bg-white/5"
            >
              Print / PDF
            </button>
            {visitorChrome ? (
              <>
                {!user && hasApi ? (
                  <Link to="/auth" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-[#e8e4dc]">
                    Create your portfolio
                  </Link>
                ) : null}
                {user && !isOwner ? (
                  <Link to="/app" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-[#e8e4dc]">
                    Dashboard
                  </Link>
                ) : null}
              </>
            ) : (
              <>
                <Link to="/app" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-[#e8e4dc]">
                  Edit in dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => setVisitorPreview(true)}
                  className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-[#e8e4dc]"
                >
                  Preview as visitor
                </button>
              </>
            )}
          </div>
          <div className="mx-auto mt-10 max-w-5xl text-center">
            {data.showPoweredBy ? (
              <p className="text-xs" style={{ color: E.muted }}>
                Made with{" "}
                <Link to="/" className="underline underline-offset-4 hover:text-[#c9a962]">
                  PortfolioForge
                </Link>
              </p>
            ) : null}
            <Link to="/" className="mt-3 block text-sm opacity-80 hover:underline" style={{ color: E.muted }}>
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
