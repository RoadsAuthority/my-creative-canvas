import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  FileDown,
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
} from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { PortfolioThemeLightbox, PortfolioThemePrintBar } from "@/components/portfolio/portfolio-theme-shared";
import { trackProjectClick } from "@/lib/analytics-service";
import type { PortfolioRecord } from "@/lib/portfolio-service";
import type { PortfolioProject } from "@/types/portfolio";

const N = {
  void: "#0d0d0d",
  card: "#161616",
  gold: "#e3bc49",
  line: "rgba(255,255,255,0.12)",
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

export function PortfolioMidnightGoldTheme({
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

  const nameParts = data.fullName.trim().split(/\s+/);
  const first = nameParts[0] ?? "";
  const last = nameParts.slice(1).join(" ");

  const clientStrip = data.projects.slice(0, 4).map((p) => p.title);
  const featuredProjects = data.projects.filter((p) => projectImageUrls(p).length > 0).slice(0, 2);

  return (
    <div
      className="min-h-screen text-zinc-100 antialiased"
      style={{ backgroundColor: N.void, fontFamily: '"DM Sans", system-ui, sans-serif' }}
    >
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0d0d0d]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-10">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: N.gold }} />
            <span className="text-sm font-bold tracking-tight">{data.slug || "portfolio"}</span>
          </div>
          <nav className="hidden items-center gap-10 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 md:flex">
            <button type="button" onClick={() => scrollTo("work")} className="transition hover:text-white">
              Work
            </button>
            <button type="button" onClick={() => scrollTo("about")} className="transition hover:text-white">
              About
            </button>
            <button type="button" onClick={() => scrollTo("contact")} className="transition hover:text-white">
              Contact
            </button>
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-white/5 px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12 lg:items-center">
            <motion.div className="lg:col-span-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">I&apos;m</p>
              <h1 className="mt-2 text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
                <span className="border-b-4 pb-1" style={{ borderColor: N.gold }}>
                  {first}
                </span>
                {last ? <span className="text-zinc-100"> {last}</span> : null}
              </h1>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-zinc-400">{data.headline}</p>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-zinc-500">{aboutTitle}</p>
            </motion.div>
            <div className="relative flex justify-center lg:col-span-7">
              <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-amber-500/10 to-transparent blur-3xl" />
              <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-black">
                <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/70 px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  <span>Portfolio preview</span>
                  <span>{data.projects.length} projects</span>
                </div>
                {heroImage ? (
                  <button
                    type="button"
                    onClick={() => setLightbox({ urls: [heroImage], index: 0 })}
                    className="block w-full overflow-hidden"
                  >
                    <img src={heroImage} alt="" className="aspect-[16/10] w-full object-cover object-top pt-11" />
                  </button>
                ) : (
                  <div className="flex aspect-[16/10] w-full items-center justify-center border border-dashed border-white/15 pt-11 text-sm text-zinc-600">
                    Add photo
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {featuredProjects.length > 0 ? (
          <section className="border-b border-white/5 px-5 py-14 md:px-10 md:py-16" style={{ backgroundColor: N.card }}>
            <div className="mx-auto max-w-6xl">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Featured work</p>
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {featuredProjects.map((project) => {
                  const urls = projectImageUrls(project);
                  return (
                    <article key={`featured-${project.id}`} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f10]">
                      <button type="button" onClick={() => setLightbox({ urls, index: 0 })} className="block w-full overflow-hidden">
                        <img src={urls[0]} alt="" className="aspect-[16/10] w-full object-cover transition duration-500 hover:scale-[1.02]" />
                      </button>
                      <div className="border-t px-5 py-4" style={{ borderColor: N.line }}>
                        <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{project.summary}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {clientStrip.length > 0 ? (
          <section className="border-b border-white/5 py-10" style={{ backgroundColor: N.card }}>
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-5 opacity-50 md:px-10">
              {clientStrip.map((t) => (
                <span key={t} className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-400">
                  {t}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <section id="about" className="scroll-mt-20 px-5 py-20 md:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold text-white md:text-3xl">What I bring</h2>
                <p className="mt-6 leading-relaxed text-zinc-400">{aboutText}</p>
                {bioTrim && !bioSameAsAbout ? <p className="mt-8 whitespace-pre-wrap leading-relaxed text-zinc-500">{data.bio}</p> : null}
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="rounded-xl border border-white/10 p-6" style={{ backgroundColor: N.card }}>
                  <p className="text-3xl font-bold" style={{ color: N.gold }}>
                    {data.projects.length}+
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-wider text-zinc-500">Projects</p>
                </div>
                <div className="rounded-xl border border-white/10 p-6" style={{ backgroundColor: N.card }}>
                  <p className="text-3xl font-bold" style={{ color: N.gold }}>
                    {data.projects.reduce((n, p) => n + cleanTags(p.tags).length, 0) || "—"}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-wider text-zinc-500">Tags</p>
                </div>
                <div className="rounded-xl border border-white/10 p-6" style={{ backgroundColor: N.card }}>
                  <p className="text-3xl font-bold" style={{ color: N.gold }}>
                    {data.location ? "●" : "—"}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-wider text-zinc-500">Location</p>
                </div>
                <div className="rounded-xl border border-white/10 p-6" style={{ backgroundColor: N.card }}>
                  <p className="text-3xl font-bold" style={{ color: N.gold }}>
                    ∞
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-wider text-zinc-500">Drive</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="work" className="scroll-mt-20 border-t border-white/5 px-5 py-20 md:px-10" style={{ backgroundColor: N.card }}>
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold text-white md:text-3xl">Selected work</h2>
            {data.projects.length === 0 ? (
              <p className="mt-10 text-sm text-zinc-500">{isOwner ? "Add projects in the dashboard." : "Coming soon."}</p>
            ) : (
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {data.projects.slice(0, 3).map((project) => {
                  const urls = projectImageUrls(project);
                  return (
                    <div key={project.id} className="flex flex-col rounded-xl border border-white/10 bg-[#0d0d0d] p-6">
                      {urls[0] ? (
                        <button type="button" onClick={() => setLightbox({ urls, index: 0 })} className="mb-4 -mx-2 -mt-2 overflow-hidden rounded-lg">
                          <img src={urls[0]} alt="" className="aspect-[4/3] w-full object-cover" />
                        </button>
                      ) : null}
                      <h3 className="font-bold text-white">{project.title}</h3>
                      <p className="mt-2 flex-1 text-sm text-zinc-500">{project.summary}</p>
                      {project.link ? (
                        <a
                          href={project.link.startsWith("http") ? project.link : `https://${project.link}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold"
                          style={{ color: N.gold }}
                          onClick={() => trackProjectClick(data.slug)}
                        >
                          Show more <ArrowRight className="h-4 w-4" />
                        </a>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
            {data.projects.length > 3 ? (
              <div className="mt-16 space-y-12">
                {data.projects.slice(3).map((project) => {
                  const urls = projectImageUrls(project);
                  const tagList = cleanTags(project.tags);
                  return (
                    <article key={project.id} className="border-t border-white/10 pt-12">
                      <div className="grid gap-8 md:grid-cols-2">
                        <div>
                          {urls[0] ? (
                            <button type="button" onClick={() => setLightbox({ urls, index: 0 })} className="block overflow-hidden rounded-xl">
                              <img src={urls[0]} alt="" className="aspect-video w-full object-cover" />
                            </button>
                          ) : null}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{project.title}</h3>
                          {project.role ? <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">{project.role}</p> : null}
                          <p className="mt-4 text-zinc-400">{project.summary}</p>
                          {tagList.length ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {tagList.map((t) => (
                                <span key={t} className="rounded-md border border-white/10 px-2 py-0.5 text-xs text-zinc-500">
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
                              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold"
                              style={{ color: N.gold }}
                              onClick={() => trackProjectClick(data.slug)}
                            >
                              View project <ArrowUpRight className="h-4 w-4" />
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>

        {hasConnect ? (
          <section id="contact" className="scroll-mt-20 px-5 py-20 md:px-10">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl font-bold md:text-3xl">Contact</h2>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {data.email ? (
                  <a href={`mailto:${data.email}`} className="flex gap-3 rounded-xl border border-white/10 bg-[#161616] p-5 transition hover:border-white/20">
                    <Mail className="h-5 w-5 shrink-0" style={{ color: N.gold }} />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Email</p>
                      <p className="mt-1 break-words text-sm">{data.email}</p>
                    </div>
                  </a>
                ) : null}
                {data.location ? (
                  <div className="flex gap-3 rounded-xl border border-white/10 bg-[#161616] p-5">
                    <MapPin className="h-5 w-5 shrink-0 text-zinc-500" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Location</p>
                      <p className="mt-1 text-sm">{data.location}</p>
                    </div>
                  </div>
                ) : null}
                {data.cvUrl ? (
                  <a href={data.cvUrl} download={data.cvFileName || `${data.fullName}-CV`} className="flex gap-3 rounded-xl border border-white/10 bg-[#161616] p-5 transition hover:border-white/20">
                    <FileDown className="h-5 w-5 shrink-0" style={{ color: N.gold }} />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">CV</p>
                      <p className="mt-1 text-sm">Download</p>
                    </div>
                  </a>
                ) : null}
                {social?.website ? (
                  <a href={social.website.startsWith("http") ? social.website : `https://${social.website}`} target="_blank" rel="noreferrer" className="flex gap-3 rounded-xl border border-white/10 bg-[#161616] p-5">
                    <Globe className="h-5 w-5 shrink-0 text-zinc-500" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Web</p>
                      <p className="mt-1 break-words text-sm">{social.website}</p>
                    </div>
                  </a>
                ) : null}
                {social?.linkedin ? (
                  <a href={social.linkedin.startsWith("http") ? social.linkedin : `https://${social.linkedin}`} target="_blank" rel="noreferrer" className="flex gap-3 rounded-xl border border-white/10 bg-[#161616] p-5">
                    <Linkedin className="h-5 w-5 shrink-0 text-zinc-500" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">LinkedIn</p>
                      <p className="mt-1 break-words text-sm">{social.linkedin}</p>
                    </div>
                  </a>
                ) : null}
                {social?.github ? (
                  <a href={social.github.startsWith("http") ? social.github : `https://${social.github}`} target="_blank" rel="noreferrer" className="flex gap-3 rounded-xl border border-white/10 bg-[#161616] p-5">
                    <Github className="h-5 w-5 shrink-0 text-zinc-500" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">GitHub</p>
                      <p className="mt-1 break-words text-sm">{social.github}</p>
                    </div>
                  </a>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {hasSeoMeta ? (
          <section className="border-t border-white/5 px-5 py-12 md:px-10">
            <div className="mx-auto max-w-3xl">
              <details className="rounded-xl border border-white/10 bg-[#161616] p-5">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-zinc-500">SEO</summary>
                <div className="mt-4 space-y-2 text-sm text-zinc-400">
                  {social?.seoTitle ? <p>{social.seoTitle}</p> : null}
                  {social?.seoDescription ? <p className="whitespace-pre-wrap">{social.seoDescription}</p> : null}
                  {social?.seoOgImageUrl ? <p className="break-all">{social.seoOgImageUrl}</p> : null}
                </div>
              </details>
            </div>
          </section>
        ) : null}

        <PortfolioThemePrintBar
          data={data}
          visitorChrome={visitorChrome}
          isOwner={isOwner}
          user={user}
          hasApi={hasApi}
          setVisitorPreview={setVisitorPreview}
          sectionClassName="border-white/10 bg-[#0d0d0d]"
          buttonPrimaryClass="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-100 transition hover:bg-white/10"
          buttonMutedClass="rounded-full border border-white/10 px-5 py-2.5 text-sm text-zinc-500 transition hover:bg-white/5"
          poweredByClass="text-xs text-zinc-600"
          homeLinkClass="mt-2 block text-sm text-zinc-600 hover:text-zinc-400"
        />
      </main>

      <SiteFooter />
      <PortfolioThemeLightbox lightbox={lightbox} setLightbox={setLightbox} />
    </div>
  );
}
