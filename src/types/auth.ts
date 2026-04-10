export type BillingTier = "free" | "basic" | "premium";

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  company?: string;
  avatarUrl?: string;
  /** From API /auth/me; absent in local-only mode */
  billingTier?: BillingTier;
}
