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

export function PortfolioBoldContrastTheme({
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
    <div className="min-h-screen bg-[#081427] text-[#d6e4ff]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_75%_45%_at_75%_5%,rgba(66,154,255,0.22),transparent_55%),radial-gradient(ellipse_65%_40%_at_5%_95%,rgba(0,186,255,0.18),transparent_50%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(135deg,transparent_0%,transparent_36%,rgba(108,194,255,0.08)_37%,rgba(108,194,255,0.08)_42%,transparent_43%,transparent_100%)]" />

      <main className="px-5 pb-16 pt-9 md:px-10 md:pt-12">
        <div className="mx-auto max-w-6xl space-y-9">
          <motion.header
            className="relative overflow-hidden rounded-[2rem] border border-[#58a4ff]/30 bg-[#0b1f3a]/85 p-7 shadow-[0_32px_90px_-42px_rgba(0,16,42,0.95)] backdrop-blur-sm md:p-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full border border-[#4aa6ff]/25" />
            <div className="pointer-events-none absolute -right-20 -bottom-24 h-72 w-72 rounded-full border border-[#57c4ff]/20" />
            <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#79c9ff]">Bold contrast</p>
                <h1 className="mt-4 font-display text-4xl font-bold leading-[0.96] text-white md:text-6xl lg:text-7xl">
                  {data.fullName}
                </h1>
                <p className="mt-4 max-w-2xl text-base text-[#c5dcff] md:text-xl">{data.headline}</p>
                {data.bio ? <p className="mt-5 max-w-2xl leading-relaxed text-[#b8d3ff]/85">{data.bio}</p> : null}
                <div className="mt-6 flex flex-wrap gap-2.5 text-sm">
                  {data.email ? (
                    <a
                      href={`mailto:${data.email}`}
                      className="inline-flex items-center gap-2 rounded-full border border-[#7dd7ff]/40 bg-[#44b8ff] px-4 py-2 font-medium text-[#042743] transition hover:bg-[#66c6ff]"
                    >
                      <Mail className="h-4 w-4" />
                      {data.email}
                    </a>
                  ) : null}
                  {data.location ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#62b7ff]/35 bg-[#0d2a50]/80 px-4 py-2 text-[#bbdbff]">
                      <MapPin className="h-4 w-4" />
                      {data.location}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="relative z-10 flex justify-center">
                {heroImage ? (
                  <button
                    type="button"
                    onClick={() => setLightbox({ urls: [heroImage], index: 0 })}
                    className="group relative block w-full max-w-sm rounded-full p-3"
                  >
                    <span className="absolute inset-0 rounded-full border border-[#73c3ff]/40" />
                    <span className="absolute inset-2 rounded-full border border-[#4fa6ff]/35" />
                    <img
                      src={heroImage}
                      alt=""
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      className="relative aspect-square w-full rounded-full object-cover shadow-[0_25px_70px_-35px_rgba(63,171,255,0.9)] transition duration-500 group-hover:scale-[1.02]"
                    />
                  </button>
                ) : (
                  <div className="flex aspect-square w-full max-w-sm items-center justify-center rounded-full border border-dashed border-[#62b7ff]/35 text-sm text-[#8ab9e9]">
                    Add profile image
                  </div>
                )}
              </div>
            </div>
          </motion.header>

          <section className="rounded-[1.5rem] border border-[#5daeff]/30 bg-[#0a1a33]/88 p-7 md:p-10">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7ccaff]">Story</p>
                <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-white md:text-4xl">{aboutTitle}</h2>
              </div>
              <p className="text-[#bcd8ff] md:text-lg">{aboutText}</p>
            </div>
          </section>

          {hasSocial ? (
            <section className="rounded-[1.25rem] border border-[#5daeff]/25 bg-[#0a1a33]/85 p-6">
              <div className="flex flex-wrap gap-2.5">
                {social?.website ? (
                  <a
                    href={social.website.startsWith("http") ? social.website : `https://${social.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#6dc1ff]/35 px-4 py-2 text-sm text-[#d2e8ff] transition hover:bg-[#51b8ff] hover:text-[#042743]"
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
                    className="inline-flex items-center gap-2 rounded-full border border-[#6dc1ff]/35 px-4 py-2 text-sm text-[#d2e8ff] transition hover:bg-[#51b8ff] hover:text-[#042743]"
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
                    className="inline-flex items-center gap-2 rounded-full border border-[#6dc1ff]/35 px-4 py-2 text-sm text-[#d2e8ff] transition hover:bg-[#51b8ff] hover:text-[#042743]"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                ) : null}
              </div>
            </section>
          ) : null}

          <section className="space-y-5">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">Projects</h2>
            <div className="space-y-5">
              {data.projects.map((project, idx) => {
                const images = projectImageUrls(project);
                const stack = cleanTags(project.stack);
                const tags = cleanTags(project.tags);
                return (
                  <motion.article
                    key={project.id}
                    className="overflow-hidden rounded-[1.25rem] border border-[#5daeff]/25 bg-[#0a1a33]/88"
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
                            className="overflow-hidden rounded-lg border border-[#5daeff]/25"
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
                          <h3 className="text-2xl font-semibold tracking-tight text-white">{project.title}</h3>
                          {project.role ? (
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#89ccff]">{project.role}</p>
                          ) : null}
                        </div>
                        {project.link ? (
                          <a
                            href={project.link.startsWith("http") ? project.link : `https://${project.link}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#6cc0ff]/40 bg-[#133761] px-4 py-2 text-sm font-medium text-[#d6ebff] transition hover:bg-[#56beff] hover:text-[#062946]"
                            onClick={() => trackProjectClick(data.slug)}
                          >
                            View work
                            <ArrowUpRight className="h-4 w-4" />
                          </a>
                        ) : null}
                      </div>
                      <p className="mt-4 leading-relaxed text-[#c3dcff]/95">{project.summary}</p>
                      {project.problem?.trim() || project.outcome?.trim() ? (
                        <div className="mt-5 grid gap-3 md:grid-cols-2">
                          {project.problem?.trim() ? (
                            <div className="rounded-xl border border-[#4f9de0]/25 bg-[#0b2749]/70 p-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#87cfff]">Challenge</p>
                              <p className="mt-2 text-sm text-[#c5ddff]">{project.problem.trim()}</p>
                            </div>
                          ) : null}
                          {project.outcome?.trim() ? (
                            <div className="rounded-xl border border-[#4f9de0]/25 bg-[#0b2749]/70 p-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#87cfff]">Outcome</p>
                              <p className="mt-2 text-sm text-[#c5ddff]">{project.outcome.trim()}</p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      {stack.length > 0 ? (
                        <div className="mt-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#82c5fa]">Tools</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {stack.map((item) => (
                              <span
                                key={`${project.id}-stack-${item}`}
                                className="rounded-full border border-[#58abeb]/30 bg-[#0d2d55]/70 px-3 py-1 text-xs text-[#c7e1ff]"
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
                              className="rounded-full bg-[#092241] px-3 py-1 text-xs uppercase tracking-[0.06em] text-[#82c7ff]"
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
        sectionClassName="border-[#4b9fe2]/30 bg-[#081a33]"
        buttonPrimaryClass="inline-flex items-center rounded-full bg-[#52beff] px-5 py-2.5 text-sm font-semibold text-[#042743] transition hover:bg-[#75cbff]"
        buttonMutedClass="inline-flex items-center rounded-full border border-[#67bbfb]/35 bg-[#0d2d55]/65 px-5 py-2.5 text-sm font-medium text-[#d0e7ff] transition hover:bg-[#51b9ff] hover:text-[#042743]"
        poweredByClass="text-xs text-[#90c8f9]"
        homeLinkClass="mt-2 block text-sm text-[#9bcdf7] transition hover:text-white"
      />

      <PortfolioThemeLightbox lightbox={lightbox} setLightbox={setLightbox} />
      <SiteFooter />
    </div>
  );
}
