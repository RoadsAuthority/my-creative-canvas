import type { PortfolioData } from "@/types/portfolio";

export function truncateSeo(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function buildPortfolioSeo(data: PortfolioData, origin: string) {
  const social = data.socialLinks;
  const title = social?.seoTitle?.trim() || `${data.fullName} · ${data.headline}`;
  const description = (() => {
    const custom = social?.seoDescription?.trim();
    if (custom) return truncateSeo(custom, 320);
    if (data.bio?.trim()) return truncateSeo(data.bio, 160);
    return truncateSeo(`${data.headline} — ${data.fullName}'s portfolio.`, 160);
  })();

  const ogImage = (() => {
    const custom = social?.seoOgImageUrl?.trim();
    if (custom?.startsWith("http://") || custom?.startsWith("https://")) return custom;
    if (data.profileImageUrl?.startsWith("http://") || data.profileImageUrl?.startsWith("https://")) {
      return data.profileImageUrl;
    }
    for (const p of data.projects) {
      const imgs = p.imageUrls?.length ? p.imageUrls : p.imageUrl ? [p.imageUrl] : [];
      for (const img of imgs) {
        if (img.startsWith("http://") || img.startsWith("https://")) return img;
      }
    }
    return `${origin}/og-image.svg`;
  })();

  const url = `${origin}/portfolio/${data.slug}`;
  return { title, description, ogImage, url };
}
