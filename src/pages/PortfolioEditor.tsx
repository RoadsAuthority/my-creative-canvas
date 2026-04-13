import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Plus, Sparkles, X } from "lucide-react";
import { Link, useMatch, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { randomId } from "@/lib/id";
import { signOut } from "@/lib/auth-service";
import { fetchBillingStatus, type BillingStatus } from "@/lib/billing-service";
import { listPortfoliosByUser, upsertPortfolio, verifyCustomDomain } from "@/lib/portfolio-service";
import type { PortfolioRecord } from "@/lib/portfolio-service";
import { useAuth } from "@/contexts/AuthContext";
import type { PortfolioData, PortfolioProject, PortfolioTheme, SocialLinks } from "@/types/portfolio";

const createProject = (): PortfolioProject => ({
  id: randomId(),
  title: "",
  role: "",
  summary: "",
  problem: "",
  outcome: "",
  stack: "",
  link: "",
  tags: "",
  imageUrls: [],
  videoUrls: [],
  imageUrl: "",
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "portfolio";

interface PortfolioEditorProps {
  userId: string;
}

const emptySocial = (): SocialLinks => ({
  website: "",
  linkedin: "",
  github: "",
  aboutTitle: "",
  aboutText: "",
  seoTitle: "",
  seoDescription: "",
  seoOgImageUrl: "",
});

const hasApi = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());
const MAX_CV_SIZE_MB = 2;
const MAX_CV_SIZE_BYTES = MAX_CV_SIZE_MB * 1024 * 1024;
const ALLOWED_CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_VIDEO_SIZE_MB = 25;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

const THEME_OPTIONS: { value: PortfolioTheme; label: string }[] = [
  { value: "glass", label: "Glass Pro" },
  { value: "minimal", label: "Minimal Clean" },
  { value: "bold", label: "Bold Contrast" },
  { value: "vintage", label: "Vintage — warm sepia" },
  { value: "vintageRefined", label: "Vintage — refined olive & gold" },
  { value: "vintageEditorial", label: "Vintage — editorial dark & serif" },
  { value: "devMode", label: "Dark / Dev Mode — playful motion" },
  { value: "scrollStory", label: "Scroll story — layers & reveals" },
  { value: "atrium", label: "Atrium — night garden & aurora glass" },
];

const PortfolioEditor = ({ userId }: PortfolioEditorProps) => {
  const navigate = useNavigate();
  const isCreate = Boolean(useMatch("/app/new"));
  const { slug: slugParam } = useParams<{ slug: string }>();
  const lastLoadedSlugRef = useRef<string | null>(null);
  const { refresh } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const slugDirtyRef = useRef(false);

  const [fullName, setFullName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [cvFileName, setCvFileName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [theme, setTheme] = useState<PortfolioTheme>("glass");
  const [customDomain, setCustomDomain] = useState("");
  const [customDomainVerified, setCustomDomainVerified] = useState(false);
  const [customDomainVerifyToken, setCustomDomainVerifyToken] = useState("");
  const [social, setSocial] = useState<SocialLinks>(emptySocial);
  const [slug, setSlug] = useState("");
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [recent, setRecent] = useState<PortfolioRecord[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [billing, setBilling] = useState<BillingStatus | null>(null);

  useEffect(() => {
    setListLoading(true);
    listPortfoliosByUser(userId)
      .then(setRecent)
      .catch(() => setRecent([]))
      .finally(() => setListLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!hasApi) return;
    fetchBillingStatus().then(setBilling);
  }, [userId]);

  useEffect(() => {
    const allowed = billing?.limits?.themes;
    if (!allowed?.length) return;
    if (!allowed.includes(theme)) {
      setTheme("glass");
    }
  }, [billing, theme]);

  const suggestedSlug = useMemo(() => {
    const base = slugify(fullName || "my-portfolio");
    const taken = new Set(recent.map((p) => p.slug));
    if (!taken.has(base)) return base;
    let i = 2;
    while (taken.has(`${base}-${i}`)) i += 1;
    return `${base}-${i}`;
  }, [fullName, recent]);

  useEffect(() => {
    if (!editingId && !slugDirtyRef.current) {
      setSlug(suggestedSlug);
    }
  }, [suggestedSlug, editingId]);

  const resetForm = () => {
    setEditingId(null);
    slugDirtyRef.current = false;
    setFullName("");
    setProfileImageUrl("");
    setCvUrl("");
    setCvFileName("");
    setHeadline("");
    setBio("");
    setEmail("");
    setLocation("");
    setTheme("glass");
    setCustomDomain("");
    setCustomDomainVerified(false);
    setCustomDomainVerifyToken("");
    setSocial(emptySocial());
    setProjects([]);
  };

  const loadPortfolio = (p: PortfolioRecord, opts?: { silent?: boolean }) => {
    setEditingId(p.id);
    slugDirtyRef.current = true;
    setFullName(p.fullName);
    setProfileImageUrl(p.profileImageUrl ?? "");
    setCvUrl(p.cvUrl ?? "");
    setCvFileName(p.cvFileName ?? "");
    setHeadline(p.headline);
    setBio(p.bio);
    setEmail(p.email);
    setLocation(p.location);
    setTheme(p.theme);
    setCustomDomain(p.customDomain);
    setCustomDomainVerified(Boolean(p.customDomainVerified));
    setCustomDomainVerifyToken(p.customDomainVerifyToken ?? "");
    setSocial({
      website: p.socialLinks?.website ?? "",
      linkedin: p.socialLinks?.linkedin ?? "",
      github: p.socialLinks?.github ?? "",
      aboutTitle: p.socialLinks?.aboutTitle ?? "",
      aboutText: p.socialLinks?.aboutText ?? "",
      seoTitle: p.socialLinks?.seoTitle ?? "",
      seoDescription: p.socialLinks?.seoDescription ?? "",
      seoOgImageUrl: p.socialLinks?.seoOgImageUrl ?? "",
    });
    setSlug(p.slug);
    setProjects(p.projects.length ? p.projects : []);
    if (!opts?.silent) {
      toast.info("Loaded for editing", { description: `You are editing “${p.slug}”.` });
    }
  };

  useEffect(() => {
    if (isCreate) {
      lastLoadedSlugRef.current = null;
      resetForm();
    }
  }, [isCreate]);

  useEffect(() => {
    if (isCreate || !slugParam || listLoading) return;
    const p = recent.find((x) => x.slug === slugParam);
    if (!p) {
      toast.error("Portfolio not found.");
      navigate("/app", { replace: true });
      return;
    }
    if (lastLoadedSlugRef.current === slugParam) return;
    lastLoadedSlugRef.current = slugParam;
    loadPortfolio(p, { silent: true });
  }, [isCreate, slugParam, listLoading, recent, navigate]);

  const updateProject = (id: string, key: keyof PortfolioProject, value: string) => {
    setProjects((prev) => prev.map((project) => (project.id === id ? { ...project, [key]: value } : project)));
  };

  const addProject = () => setProjects((prev) => [...prev, createProject()]);
  const removeProject = (id: string) =>
    setProjects((prev) => prev.filter((project) => project.id !== id));

  const uploadProfileImage = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setProfileImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const uploadCv = (file?: File) => {
    if (!file) return;
    const ext = file.name.toLowerCase();
    const looksValidExt = ext.endsWith(".pdf") || ext.endsWith(".doc") || ext.endsWith(".docx");
    const looksValidType = !file.type || ALLOWED_CV_TYPES.includes(file.type);
    if (!looksValidExt && !looksValidType) {
      toast.error("Only PDF, DOC, and DOCX files are allowed.");
      return;
    }
    if (file.size > MAX_CV_SIZE_BYTES) {
      toast.error(`CV is too large. Max size is ${MAX_CV_SIZE_MB}MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setCvUrl(result);
      setCvFileName(file.name || "cv");
    };
    reader.readAsDataURL(file);
  };

  const uploadProjectImages = (projectId: string, files?: FileList | null) => {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        setProjects((prev) =>
          prev.map((project) => {
            if (project.id !== projectId) return project;
            const nextImages = [...(project.imageUrls ?? []), result];
            return { ...project, imageUrls: nextImages, imageUrl: nextImages[0] ?? "" };
          }),
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProjectVideos = (projectId: string, files?: FileList | null) => {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("video/")) {
        toast.error("Only video files are allowed.");
        continue;
      }
      if (file.size > MAX_VIDEO_SIZE_BYTES) {
        toast.error(`Video "${file.name}" is too large. Max size is ${MAX_VIDEO_SIZE_MB}MB.`);
        continue;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        setProjects((prev) =>
          prev.map((project) =>
            project.id === projectId
              ? { ...project, videoUrls: [...(project.videoUrls ?? []), result] }
              : project,
          ),
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/portfolio/${slug}`;

  const copyPublicLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Public link copied");
    } catch {
      toast.error("Could not copy — copy the URL manually.");
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    /** Title + summary are enough to publish; role/link/tags/image are optional on the public page. */
    const cleanProjects = projects.filter((p) => {
      const title = (p.title ?? "").trim();
      const summary = (p.summary ?? "").trim();
      return Boolean(title && summary);
    });
    if (!fullName.trim() || !headline.trim()) {
      toast.error("Add your full name and professional headline under Profile.");
      return;
    }
    if (cleanProjects.length === 0) {
      toast.error("Add at least one project with a title and a short summary (outcome-focused paragraph).");
      return;
    }

    const cleanSlug = slugify(slug || suggestedSlug);
    if (!cleanSlug) {
      toast.error("Choose a valid URL slug (letters, numbers, hyphens).");
      return;
    }

    const socialClean: SocialLinks = {};
    if (social.website?.trim()) socialClean.website = social.website.trim();
    if (social.linkedin?.trim()) socialClean.linkedin = social.linkedin.trim();
    if (social.github?.trim()) socialClean.github = social.github.trim();
    if (social.aboutTitle?.trim()) socialClean.aboutTitle = social.aboutTitle.trim();
    if (social.aboutText?.trim()) socialClean.aboutText = social.aboutText.trim();
    if (social.seoTitle?.trim()) socialClean.seoTitle = social.seoTitle.trim();
    if (social.seoDescription?.trim()) socialClean.seoDescription = social.seoDescription.trim();
    if (social.seoOgImageUrl?.trim()) socialClean.seoOgImageUrl = social.seoOgImageUrl.trim();

    const item: PortfolioData = {
      id: editingId ?? randomId(),
      slug: cleanSlug,
      fullName: fullName.trim(),
      profileImageUrl: profileImageUrl.trim(),
      cvUrl: cvUrl.trim(),
      cvFileName: cvFileName.trim(),
      headline: headline.trim(),
      bio: bio.trim(),
      email: email.trim(),
      location: location.trim(),
      theme,
      customDomain: customDomain.trim(),
      customDomainVerified,
      customDomainVerifyToken,
      socialLinks: Object.keys(socialClean).length ? socialClean : undefined,
      projects: cleanProjects,
      createdAt: new Date().toISOString(),
    };

    setSaving(true);
    try {
      await upsertPortfolio({ ...item, user_id: userId });
      toast.success(editingId ? "Portfolio updated" : "Portfolio published");
      navigate(`/portfolio/${item.slug}`);
    } catch (e: unknown) {
      const err = e as Error & { code?: string; status?: number };
      if (err.status === 402 || err.code === "PAYMENT_REQUIRED" || err.code === "PORTFOLIO_LIMIT") {
        toast.error(err.message || "Plan limit", {
          description: "Open Plans to purchase or upgrade.",
          action: { label: "Plans", onClick: () => navigate("/billing") },
        });
        return;
      }
      toast.error("Could not save. Is the API running, or is this slug already taken?");
    } finally {
      setSaving(false);
    }
  };

  const showEditLoader = !isCreate && Boolean(slugParam) && listLoading;

  if (showEditLoader) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
          <div className="h-10 w-10 animate-pulse rounded-full border-2 border-primary/30 border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading portfolio…</p>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className="relative flex-1 overflow-x-hidden px-5 pb-20 pt-8 md:px-10">
        <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(ellipse_70%_40%_at_20%_0%,hsl(var(--primary)/0.12),transparent_65%),radial-gradient(ellipse_50%_30%_at_90%_20%,hsl(var(--accent)/0.1),transparent_60%)]" />

        <div className="mx-auto mb-8 max-w-5xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            {isCreate ? "Create portfolio" : "Edit portfolio"}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            {isCreate ? (
              <>
                Start a <span className="text-gradient">new portfolio</span>
              </>
            ) : (
              <>
                Update your <span className="text-gradient">public page</span>
              </>
            )}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {isCreate
              ? "Add your profile, projects, and URL — then publish when you are ready."
              : "Changes apply to your live page after you save."}
          </p>
          {hasApi && billing ? (
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
              {billing.billingMode === "strict" && billing.billingTier === "free" ? (
                <p>
                  <span className="font-medium text-foreground">Pay-to-publish:</span> purchase Basic or Premium to
                  publish.{" "}
                  <Link to="/billing" className="text-primary underline underline-offset-2">
                    View plans
                  </Link>
                </p>
              ) : billing.billingTier === "free" ? (
                <p>
                  <span className="font-medium text-foreground">Free plan:</span> one portfolio and the Glass template
                  only. Basic and Premium include every theme. Need more?{" "}
                  <Link to="/billing" className="text-primary underline underline-offset-2">
                    Upgrade
                  </Link>
                </p>
              ) : billing.billingTier === "basic" ? (
                <p>
                  <span className="font-medium text-foreground">Basic:</span> up to {billing.limits.maxPortfolios}{" "}
                  portfolios and all visual themes. Premium unlocks custom domain & removes branding.{" "}
                  <Link to="/billing" className="text-primary underline underline-offset-2">
                    Plans
                  </Link>
                </p>
              ) : (
                <p className="text-foreground/90">
                  <span className="font-medium">Premium:</span> all themes, custom domain, no “Made with” badge, full
                  analytics.
                </p>
              )}
            </div>
          ) : null}
        </div>

        <div className="mx-auto w-full max-w-5xl">
          <motion.form
            onSubmit={handleSubmit}
            className="glass-frosted rounded-[1.75rem] p-6 md:p-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold">Editor</h2>
                  <p className="text-xs text-muted-foreground">
                    {editingId ? "Updating an existing portfolio" : "Creating a new portfolio"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/app"
                  className="glass-subtle inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    await refresh();
                    navigate("/auth");
                  }}
                  className="glass-subtle rounded-full px-4 py-2 text-sm"
                >
                  Sign out
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-8 xl:grid-cols-2 xl:items-start">
              <div className="flex min-w-0 flex-col gap-6">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-5 md:p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Profile</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Name, photo, and story visitors see first.</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Full name</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jordan Lee"
                    className="glass-subtle w-full rounded-xl border border-white/10 bg-transparent p-3 outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Professional headline</label>
                  <input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Product Designer · Frontend Developer"
                    className="glass-subtle w-full rounded-xl border border-white/10 bg-transparent p-3 outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Contact email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="glass-subtle w-full rounded-xl border border-white/10 bg-transparent p-3 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Location</label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Berlin · Remote"
                    className="glass-subtle w-full rounded-xl border border-white/10 bg-transparent p-3 outline-none focus:border-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs text-muted-foreground">Profile picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => uploadProfileImage(e.target.files?.[0])}
                    className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary/20 file:px-3 file:py-1.5 file:text-xs file:text-foreground hover:file:bg-primary/30"
                  />
                  {profileImageUrl ? (
                    <div className="mt-3 flex items-center gap-3">
                      <img src={profileImageUrl} alt="Profile preview" className="h-14 w-14 rounded-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setProfileImageUrl("")}
                        className="glass-subtle inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs"
                      >
                        <X className="h-3.5 w-3.5" />
                        Remove photo
                      </button>
                    </div>
                  ) : null}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs text-muted-foreground">CV upload (optional)</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => uploadCv(e.target.files?.[0])}
                    className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary/20 file:px-3 file:py-1.5 file:text-xs file:text-foreground hover:file:bg-primary/30"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Accepted: PDF, DOC, DOCX (max {MAX_CV_SIZE_MB}MB).</p>
                  {cvUrl ? (
                    <div className="mt-3 flex items-center gap-3">
                      <a
                        href={cvUrl}
                        download={cvFileName || "cv"}
                        className="text-xs text-primary underline"
                      >
                        {cvFileName || "Download CV"}
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setCvUrl("");
                          setCvFileName("");
                        }}
                        className="glass-subtle inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs"
                      >
                        <X className="h-3.5 w-3.5" />
                        Remove CV
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-1.5 block text-xs text-muted-foreground">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Short story: who you help, what you ship, and what you care about."
                  className="glass-subtle min-h-28 w-full rounded-xl border border-white/10 bg-transparent p-3 outline-none focus:border-primary"
                />
              </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-5 md:p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Who I am (public)</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Copy for the block under your hero on the live page.</p>
                  <div className="mt-4 grid gap-4">
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Section title</label>
                  <input
                    value={social.aboutTitle ?? ""}
                    onChange={(e) => setSocial((s) => ({ ...s, aboutTitle: e.target.value }))}
                    placeholder="Design with purpose and personality"
                    className="glass-subtle w-full rounded-xl border border-white/10 bg-transparent p-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Section text</label>
                  <textarea
                    value={social.aboutText ?? ""}
                    onChange={(e) => setSocial((s) => ({ ...s, aboutText: e.target.value }))}
                    placeholder="Write a short intro about your style, strengths, and who you help."
                    className="glass-subtle min-h-24 w-full rounded-xl border border-white/10 bg-transparent p-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                  </div>
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-6">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-5 md:p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Page address &amp; look</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Your public URL and visual theme.</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Public URL slug</label>
                  <input
                    value={slug}
                    onChange={(e) => {
                      slugDirtyRef.current = true;
                      setSlug(e.target.value);
                    }}
                    placeholder="jordan-lee"
                    className="glass-subtle w-full rounded-xl border border-white/10 bg-transparent p-3 font-mono text-sm outline-none focus:border-primary"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Suggested: <button type="button" className="text-primary hover:underline" onClick={() => { slugDirtyRef.current = false; setSlug(suggestedSlug); }}>{suggestedSlug}</button>
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Visual theme</label>
                  <Select
                    value={theme}
                    onValueChange={(v) => setTheme(v as PortfolioTheme)}
                  >
                    <SelectTrigger className="glass-subtle h-auto min-h-[2.875rem] w-full rounded-xl border border-white/10 bg-transparent py-3 pl-3 pr-3 text-left text-sm text-foreground shadow-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/25 [&>svg]:text-muted-foreground">
                      <SelectValue placeholder="Choose a theme" />
                    </SelectTrigger>
                    <SelectContent className="z-[200] border border-white/15 bg-zinc-950 text-zinc-100 shadow-xl">
                      {THEME_OPTIONS.map(({ value: themeValue, label }) => (
                        <SelectItem
                          key={themeValue}
                          value={themeValue}
                          disabled={billing ? !billing.limits.themes.includes(themeValue) : false}
                          className="cursor-pointer text-zinc-100 focus:bg-white/10 focus:text-zinc-50 data-[disabled]:opacity-40"
                        >
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {!billing ? (
                      <>Theme options match your plan once billing details load.</>
                    ) : billing.billingTier === "free" ? (
                      <>
                        Free includes the Glass Pro template only. Basic and Premium include every theme below as part of
                        your plan.{" "}
                        <Link to="/#templates" className="font-medium text-primary underline-offset-4 hover:underline">
                          Overview of looks
                        </Link>
                      </>
                    ) : (
                      <>
                        Every theme below is included with your subscription (Basic and Premium).{" "}
                        <Link to="/#templates" className="font-medium text-primary underline-offset-4 hover:underline">
                          Overview of looks
                        </Link>
                      </>
                    )}
                  </p>
                </div>
                  </div>
                </div>

                <Accordion type="multiple" className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-2">
                  <AccordionItem value="domain" className="border-white/10 px-2">
                    <AccordionTrigger className="py-3 text-sm hover:no-underline">Custom domain (Premium)</AccordionTrigger>
                    <AccordionContent>
                      <label className="mb-1.5 block text-xs text-muted-foreground">Your domain</label>
                      <input
                        value={customDomain}
                        onChange={(e) => {
                          setCustomDomain(e.target.value);
                          setCustomDomainVerified(false);
                        }}
                        placeholder="portfolio.yourdomain.com"
                        disabled={Boolean(billing && !billing.limits.customDomain)}
                        className="glass-subtle w-full rounded-xl border border-white/10 bg-transparent p-3 outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {billing && !billing.limits.customDomain
                          ? "Custom domain is a Premium feature — upgrade on the Plans page."
                          : "Save once, then add DNS records and verify."}
                      </p>
                      {billing?.limits.customDomain && customDomain ? (
                        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-muted-foreground">
                          <p>
                            Status:{" "}
                            <span className={customDomainVerified ? "text-emerald-400" : "text-amber-400"}>
                              {customDomainVerified ? "Verified" : "Not verified"}
                            </span>
                          </p>
                          {customDomainVerifyToken ? (
                            <>
                              <p className="mt-2">Step 1: Point your domain to PortfolioForge</p>
                              <div className="mt-1 rounded-lg border border-white/10 p-2">
                                <p>CNAME (or ALIAS) target:</p>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-foreground">cname.vercel-dns.com</span>
                                  <button
                                    type="button"
                                    className="text-primary underline"
                                    onClick={() => {
                                      void navigator.clipboard.writeText("cname.vercel-dns.com");
                                      toast.success("CNAME target copied");
                                    }}
                                  >
                                    Copy
                                  </button>
                                </div>
                              </div>

                              <p className="mt-3">Step 2: Add TXT verification record</p>
                              <div className="mt-1 rounded-lg border border-white/10 p-2">
                                <p>Host</p>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-foreground">_pf-verify.{customDomain}</span>
                                  <button
                                    type="button"
                                    className="text-primary underline"
                                    onClick={() => {
                                      void navigator.clipboard.writeText(`_pf-verify.${customDomain}`);
                                      toast.success("TXT host copied");
                                    }}
                                  >
                                    Copy
                                  </button>
                                </div>
                                <p className="mt-2">Value</p>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-foreground">{customDomainVerifyToken}</span>
                                  <button
                                    type="button"
                                    className="text-primary underline"
                                    onClick={() => {
                                      void navigator.clipboard.writeText(customDomainVerifyToken);
                                      toast.success("TXT value copied");
                                    }}
                                  >
                                    Copy
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <p className="mt-2">Save this portfolio first to generate your DNS verification token.</p>
                          )}
                          <button
                            type="button"
                            disabled={!customDomainVerifyToken || !editingId}
                            onClick={async () => {
                              const result = await verifyCustomDomain(slug);
                              if (result.verified) {
                                setCustomDomainVerified(true);
                                toast.success(result.message);
                              } else {
                                toast.error(result.message);
                              }
                            }}
                            className="glass-subtle mt-3 rounded-full px-3 py-1.5 text-xs disabled:opacity-50"
                          >
                            Verify domain
                          </button>
                        </div>
                      ) : null}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="previews" className="border-0 px-2">
                    <AccordionTrigger className="py-3 text-sm hover:no-underline">Link previews (Google &amp; social)</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-xs text-muted-foreground">
                        When someone pastes your portfolio link in Slack, LinkedIn, iMessage, etc., these fields control the title, short description, and preview image. Leave blank to use your profile defaults. For the image, paste a public{" "}
                        <span className="text-foreground/90">https://</span> URL (uploaded images in the editor are not used for previews).
                      </p>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs text-muted-foreground">Page title override</label>
                          <input
                            value={social.seoTitle ?? ""}
                            onChange={(e) => setSocial((s) => ({ ...s, seoTitle: e.target.value }))}
                            placeholder={`${fullName || "Name"} · ${headline || "Headline"}`}
                            className="glass-subtle w-full rounded-lg border border-white/10 bg-transparent p-2.5 text-sm outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-muted-foreground">Share image URL (https)</label>
                          <input
                            value={social.seoOgImageUrl ?? ""}
                            onChange={(e) => setSocial((s) => ({ ...s, seoOgImageUrl: e.target.value }))}
                            placeholder="https://…/og.jpg"
                            className="glass-subtle w-full rounded-lg border border-white/10 bg-transparent p-2.5 text-sm outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                      <label className="mt-3 block text-xs text-muted-foreground">Meta description</label>
                      <textarea
                        value={social.seoDescription ?? ""}
                        onChange={(e) => setSocial((s) => ({ ...s, seoDescription: e.target.value }))}
                        placeholder="One or two sentences. Defaults to your bio if empty."
                        className="glass-subtle mt-1 min-h-16 w-full rounded-lg border border-white/10 bg-transparent p-2.5 text-sm outline-none focus:border-primary"
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-5 md:p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Social links</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Shown as buttons on your public page.</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Website</label>
                  <input
                    value={social.website ?? ""}
                    onChange={(e) => setSocial((s) => ({ ...s, website: e.target.value }))}
                    placeholder="https://"
                    className="glass-subtle w-full rounded-xl border border-white/10 bg-transparent p-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">LinkedIn</label>
                  <input
                    value={social.linkedin ?? ""}
                    onChange={(e) => setSocial((s) => ({ ...s, linkedin: e.target.value }))}
                    placeholder="https://linkedin.com/in/…"
                    className="glass-subtle w-full rounded-xl border border-white/10 bg-transparent p-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">GitHub</label>
                  <input
                    value={social.github ?? ""}
                    onChange={(e) => setSocial((s) => ({ ...s, github: e.target.value }))}
                    placeholder="https://github.com/…"
                    className="glass-subtle w-full rounded-xl border border-white/10 bg-transparent p-3 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-2xl border border-white/10 bg-gradient-to-br from-primary/[0.07] via-transparent to-accent/[0.05] p-5 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Projects</h3>
                  <p className="mt-1 max-w-xl text-xs text-muted-foreground">
                    Case studies appear on your public page. Project blocks stay hidden until you add one — use{" "}
                    <span className="text-foreground/90">Add project</span>, and remove any block you do not need.
                  </p>
                </div>
                <button type="button" onClick={addProject} className="glass-pill inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm">
                  <Plus className="h-4 w-4" />
                  Add project
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Each project needs a <span className="text-foreground/90">title</span> and <span className="text-foreground/90">summary</span>. Everything else is optional.
              </p>
              {projects.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-black/15 py-14 text-center">
                  <p className="text-sm font-medium text-foreground/90">No project blocks yet</p>
                  <p className="mt-2 max-w-sm text-xs text-muted-foreground">
                    Click &quot;Add project&quot; to open a form. You can delete a project block anytime with the button on the card.
                  </p>
                  <button type="button" onClick={addProject} className="glass-pill mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium">
                    <Plus className="h-4 w-4" />
                    Add your first project
                  </button>
                </div>
              ) : (
              <div className="mt-6 space-y-4">
                {projects.map((project, idx) => (
                  <div key={project.id} className="glass-card rounded-2xl p-4 md:p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">Project {idx + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeProject(project.id)}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        value={project.title}
                        onChange={(e) => updateProject(project.id, "title", e.target.value)}
                        placeholder="Title"
                        className="glass-subtle rounded-lg border border-white/10 bg-transparent p-2.5 outline-none focus:border-primary"
                      />
                      <input
                        value={project.role}
                        onChange={(e) => updateProject(project.id, "role", e.target.value)}
                        placeholder="Your role"
                        className="glass-subtle rounded-lg border border-white/10 bg-transparent p-2.5 outline-none focus:border-primary"
                      />
                    </div>
                    <textarea
                      value={project.summary}
                      onChange={(e) => updateProject(project.id, "summary", e.target.value)}
                      placeholder="Overview: context, what you shipped, and the narrative arc."
                      className="glass-subtle mt-3 min-h-20 w-full rounded-lg border border-white/10 bg-transparent p-2.5 outline-none focus:border-primary"
                    />
                    <p className="mt-3 text-xs font-medium text-muted-foreground">Case study (optional)</p>
                    <div className="mt-2 grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Challenge</label>
                        <textarea
                          value={project.problem ?? ""}
                          onChange={(e) => updateProject(project.id, "problem", e.target.value)}
                          placeholder="Problem or constraint"
                          className="glass-subtle min-h-[4.5rem] w-full rounded-lg border border-white/10 bg-transparent p-2.5 text-sm outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Outcome</label>
                        <textarea
                          value={project.outcome ?? ""}
                          onChange={(e) => updateProject(project.id, "outcome", e.target.value)}
                          placeholder="Measurable result or impact"
                          className="glass-subtle min-h-[4.5rem] w-full rounded-lg border border-white/10 bg-transparent p-2.5 text-sm outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="mb-1 block text-xs text-muted-foreground">Tools &amp; stack</label>
                      <input
                        value={project.stack ?? ""}
                        onChange={(e) => updateProject(project.id, "stack", e.target.value)}
                        placeholder="Figma, React, Node — comma separated"
                        className="glass-subtle w-full rounded-lg border border-white/10 bg-transparent p-2.5 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <input
                        value={project.link}
                        onChange={(e) => updateProject(project.id, "link", e.target.value)}
                        placeholder="Case study or demo URL"
                        className="glass-subtle rounded-lg border border-white/10 bg-transparent p-2.5 outline-none focus:border-primary"
                      />
                      <input
                        value={project.tags}
                        onChange={(e) => updateProject(project.id, "tags", e.target.value)}
                        placeholder="Tags: React, UX, Figma"
                        className="glass-subtle rounded-lg border border-white/10 bg-transparent p-2.5 outline-none focus:border-primary"
                      />
                    </div>
                    <div className="mt-3 grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Images (multiple)</label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => uploadProjectImages(project.id, e.target.files)}
                          className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary/20 file:px-3 file:py-1.5 file:text-xs file:text-foreground hover:file:bg-primary/30"
                        />
                        {(project.imageUrls?.length || project.imageUrl) ? (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            {(project.imageUrls?.length ? project.imageUrls : project.imageUrl ? [project.imageUrl] : []).map((src, i) => (
                              <div key={`${project.id}-img-${i}`} className="relative">
                                <img src={src} alt="" className="h-24 w-full rounded-lg object-cover" />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setProjects((prev) =>
                                      prev.map((p) => {
                                        if (p.id !== project.id) return p;
                                        const arr = p.imageUrls?.length ? [...p.imageUrls] : p.imageUrl ? [p.imageUrl] : [];
                                        arr.splice(i, 1);
                                        return { ...p, imageUrls: arr, imageUrl: arr[0] ?? "" };
                                      }),
                                    )
                                  }
                                  className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white"
                                >
                                  X
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">
                          Videos (multiple, max {MAX_VIDEO_SIZE_MB}MB each)
                        </label>
                        <input
                          type="file"
                          accept="video/*"
                          multiple
                          onChange={(e) => uploadProjectVideos(project.id, e.target.files)}
                          className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary/20 file:px-3 file:py-1.5 file:text-xs file:text-foreground hover:file:bg-primary/30"
                        />
                        {project.videoUrls?.length ? (
                          <div className="mt-3 space-y-2">
                            {project.videoUrls.map((src, i) => (
                              <div key={`${project.id}-vid-${i}`} className="relative rounded-lg border border-white/10 p-1.5">
                                <video src={src} controls className="h-24 w-full rounded object-cover" />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setProjects((prev) =>
                                      prev.map((p) =>
                                        p.id === project.id
                                          ? { ...p, videoUrls: (p.videoUrls ?? []).filter((_, idx) => idx !== i) }
                                          : p,
                                      ),
                                    )
                                  }
                                  className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white"
                                >
                                  X
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button type="submit" disabled={saving} className="glass-pill rounded-full px-8 py-3 font-semibold">
                {saving ? "Saving…" : editingId ? "Save changes" : "Publish portfolio"}
              </button>
              <button type="button" onClick={copyPublicLink} className="glass-frosted inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium">
                <Copy className="h-4 w-4" />
                Copy public link
              </button>
            </div>
          </motion.form>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};

export default PortfolioEditor;
