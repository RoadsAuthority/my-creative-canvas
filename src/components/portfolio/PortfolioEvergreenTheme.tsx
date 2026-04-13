import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  FileDown,
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
} from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";
import { Link } from "react-router-dom";
import { SiteFooter } from "@/components/SiteFooter";
import { PortfolioThemeLightbox, PortfolioThemePrintBar } from "@/components/portfolio/portfolio-theme-shared";
import { trackProjectClick } from "@/lib/analytics-service";
import type { PortfolioRecord } from "@/lib/portfolio-service";
import type { PortfolioProject } from "@/types/portfolio";

const E = {
  forest: "#143d36",
  forestDeep: "#0f2e28",
  accent: "#f0a534",
  paper: "#ffffff",
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

export function PortfolioEvergreenTheme({
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

  const steps = [
    { n: "01", title: "Discover", body: aboutTitle.slice(0, 120) + (aboutTitle.length > 120 ? "…" : "") },
    { n: "02", title: "Collaborate", body: aboutText.slice(0, 140) + (aboutText.length > 140 ? "…" : "") },
    { n: "03", title: "Ship", body: `Currently ${data.projects.length} project${data.projects.length === 1 ? "" : "s"} in the portfolio.` },
  ];

  return (
    <div className="min-h-screen antialiased" style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}>
      <header
        className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-md"
        style={{ backgroundColor: `${E.forest}f2` }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-10">
          <span className="text-lg font-bold tracking-tight text-white">{data.slug || "portfolio"}</span>
          <nav className="hidden items-center gap-8 text-sm font-medium text-white/85 md:flex">
            <button type="button" onClick={() => scrollTo("about")} className="transition hover:text-white">
              About
            </button>
            <button type="button" onClick={() => scrollTo("work")} className="transition hover:text-white">
              Work
            </button>
            <button type="button" onClick={() => scrollTo("contact")} className="transition hover:text-white">
              Contact
            </button>
          </nav>
          {data.email ? (
            <a
              href={`mailto:${data.email}`}
              className="hidden rounded-full px-5 py-2 text-sm font-semibold text-[#143d36] md:inline-block"
              style={{ backgroundColor: E.accent }}
            >
              Email
            </a>
          ) : null}
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden pb-0 text-white" style={{ backgroundColor: E.forest }}>
          <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-16 md:grid-cols-2 md:items-center md:gap-12 md:px-10 md:pt-24">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">{data.headline}</h1>
              <p className="mt-6 max-w-lg text-lg text-white/85">{aboutTitle}</p>
              <div className="mt-10 flex flex-wrap gap-8 border-t border-white/15 pt-8">
                <div>
                  <p className="text-3xl font-bold" style={{ color: E.accent }}>
                    {data.projects.length}+
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-white/60">Projects</p>
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: E.accent }}>
                    {data.location ? "1" : "—"}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-white/60">Base</p>
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: E.accent }}>
                    100%
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-white/60">You</p>
                </div>
              </div>
            </motion.div>
            <div className="relative flex justify-center pb-8 md:pb-0">
              <div
                className="relative aspect-square w-full max-w-md overflow-hidden rounded-full border-4 border-white/20 shadow-2xl md:translate-y-8"
                style={{ backgroundColor: E.forestDeep }}
              >
                {heroImage ? (
                  <button type="button" onClick={() => setLightbox({ urls: [heroImage], index: 0 })} className="h-full w-full">
                    <img src={heroImage} alt="" className="h-full w-full object-cover object-top" />
                  </button>
                ) : (
                  <div className="flex h-full min-h-[240px] items-center justify-center text-sm text-white/50">Photo</div>
                )}
              </div>
            </div>
          </div>
          <div className="relative mt-8 h-16 w-full md:mt-16" aria-hidden>
            <svg className="absolute bottom-0 w-full text-white" viewBox="0 0 1440 64" preserveAspectRatio="none" style={{ height: "4rem" }}>
              <path fill="currentColor" d="M0,64 L1440,64 L1440,24 C1080,0 720,64 360,32 C120,16 0,32 0,48 Z" />
            </svg>
          </div>
        </section>

        <section id="about" className="scroll-mt-20 bg-white px-5 py-20 md:px-10">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold md:text-4xl" style={{ color: E.forest }}>
              Why work together
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-neutral-600">
              Clear process, thoughtful craft, and outcomes you can measure — drawn from your dashboard copy.
            </p>
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {[0, 1, 2].map((i) => {
                const p = data.projects[i];
                const title = p?.title ?? ["Focus", "Process", "Delivery"][i];
                const body =
                  p?.summary?.trim() ||
                  [aboutText.slice(0, 140), aboutText.slice(140, 280), aboutTitle][i] ||
                  aboutTitle;
                return (
                  <div key={p?.id ?? `h-${i}`} className="relative rounded-2xl border border-neutral-200/80 bg-white p-8 shadow-sm">
                    <div className="absolute left-4 top-4 h-8 w-8 rounded-tl-lg border-l-2 border-t-2" style={{ borderColor: E.forest }} />
                    <div className="absolute bottom-4 right-4 h-8 w-8 rounded-br-lg border-b-2 border-r-2" style={{ borderColor: E.forest }} />
                    <CheckCircle2 className="h-8 w-8" style={{ color: E.forest }} />
                    <h3 className="mt-6 text-lg font-bold" style={{ color: E.forest }}>
                      {title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-600">{body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-neutral-100 bg-neutral-50 px-5 py-20 md:px-10">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-2xl font-bold md:text-3xl" style={{ color: E.forest }}>
              How we get there
            </h2>
            <div className="mt-14 grid gap-12 lg:grid-cols-3">
              {steps.map((s) => (
                <div key={s.n} className="flex gap-4">
                  <span className="font-mono text-3xl font-bold text-neutral-300">{s.n}</span>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
            {bioTrim && !bioSameAsAbout ? (
              <p className="mx-auto mt-12 max-w-3xl whitespace-pre-wrap text-center text-neutral-700">{data.bio}</p>
            ) : null}
          </div>
        </section>

        <section id="work" className="scroll-mt-20 px-5 py-20 text-white md:px-10" style={{ backgroundColor: E.forest }}>
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold md:text-4xl">Selected work</h2>
            <p className="mt-3 max-w-xl text-white/75">Case studies from your editor.</p>
            {data.projects.length === 0 ? (
              <p className="mt-12 text-sm text-white/60">{isOwner ? "Add projects from the dashboard." : "Nothing published yet."}</p>
            ) : (
              <div className="mt-12 grid gap-8 md:grid-cols-3">
                {data.projects.map((project) => {
                  const urls = projectImageUrls(project);
                  const tagList = cleanTags(project.tags);
                  return (
                    <article
                      key={project.id}
                      className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                    >
                      {urls[0] ? (
                        <button type="button" onClick={() => setLightbox({ urls, index: 0 })} className="-mx-2 -mt-2 mb-4 overflow-hidden rounded-xl">
                          <img src={urls[0]} alt="" className="aspect-video w-full object-cover" />
                        </button>
                      ) : null}
                      <h3 className="text-lg font-bold">{project.title}</h3>
                      {project.role ? <p className="mt-1 text-xs uppercase tracking-wider text-white/55">{project.role}</p> : null}
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-white/80">{project.summary}</p>
                      {tagList.length ? (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {tagList.slice(0, 4).map((t) => (
                            <span key={t} className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/85">
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
                          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold"
                          style={{ color: E.accent }}
                          onClick={() => trackProjectClick(data.slug)}
                        >
                          View <ArrowUpRight className="h-4 w-4" />
                        </a>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {hasConnect ? (
          <section id="contact" className="scroll-mt-20 bg-white px-5 py-20 md:px-10">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-3xl font-bold md:text-4xl" style={{ color: E.forest }}>
                Contact
              </h2>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {data.email ? (
                  <a href={`mailto:${data.email}`} className="flex gap-3 rounded-xl border border-neutral-200 p-5 transition hover:border-neutral-400">
                    <Mail className="h-5 w-5 shrink-0" style={{ color: E.forest }} />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Email</p>
                      <p className="mt-1 break-all text-sm">{data.email}</p>
                    </div>
                  </a>
                ) : null}
                {data.location ? (
                  <div className="flex gap-3 rounded-xl border border-neutral-200 p-5">
                    <MapPin className="h-5 w-5 shrink-0 text-neutral-500" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Location</p>
                      <p className="mt-1 text-sm">{data.location}</p>
                    </div>
                  </div>
                ) : null}
                {data.cvUrl ? (
                  <a href={data.cvUrl} download={data.cvFileName || `${data.fullName}-CV`} className="flex gap-3 rounded-xl border border-neutral-200 p-5 transition hover:border-neutral-400">
                    <FileDown className="h-5 w-5 shrink-0" style={{ color: E.forest }} />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Résumé</p>
                      <p className="mt-1 text-sm">Download</p>
                    </div>
                  </a>
                ) : null}
                {social?.website ? (
                  <a href={social.website.startsWith("http") ? social.website : `https://${social.website}`} target="_blank" rel="noreferrer" className="flex gap-3 rounded-xl border border-neutral-200 p-5 transition hover:border-neutral-400">
                    <Globe className="h-5 w-5 shrink-0 text-neutral-500" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Website</p>
                      <p className="mt-1 break-all text-sm">{social.website}</p>
                    </div>
                  </a>
                ) : null}
                {social?.linkedin ? (
                  <a href={social.linkedin.startsWith("http") ? social.linkedin : `https://${social.linkedin}`} target="_blank" rel="noreferrer" className="flex gap-3 rounded-xl border border-neutral-200 p-5 transition hover:border-neutral-400">
                    <Linkedin className="h-5 w-5 shrink-0 text-neutral-500" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">LinkedIn</p>
                      <p className="mt-1 break-all text-sm">{social.linkedin}</p>
                    </div>
                  </a>
                ) : null}
                {social?.github ? (
                  <a href={social.github.startsWith("http") ? social.github : `https://${social.github}`} target="_blank" rel="noreferrer" className="flex gap-3 rounded-xl border border-neutral-200 p-5 transition hover:border-neutral-400">
                    <Github className="h-5 w-5 shrink-0 text-neutral-500" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">GitHub</p>
                      <p className="mt-1 break-all text-sm">{social.github}</p>
                    </div>
                  </a>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {hasSeoMeta ? (
          <section className="border-t border-neutral-200 bg-neutral-50 px-5 py-12 md:px-10">
            <div className="mx-auto max-w-3xl">
              <details className="rounded-xl border border-neutral-200 bg-white p-5">
                <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-neutral-500">SEO meta</summary>
                <div className="mt-4 space-y-2 text-sm text-neutral-600">
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
          sectionClassName="border-neutral-200 bg-white"
          buttonPrimaryClass="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
          buttonMutedClass="rounded-full border border-neutral-200 px-5 py-2.5 text-sm text-neutral-600 transition hover:bg-neutral-50"
        />
      </main>

      <SiteFooter />
      <PortfolioThemeLightbox lightbox={lightbox} setLightbox={setLightbox} />
    </div>
  );
}
