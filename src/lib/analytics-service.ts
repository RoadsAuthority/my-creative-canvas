export interface PortfolioAnalytics {
  slug: string;
  views: number;
  projectClicks: number;
  updatedAt: string;
}

const LOCAL_ANALYTICS_KEY = "portfolio-analytics";
const API_BASE = import.meta.env.VITE_API_BASE_URL?.trim();

const loadLocal = (): PortfolioAnalytics[] => {
  try {
    const raw = localStorage.getItem(LOCAL_ANALYTICS_KEY);
    return raw ? (JSON.parse(raw) as PortfolioAnalytics[]) : [];
  } catch {
    return [];
  }
};

const saveLocal = (items: PortfolioAnalytics[]) => {
  localStorage.setItem(LOCAL_ANALYTICS_KEY, JSON.stringify(items));
};

export const trackPortfolioView = async (slug: string) => {
  if (API_BASE) {
    await fetch(`${API_BASE}/analytics/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    return;
  }

  const items = loadLocal();
  const idx = items.findIndex((a) => a.slug === slug);
  if (idx === -1) {
    items.push({ slug, views: 1, projectClicks: 0, updatedAt: new Date().toISOString() });
  } else {
    items[idx].views += 1;
    items[idx].updatedAt = new Date().toISOString();
  }
  saveLocal(items);
};

export const trackProjectClick = async (slug: string) => {
  if (API_BASE) {
    await fetch(`${API_BASE}/analytics/project-click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    return;
  }

  const items = loadLocal();
  const idx = items.findIndex((a) => a.slug === slug);
  if (idx === -1) {
    items.push({ slug, views: 0, projectClicks: 1, updatedAt: new Date().toISOString() });
  } else {
    items[idx].projectClicks += 1;
    items[idx].updatedAt = new Date().toISOString();
  }
  saveLocal(items);
};

export const getPortfolioAnalytics = async (slug: string): Promise<PortfolioAnalytics> => {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/analytics/${slug}`, { credentials: "include" });
    if (!res.ok) return { slug, views: 0, projectClicks: 0, updatedAt: new Date().toISOString() };
    return (await res.json()) as PortfolioAnalytics;
  }

  return loadLocal().find((a) => a.slug === slug) ?? { slug, views: 0, projectClicks: 0, updatedAt: new Date().toISOString() };
};
