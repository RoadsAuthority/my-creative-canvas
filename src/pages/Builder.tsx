import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Copy, ExternalLink, Plus, RotateCcw, Sparkles, Trash2, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { randomId } from "@/lib/id";
import { getPortfolioAnalytics } from "@/lib/analytics-service";
import { signOut } from "@/lib/auth-service";
import { fetchBillingStatus, type BillingStatus } from "@/lib/billing-service";
import { deletePortfolio, listPortfoliosByUser, upsertPortfolio } from "@/lib/portfolio-service";
import type { PortfolioRecord } from "@/lib/portfolio-service";
import { useAuth } from "@/contexts/AuthContext";
import type { PortfolioData, PortfolioProject, PortfolioTheme, SocialLinks } from "@/types/portfolio";

const createProject = (): PortfolioProject => ({
  id: randomId(),
  title: "",
  role: "",
  summary: "",
  link: "",
  tags: "",
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

interface BuilderProps {
  userId: string;
}

const emptySocial = (): SocialLinks => ({ website: "", linkedin: "", github: "" });

const hasApi = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());
const MAX_CV_SIZE_MB = 2;
const MAX_CV_SIZE_BYTES = MAX_CV_SIZE_MB * 1024 * 1024;
const ALLOWED_CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const Builder = ({ userId }: BuilderProps) => {
  const navigate = useNavigate();
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
  const [social, setSocial] = useState<SocialLinks>(emptySocial);
  const [slug, setSlug] = useState("");
  const [projects, setProjects] = useState<PortfolioProject[]>([createProject()]);
  const [recent, setRecent] = useState<PortfolioRecord[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [sidebarStats, setSidebarStats] = useState<{ views: number; clicks: number } | null>(null);
  const [billing, setBilling] = useState<BillingStatus | null>(null);

  const reloadList = useCallback(() => {
    setListLoading(true);
    listPortfoliosByUser(userId)
      .then(setRecent)
      .catch(() => setRecent([]))
      .finally(() => setListLoading(false));
  }, [userId]);

  useEffect(() => {
    reloadList();
  }, [reloadList]);

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

  useEffect(() => {
    if (!selectedSlug || !billing?.limits.analytics) {
      setSidebarStats(null);
      return;
    }
    getPortfolioAnalytics(selectedSlug).then((a) =>
      setSidebarStats({ views: a.views, clicks: a.projectClicks }),
    );
  }, [selectedSlug, billing?.limits.analytics]);

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
    setSocial(emptySocial());
    setProjects([createProject()]);
    setSelectedSlug(null);
  };

  const loadPortfolio = (p: PortfolioRecord) => {
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
    setSocial({
      website: p.socialLinks?.website ?? "",
      linkedin: p.socialLinks?.linkedin ?? "",
      github: p.socialLinks?.github ?? "",
    });
    setSlug(p.slug);
    setProjects(p.projects.length ? p.projects : [createProject()]);
    setSelectedSlug(p.slug);
    toast.info("Loaded for editing", { description: `You are editing “${p.slug}”.` });
  };

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

  const uploadProjectImage = (projectId: string, file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      updateProject(projectId, "imageUrl", result);
    };
    reader.readAsDataURL(file);
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
      customDomainVerified: false,
      socialLinks: Object.keys(socialClean).length ? socialClean : undefined,
      projects: cleanProjects,
      createdAt: new Date().toISOString(),
    };

    setSaving(true);
    try {
      await upsertPortfolio({ ...item, user_id: userId });
      toast.success(editingId ? "Portfolio updated" : "Portfolio published");
      reloadList();
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className="relative flex-1 overflow-x-hidden px-5 pb-20 pt-8 md:px-10">
        <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(ellipse_70%_40%_at_20%_0%,hsl(var(--primary)/0.12),transparent_65%),radial-gradient(ellipse_50%_30%_at_90%_20%,hsl(var(--accent)/0.1),transparent_60%)]" />

        <div className="mx-auto mb-8 max-w-7xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Dashboard</p>
          <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            Shape your <span className="text-gradient">public portfolio</span>
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            One polished page for recruiters and clients: profile, projects, and a stable URL you own.
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
                  <span className="font-medium text-foreground">Free plan:</span> one portfolio, Glass theme. Need more?{" "}
                  <Link to="/billing" className="text-primary underline underline-offset-2">
                    Upgrade
                  </Link>
                </p>
              ) : billing.billingTier === "basic" ? (
                <p>
                  <span className="font-medium text-foreground">Basic:</span> up to {billing.limits.maxPortfolios}{" "}
                  portfolios. Premium unlocks custom domain & removes branding.{" "}
                  <Link to="/billing" className="text-primary underline underline-offset-2">
                    Plans
                  </Link>
                </p>
              ) : (
                <p className="text-foreground/90">
                  <span className="font-medium">Premium:</span> custom domain, no “Made with” badge, full analytics.
                </p>
              )}
            </div>
          ) : null}
        </div>

        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
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
                <button
                  type="button"
                  onClick={resetForm}
                  className="glass-subtle inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                  New
                </button>
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

            <div className="mt-10 space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Profile</h3>
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

            <div className="mt-10 space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Publishing</h3>
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
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as PortfolioTheme)}
                    className="glass-subtle w-full rounded-xl border border-white/10 bg-transparent p-3 outline-none focus:border-primary"
                  >
                    <option value="glass" disabled={billing ? !billing.limits.themes.includes("glass") : false}>
                      Glass Pro
                    </option>
                    <option value="minimal" disabled={billing ? !billing.limits.themes.includes("minimal") : false}>
                      Minimal Clean
                    </option>
                    <option value="bold" disabled={billing ? !billing.limits.themes.includes("bold") : false}>
                      Bold Contrast
                    </option>
                  </select>
                  {billing?.billingTier === "free" ? (
                    <p className="mt-1 text-xs text-muted-foreground">Premium themes require Basic or Premium.</p>
                  ) : null}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs text-muted-foreground">Custom domain (optional)</label>
                  <input
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="portfolio.yourdomain.com"
                    disabled={Boolean(billing && !billing.limits.customDomain)}
                    className="glass-subtle w-full rounded-xl border border-white/10 bg-transparent p-3 outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {billing && !billing.limits.customDomain
                      ? "Custom domain is a Premium feature — upgrade on the Plans page."
                      : "Point DNS when you are ready — we will verify in a later step."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Links</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
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

            <div className="mt-10 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Projects</h3>
                <button type="button" onClick={addProject} className="glass-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm">
                  <Plus className="h-4 w-4" />
                  Add project
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Required per project: <span className="text-foreground/90">title</span> and{" "}
                <span className="text-foreground/90">summary</span>. Role, link, tags, and image are optional.
              </p>
              <div className="mt-4 space-y-4">
                {projects.map((project, idx) => (
                  <div key={project.id} className="glass-card rounded-2xl p-4 md:p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">Project {idx + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeProject(project.id)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Remove
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
                      placeholder="Outcome-focused summary: problem, what you did, measurable result."
                      className="glass-subtle mt-3 min-h-20 w-full rounded-lg border border-white/10 bg-transparent p-2.5 outline-none focus:border-primary"
                    />
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
                    <div className="mt-3">
                      <label className="mb-1 block text-xs text-muted-foreground">Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => uploadProjectImage(project.id, e.target.files?.[0])}
                        className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary/20 file:px-3 file:py-1.5 file:text-xs file:text-foreground hover:file:bg-primary/30"
                      />
                      {project.imageUrl ? (
                        <div className="mt-3">
                          <img
                            src={project.imageUrl}
                            alt=""
                            className="h-28 w-full rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => updateProject(project.id, "imageUrl", "")}
                            className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                            Remove image
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
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

          <motion.aside
            className="glass-card h-fit rounded-[1.75rem] p-6 md:p-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="font-display text-xl font-semibold">Your portfolios</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Open a published page to share, or load one here to edit. Analytics reflect visits and outbound project clicks.
            </p>
            <div className="mt-6 space-y-3">
              {listLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : recent.length === 0 ? (
                <p className="text-sm text-muted-foreground">No portfolios yet — publish your first on the left.</p>
              ) : (
                recent.slice(0, 12).map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-3 transition-colors ${
                      selectedSlug === item.slug ? "border-primary/50 bg-primary/5" : "border-white/10 bg-transparent"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        loadPortfolio(item);
                      }}
                      className="w-full text-left"
                    >
                      <p className="font-medium">{item.fullName}</p>
                      <p className="text-xs text-muted-foreground">{item.headline}</p>
                      <p className="mt-1 font-mono text-xs text-primary">/portfolio/{item.slug}</p>
                    </button>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Link
                        to={`/portfolio/${item.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="glass-subtle inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = window.confirm(`Delete portfolio "${item.slug}"? This cannot be undone.`);
                          if (!ok) return;
                          try {
                            await deletePortfolio(item.id);
                            if (editingId === item.id) resetForm();
                            reloadList();
                            toast.success("Portfolio deleted");
                          } catch (e) {
                            const msg = e instanceof Error ? e.message : "Could not delete portfolio";
                            toast.error(msg);
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-destructive/40 px-3 py-1 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {selectedSlug && billing && !billing.limits.analytics ? (
              <div className="mt-6 rounded-xl border border-dashed border-white/15 p-4 text-sm text-muted-foreground">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Analytics</p>
                <p className="mt-2">Included with Basic and Premium.</p>
                <Link to="/billing" className="mt-2 inline-block text-xs text-primary hover:underline">
                  View plans →
                </Link>
              </div>
            ) : null}
            {selectedSlug && sidebarStats && billing?.limits.analytics ? (
              <div className="mt-6 rounded-xl border border-white/10 p-4 text-sm">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Analytics · {selectedSlug}</p>
                <p className="mt-2 text-muted-foreground">
                  <span className="text-foreground font-semibold">{sidebarStats.views}</span> views ·{" "}
                  <span className="text-foreground font-semibold">{sidebarStats.clicks}</span> project clicks
                </p>
              </div>
            ) : null}
          </motion.aside>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};

export default Builder;
