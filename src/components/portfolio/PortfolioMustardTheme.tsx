import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
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

const M = {
  paper: "#f7f5f0",
  ink: "#111111",
  muted: "#5c5c5c",
  mustard: "#c9a227",
  mustardDark: "#a68518",
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

export function PortfolioMustardTheme({
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
  const firstName = nameParts[0] ?? data.fullName;
  const restName = nameParts.slice(1).join(" ") || "";

  return (
    <div
      className="min-h-screen text-[#111] antialiased"
      style={{ backgroundColor: M.paper, fontFamily: '"DM Sans", system-ui, sans-serif' }}
    >
      <header className="sticky top-0 z-40 border-b border-black/5 bg-[#f7f5f0]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <span className="text-sm font-bold tracking-tight">{data.slug || "portfolio"}</span>
          <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600 sm:flex">
            <button type="button" onClick={() => scrollTo("about")} className="transition hover:text-black">
              About
            </button>
            <button type="button" onClick={() => scrollTo("work")} className="transition hover:text-black">
              Portfolio
            </button>
            <button type="button" onClick={() => scrollTo("contact")} className="transition hover:text-black">
              Contact
            </button>
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-black/5 bg-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center md:gap-16 md:px-8 md:py-24">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-neutral-500">Hello —</p>
              <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                <span className="block">{firstName}</span>
                {restName ? (
                  <span className="mt-1 inline-block border-b-4 pb-1" style={{ borderColor: M.mustard }}>
                    {restName}
                  </span>
                ) : null}
              </h1>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.15em] text-neutral-500">{data.headline}</p>
              <p className="mt-6 max-w-md text-base leading-relaxed text-neutral-600">{aboutTitle}</p>
              <button
                type="button"
                onClick={() => scrollTo("about")}
                className="mt-8 rounded-full px-8 py-3 text-sm font-bold text-white transition hover:opacity-90"
                style={{ backgroundColor: M.mustard }}
              >
                More about me
              </button>
            </motion.div>
            <div className="relative min-h-[280px] md:min-h-[420px]">
              <div className="absolute inset-0 rounded-2xl bg-neutral-200/80" />
              {heroImage ? (
                <button
                  type="button"
                  onClick={() => setLightbox({ urls: [heroImage], index: 0 })}
                  className="relative h-full min-h-[280px] w-full overflow-hidden rounded-2xl md:min-h-[420px]"
                >
                  <img src={heroImage} alt="" className="h-full w-full object-cover object-top grayscale contrast-[0.95]" />
                </button>
              ) : (
                <div className="relative flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-neutral-300 text-sm text-neutral-400 md:min-h-[420px]">
                  Add a profile photo
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-20 border-b border-black/5">
          <div className="mx-auto max-w-6xl px-5 py-16 md:flex md:px-8 md:py-20">
            <div className="mb-10 shrink-0 md:mb-0 md:w-44 md:border-r md:border-black/10 md:pr-8">
              {heroImage ? (
                <img src={heroImage} alt="" className="mx-auto h-20 w-20 rounded-full object-cover md:mx-0" />
              ) : (
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-200 text-xs text-neutral-500 md:mx-0">
                  You
                </div>
              )}
              <nav className="mt-8 hidden flex-col gap-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 md:flex">
                <button type="button" onClick={() => scrollTo("about")} className="text-left text-black">
                  About
                </button>
                <button type="button" onClick={() => scrollTo("work")} className="text-left hover:text-black">
                  Work
                </button>
                <button type="button" onClick={() => scrollTo("contact")} className="text-left hover:text-black">
                  Contact
                </button>
              </nav>
            </div>
            <div className="min-w-0 flex-1 md:pl-12">
              <h2 className="text-3xl font-bold uppercase tracking-wide md:text-4xl">About me</h2>
              <div className="mt-10 grid gap-10 lg:grid-cols-2">
                <div>
                  {bioTrim && !bioSameAsAbout ? (
                    <p className="whitespace-pre-wrap text-neutral-700 leading-relaxed">{data.bio}</p>
                  ) : null}
                  <div className={bioTrim && !bioSameAsAbout ? "mt-10 border-l-4 pl-6" : "border-l-4 pl-6"} style={{ borderColor: M.mustard }}>
                    <h3 className="text-lg font-bold">{aboutTitle}</h3>
                    <p className="mt-4 whitespace-pre-wrap text-neutral-700 leading-relaxed">{aboutText}</p>
                  </div>
                </div>
                <div className="rounded-xl bg-[#111] p-8 text-white">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-3xl font-bold" style={{ color: M.mustard }}>
                        {data.projects.length}+
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">Projects</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold" style={{ color: M.mustard }}>
                        {cleanTags(data.projects[0]?.tags).length || "—"}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">Focus areas</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold" style={{ color: M.mustard }}>
                        {data.location ? "✓" : "—"}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">Location</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold" style={{ color: M.mustard }}>
                        {data.email ? "✓" : "—"}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">Available</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="work" className="scroll-mt-20 bg-white">
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
            <h2 className="text-3xl font-bold uppercase tracking-wide md:text-4xl">Portfolio</h2>
            <p className="mt-3 max-w-2xl text-neutral-600">Selected case studies from your dashboard.</p>
            {data.projects.length === 0 ? (
              <p className="mt-12 text-sm text-neutral-500">{isOwner ? "Add projects in the editor." : "Nothing here yet."}</p>
            ) : (
              <div className="mt-12 grid gap-10 md:grid-cols-2">
                {data.projects.map((project) => {
                  const urls = projectImageUrls(project);
                  const tagList = cleanTags(project.tags);
                  return (
                    <article key={project.id} className="border border-neutral-200 bg-[#fafafa] p-6 md:p-8">
                      {urls[0] ? (
                        <button
                          type="button"
                          onClick={() => setLightbox({ urls, index: 0 })}
                          className="mb-6 block w-full overflow-hidden rounded-lg"
                        >
                          <img src={urls[0]} alt="" className="aspect-[16/10] w-full object-cover" />
                        </button>
                      ) : null}
                      <h3 className="text-xl font-bold">{project.title}</h3>
                      {project.role ? <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">{project.role}</p> : null}
                      <p className="mt-4 text-sm leading-relaxed text-neutral-700">{project.summary}</p>
                      {tagList.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {tagList.map((t) => (
                            <span key={t} className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-xs text-neutral-600">
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
                          className="mt-6 inline-flex items-center gap-1 text-sm font-bold hover:underline"
                          style={{ color: M.mustardDark }}
                          onClick={() => trackProjectClick(data.slug)}
                        >
                          View project <ArrowUpRight className="h-4 w-4" />
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
          <section id="contact" className="scroll-mt-20 border-t border-black/5 bg-[#f0ede6]">
            <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
              <h2 className="text-3xl font-bold uppercase tracking-wide md:text-4xl">Contact</h2>
              <p className="mt-3 text-neutral-600">Reach out directly.</p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {data.email ? (
                  <a href={`mailto:${data.email}`} className="flex items-start gap-3 rounded-xl border border-black/10 bg-white p-5 transition hover:border-black/20">
                    <Mail className="h-5 w-5 shrink-0" style={{ color: M.mustardDark }} />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Email</p>
                      <p className="mt-1 break-all text-sm font-medium">{data.email}</p>
                    </div>
                  </a>
                ) : null}
                {data.location ? (
                  <div className="flex items-start gap-3 rounded-xl border border-black/10 bg-white p-5">
                    <MapPin className="h-5 w-5 shrink-0 text-neutral-600" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Location</p>
                      <p className="mt-1 text-sm font-medium">{data.location}</p>
                    </div>
                  </div>
                ) : null}
                {data.cvUrl ? (
                  <a
                    href={data.cvUrl}
                    download={data.cvFileName || `${data.fullName}-CV`}
                    className="flex items-start gap-3 rounded-xl border border-black/10 bg-white p-5 transition hover:border-black/20"
                  >
                    <FileDown className="h-5 w-5 shrink-0" style={{ color: M.mustardDark }} />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Résumé</p>
                      <p className="mt-1 text-sm font-medium">Download CV</p>
                    </div>
                  </a>
                ) : null}
                {social?.website ? (
                  <a
                    href={social.website.startsWith("http") ? social.website : `https://${social.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 rounded-xl border border-black/10 bg-white p-5 transition hover:border-black/20"
                  >
                    <Globe className="h-5 w-5 shrink-0 text-neutral-600" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Website</p>
                      <p className="mt-1 break-all text-sm font-medium">{social.website}</p>
                    </div>
                  </a>
                ) : null}
                {social?.linkedin ? (
                  <a
                    href={social.linkedin.startsWith("http") ? social.linkedin : `https://${social.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 rounded-xl border border-black/10 bg-white p-5 transition hover:border-black/20"
                  >
                    <Linkedin className="h-5 w-5 shrink-0 text-neutral-600" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">LinkedIn</p>
                      <p className="mt-1 break-all text-sm font-medium">{social.linkedin}</p>
                    </div>
                  </a>
                ) : null}
                {social?.github ? (
                  <a
                    href={social.github.startsWith("http") ? social.github : `https://${social.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 rounded-xl border border-black/10 bg-white p-5 transition hover:border-black/20"
                  >
                    <Github className="h-5 w-5 shrink-0 text-neutral-600" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">GitHub</p>
                      <p className="mt-1 break-all text-sm font-medium">{social.github}</p>
                    </div>
                  </a>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {hasSeoMeta ? (
          <section className="border-t border-black/5 bg-white px-5 py-12 md:px-8">
            <div className="mx-auto max-w-3xl">
              <details className="rounded-xl border border-neutral-200 bg-[#fafafa] p-5">
                <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-neutral-500">SEO &amp; link preview</summary>
                <div className="mt-4 space-y-3 text-sm text-neutral-600">
                  {social?.seoTitle ? <p><span className="text-neutral-400">Title · </span>{social.seoTitle}</p> : null}
                  {social?.seoDescription ? <p className="whitespace-pre-wrap"><span className="text-neutral-400">Description · </span>{social.seoDescription}</p> : null}
                  {social?.seoOgImageUrl ? <p className="break-all"><span className="text-neutral-400">Image · </span>{social.seoOgImageUrl}</p> : null}
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
          buttonPrimaryClass="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-50"
          buttonMutedClass="rounded-full border border-neutral-200 px-5 py-2.5 text-sm text-neutral-600 transition hover:bg-neutral-50"
        />
      </main>

      <SiteFooter />
      <PortfolioThemeLightbox lightbox={lightbox} setLightbox={setLightbox} />
    </div>
  );
}
