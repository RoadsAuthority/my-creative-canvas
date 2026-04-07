import { PortfolioData } from "@/types/portfolio";

const STORAGE_KEY = "portfolio-builder-items";

export const loadPortfolios = (): PortfolioData[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PortfolioData[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const savePortfolios = (items: PortfolioData[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const upsertPortfolio = (item: PortfolioData) => {
  const items = loadPortfolios();
  const index = items.findIndex((p) => p.slug === item.slug);

  if (index >= 0) {
    items[index] = item;
  } else {
    items.unshift(item);
  }

  savePortfolios(items);
};

export const getPortfolioBySlug = (slug: string) => {
  return loadPortfolios().find((p) => p.slug === slug) ?? null;
};
