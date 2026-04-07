export type PortfolioTheme = "glass" | "minimal" | "bold";

export interface PortfolioProject {
  id: string;
  title: string;
  role: string;
  summary: string;
  link: string;
  tags: string;
  imageUrl?: string;
}

/** Optional links shown on the public portfolio (stored as JSON when using API). */
export interface SocialLinks {
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface PortfolioData {
  id: string;
  slug: string;
  fullName: string;
  profileImageUrl?: string;
  cvUrl?: string;
  cvFileName?: string;
  headline: string;
  bio: string;
  email: string;
  location: string;
  theme: PortfolioTheme;
  customDomain: string;
  customDomainVerified: boolean;
  socialLinks?: SocialLinks;
  projects: PortfolioProject[];
  createdAt: string;
  /** Set by API on public GET /portfolios/:slug when session owns this portfolio */
  isOwner?: boolean;
  /** Public page: show “Made with PortfolioForge” for free/basic owners */
  showPoweredBy?: boolean;
}
