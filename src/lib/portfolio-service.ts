import { PortfolioData } from "@/types/portfolio";

export interface PortfolioRecord extends PortfolioData {
  /** Present for your own listings and local storage; omitted on public API slug GET */
  user_id?: string;
}

const LOCAL_KEY = "portfolio-builder-items";
const API_BASE = import.meta.env.VITE_API_BASE_URL?.trim();

const apiFetch = (path: string, init?: RequestInit) =>
  fetch(`${API_BASE}${path}`, { ...init, credentials: "include" });

/** Slug used for marketing “Sample” links — must match a real published portfolio when `VITE_API_BASE_URL` is set. */
export const SAMPLE_PORTFOLIO_SLUG = "captain";

const DEMO_PORTFOLIO: PortfolioRecord = {
  id: "demo",
  user_id: "demo-user",
  slug: "demo",
  fullName: "Alex Carter",
  profileImageUrl: "",
  cvUrl: "",
  cvFileName: "",
  headline: "Product Designer & Frontend Developer",
  bio: "I build conversion-focused digital products for startups and agencies.",
  email: "alex@example.com",
  location: "Remote",
  theme: "glass",
  customDomain: "alex.design",
  customDomainVerified: true,
  socialLinks: {
    website: "https://example.com",
    linkedin: "https://linkedin.com/in/example",
    github: "https://github.com/example",
    aboutTitle: "Design with purpose and personality",
    aboutText: "I design and ship digital products that blend strategy, craft, and measurable outcomes.",
  },
  projects: [
    {
      id: "p1",
      title: "Finance Dashboard",
      role: "Lead Product Designer",
      summary:
        "End-to-end redesign of onboarding and the core dashboard for a B2B finance product, aligning IA with how teams actually work.",
      problem: "Activation stalled after signup; users struggled to connect accounts and reach their first meaningful insight.",
      outcome: "+28% activation in 6 weeks; −35% time-to-first-value in usability tests.",
      stack: "Figma, React, TypeScript, Storybook",
      link: "https://example.com",
      tags: "Product design, UX research",
      imageUrl: "",
    },
  ],
  createdAt: new Date().toISOString(),
};

const loadLocal = (): PortfolioRecord[] => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as PortfolioRecord[]) : [];
  } catch {
    return [];
  }
};

const saveLocal = (items: PortfolioRecord[]) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
};

export const listPortfoliosByUser = async (userId: string): Promise<PortfolioRecord[]> => {
  if (!API_BASE) {
    return loadLocal().filter((p) => p.user_id === userId);
  }

  const res = await apiFetch(`/portfolios?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("Failed to load portfolios");
  return (await res.json()) as PortfolioRecord[];
};

export const getPortfolioBySlug = async (slug: string): Promise<PortfolioRecord | null> => {
  if (slug === "demo") return { ...DEMO_PORTFOLIO, showPoweredBy: true };
  if (!API_BASE) {
    return loadLocal().find((p) => p.slug === slug) ?? null;
  }

  const res = await apiFetch(`/portfolios/${encodeURIComponent(slug)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load portfolio");
  return (await res.json()) as PortfolioRecord;
};

export const getPortfolioByDomain = async (host: string): Promise<PortfolioRecord | null> => {
  if (!API_BASE) return null;
  const res = await fetch(`${API_BASE}/portfolios/by-domain?host=${encodeURIComponent(host)}`, {
    credentials: "include",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to resolve domain portfolio");
  return (await res.json()) as PortfolioRecord;
};

export const upsertPortfolio = async (item: PortfolioRecord): Promise<void> => {
  if (!API_BASE) {
    const items = loadLocal();
    const index = items.findIndex((p) => p.slug === item.slug);
    if (index >= 0) items[index] = item;
    else items.unshift(item);
    saveLocal(items);
    return;
  }

  const res = await apiFetch(`/portfolios/upsert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (res.status === 402) {
    const errBody = await res.json().catch(() => ({}));
    const msg = typeof errBody?.message === "string" ? errBody.message : "Upgrade required to publish.";
    const e = new Error(msg) as Error & { code?: string; status?: number };
    e.code = typeof errBody?.code === "string" ? errBody.code : "BILLING";
    e.status = 402;
    throw e;
  }
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    let message = typeof errBody?.message === "string" ? errBody.message : "Failed to save portfolio";
    if (typeof (errBody as { detail?: string }).detail === "string") {
      message = `${message} — ${(errBody as { detail: string }).detail}`;
    }
    throw new Error(message);
  }
};

export const deletePortfolio = async (id: string): Promise<void> => {
  if (!API_BASE) {
    const items = loadLocal().filter((p) => p.id !== id);
    saveLocal(items);
    return;
  }

  const res = await apiFetch(`/portfolios/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = typeof body?.message === "string" ? body.message : "Failed to delete portfolio";
    throw new Error(msg);
  }
};

export const verifyCustomDomain = async (slug: string): Promise<{ verified: boolean; message: string }> => {
  if (!API_BASE) return { verified: false, message: "API not connected." };
  const res = await apiFetch(`/domains/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { verified: false, message: typeof body?.message === "string" ? body.message : "Verification failed." };
  }
  return {
    verified: Boolean(body?.verified),
    message: typeof body?.message === "string" ? body.message : "Verification complete.",
  };
};
