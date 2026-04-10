import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Plus, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const hasApi = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());

type SiteHeaderProps = {
  /** When false, hides the Dashboard link (visitor-facing portfolio view). */
  showDashboard?: boolean;
};

export function SiteHeader({ showDashboard = true }: SiteHeaderProps) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const onDashboard = pathname.startsWith("/app");
  const displayName = user?.fullName?.trim() || user?.email || "Account";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <header className="no-print sticky top-0 z-50 border-b border-white/10 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <Link to="/" className="group flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary/25">
            <Sparkles className="h-4 w-4" />
          </span>
          <span>
            Portfolio<span className="text-primary">Forge</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {!onDashboard ? (
            <>
              <Link
                to="/#pricing"
                className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Pricing
              </Link>
              <Link
                to="/portfolio/demo"
                className="hidden rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
              >
                Sample
              </Link>
            </>
          ) : null}

          {showDashboard && user ? (
            <Link
              to="/app/new"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <Plus className="h-4 w-4" />
              Create portfolio
            </Link>
          ) : null}

          {showDashboard && user ? (
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          ) : null}

          {user && hasApi ? (
            <Link
              to="/analytics"
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              Analytics
            </Link>
          ) : null}

          {user && hasApi ? (
            <Link
              to="/billing"
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              Plans
            </Link>
          ) : null}

          {!user && hasApi ? (
            <>
              <Link to="/auth" className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                Sign in
              </Link>
              <Link to="/auth" className="glass-pill rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground">
                Sign up
              </Link>
            </>
          ) : null}

          {!hasApi && (
            <span className="hidden text-xs text-muted-foreground md:inline" title="Save data in this browser until API is connected">
              Local mode
            </span>
          )}

          {user ? (
            <Link
              to="/profile"
              className="ml-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-2 py-1.5 transition-colors hover:bg-white/10"
              title="Open profile"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="User avatar" className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {initials}
                </span>
              )}
              <span className="hidden max-w-[140px] truncate text-xs text-muted-foreground sm:inline">{displayName}</span>
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
