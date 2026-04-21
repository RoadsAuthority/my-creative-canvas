import { motion } from "framer-motion";
import { ArrowUpRight, Github, Globe, Linkedin, Mail, MapPin } from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { PortfolioThemeLightbox, PortfolioThemePrintBar } from "@/components/portfolio/portfolio-theme-shared";
import { trackProjectClick } from "@/lib/analytics-service";
import type { PortfolioRecord } from "@/lib/portfolio-service";
import type { PortfolioProject } from "@/types/portfolio";

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

export function PortfolioMinimalCleanTheme({
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
  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#171717]">
      <main className="px-5 pb-14 pt-8 md:px-10 md:pt-12">
        <div className="mx-auto max-w-6xl space-y-8 md:space-y-10">
          <motion.header
            className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-white shadow-[0_20px_70px_-45px_rgba(0,0,0,0.35)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid gap-8 p-7 md:grid-cols-[1.1fr_0.9fr] md:p-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">Portfolio</p>
                <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-6xl">{data.fullName}</h1>
                <p className="mt-3 max-w-2xl text-base text-black/65 md:text-xl">{data.headline}</p>
                {data.bio ? <p className="mt-5 max-w-2xl leading-relaxed text-black/65">{data.bio}</p> : null}
                <div className="mt-6 flex flex-wrap gap-2.5 text-sm">
                  {data.email ? (
                    <a
                      href={`mailto:${data.email}`}
                      className="inline-flex items-center gap-2 rounded-full border border-black/20 bg-black px-4 py-2 text-white transition hover:bg-black/85"
                    >
                      <Mail className="h-4 w-4" />
                      {data.email}
                    </a>
                  ) : null}
                  {data.location ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-black/[0.03] px-4 py-2 text-black/70">
                      <MapPin className="h-4 w-4" />
                      {data.location}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="md:justify-self-end">
                {heroImage ? (
                  <button
                    type="button"
                    onClick={() => setLightbox({ urls: [heroImage], index: 0 })}
                    className="group block w-full overflow-hidden rounded-3xl border border-black/10 md:max-w-sm"
                  >
                    <img
                      src={heroImage}
                      alt=""
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                  </button>
                ) : (
                  <div className="flex aspect-[4/5] w-full items-center justify-center rounded-3xl border border-dashed border-black/20 text-sm text-black/40 md:max-w-sm">
                    Add profile image
                  </div>
                )}
              </div>
            </div>
          </motion.header>

          <section className="grid gap-6 rounded-[1.5rem] border border-black/10 bg-white p-7 md:grid-cols-2 md:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">Who I am</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">{aboutTitle}</h2>
            </div>
            <p className="text-black/70 md:text-lg">{aboutText}</p>
          </section>

          {hasSocial ? (
            <section className="rounded-[1.25rem] border border-black/10 bg-white p-6">
              <div className="flex flex-wrap gap-2.5">
                {social?.website ? (
                  <a
                    href={social.website.startsWith("http") ? social.website : `https://${social.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm transition hover:bg-black hover:text-white"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                ) : null}
                {social?.linkedin ? (
                  <a
                    href={social.linkedin.startsWith("http") ? social.linkedin : `https://${social.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm transition hover:bg-black hover:text-white"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                ) : null}
                {social?.github ? (
                  <a
                    href={social.github.startsWith("http") ? social.github : `https://${social.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm transition hover:bg-black hover:text-white"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                ) : null}
              </div>
            </section>
          ) : null}

          <section className="space-y-5">
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Selected work</h2>
            <div className="space-y-5">
              {data.projects.map((project, idx) => {
                const images = projectImageUrls(project);
                const stack = cleanTags(project.stack);
                const tags = cleanTags(project.tags);
                return (
                  <motion.article
                    key={project.id}
                    className="overflow-hidden rounded-[1.25rem] border border-black/10 bg-white"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    {images.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:p-5">
                        {images.slice(0, 4).map((src, i) => (
                          <button
                            key={`${project.id}-img-${i}`}
                            type="button"
                            onClick={() => setLightbox({ urls: images, index: i })}
                            className="overflow-hidden rounded-lg border border-black/10"
                          >
                            <img
                              src={src}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="h-52 w-full object-cover md:h-64"
                            />
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <div className="p-6 md:p-7">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-semibold tracking-tight">{project.title}</h3>
                          {project.role ? (
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-black/45">{project.role}</p>
                          ) : null}
                        </div>
                        {project.link ? (
                          <a
                            href={project.link.startsWith("http") ? project.link : `https://${project.link}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/20 px-4 py-2 text-sm font-medium transition hover:bg-black hover:text-white"
                            onClick={() => trackProjectClick(data.slug)}
                          >
                            View work
                            <ArrowUpRight className="h-4 w-4" />
                          </a>
                        ) : null}
                      </div>
                      <p className="mt-4 leading-relaxed text-black/70">{project.summary}</p>
                      {project.problem?.trim() || project.outcome?.trim() ? (
                        <div className="mt-5 grid gap-3 md:grid-cols-2">
                          {project.problem?.trim() ? (
                            <div className="rounded-xl border border-black/10 bg-black/[0.02] p-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-black/45">Challenge</p>
                              <p className="mt-2 text-sm text-black/75">{project.problem.trim()}</p>
                            </div>
                          ) : null}
                          {project.outcome?.trim() ? (
                            <div className="rounded-xl border border-black/10 bg-black/[0.02] p-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-black/45">Outcome</p>
                              <p className="mt-2 text-sm text-black/75">{project.outcome.trim()}</p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      {stack.length > 0 ? (
                        <div className="mt-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-black/45">Tools</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {stack.map((item) => (
                              <span
                                key={`${project.id}-stack-${item}`}
                                className="rounded-full border border-black/15 px-3 py-1 text-xs text-black/70"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {tags.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <span
                              key={`${project.id}-tag-${tag}`}
                              className="rounded-full bg-black/[0.04] px-3 py-1 text-xs uppercase tracking-[0.06em] text-black/55"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <PortfolioThemePrintBar
        data={data}
        visitorChrome={visitorChrome}
        isOwner={isOwner}
        user={user}
        hasApi={hasApi}
        setVisitorPreview={setVisitorPreview}
        sectionClassName="border-black/10 bg-white"
        buttonPrimaryClass="inline-flex items-center rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black/85"
        buttonMutedClass="inline-flex items-center rounded-full border border-black/15 bg-transparent px-5 py-2.5 text-sm font-medium text-black/80 transition hover:bg-black hover:text-white"
        poweredByClass="text-xs text-black/50"
        homeLinkClass="mt-2 block text-sm text-black/55 transition hover:text-black"
      />

      <PortfolioThemeLightbox lightbox={lightbox} setLightbox={setLightbox} />
      <SiteFooter />
    </div>
  );
}
