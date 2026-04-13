export type PortfolioTheme =
  | "glass"
  | "minimal"
  | "bold"
  | "vintage"
  | "vintageRefined"
  | "vintageEditorial"
  | "devMode"
  | "scrollStory"
  | "atrium";

export interface PortfolioProject {
  id: string;
  title: string;
  role: string;
  /** Short overview / narrative (shown as main body copy). */
  summary: string;
  /** Challenge / context — optional case-study block. */
  problem?: string;
  /** Results / metrics — optional case-study block. */
  outcome?: string;
  /** Tools & stack (comma-separated), shown separately from tags. */
  stack?: string;
  link: string;
  tags: string;
  imageUrls?: string[];
  videoUrls?: string[];
  imageUrl?: string;
}

/** Optional links shown on the public portfolio (stored as JSON when using API). */
export interface SocialLinks {
  website?: string;
  linkedin?: string;
  github?: string;
  aboutTitle?: string;
  aboutText?: string;
  /** Page title / meta for link previews (stored in social_links JSON on API). */
  seoTitle?: string;
  seoDescription?: string;
  seoOgImageUrl?: string;
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
  customDomainVerifyToken?: string;
  customDomainLastCheckedAt?: string;
  socialLinks?: SocialLinks;
  projects: PortfolioProject[];
  createdAt: string;
  /** Set by API on public GET /portfolios/:slug when session owns this portfolio */
  isOwner?: boolean;
  /** Public page: show “Made with PortfolioForge” for free/basic owners */
  showPoweredBy?: boolean;
}
