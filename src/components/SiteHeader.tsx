import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Sparkles, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SAMPLE_PORTFOLIO_SLUG } from "@/lib/portfolio-service";

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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const navLinkClass =
    "block rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground md:inline-block md:rounded-full md:px-4 md:py-2";

  return (
    <header className="no-print sticky top-0 z-50 border-b border-white/10 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-5 md:px-8">
        <Link
          to="/"
          className="group flex min-w-0 shrink-0 items-center gap-2 font-display text-base font-bold tracking-tight sm:text-lg"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary/25 sm:h-9 sm:w-9">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="truncate">
            Portfolio<span className="text-primary">Forge</span>
          </span>
        </Link>

        {/* Desktop / tablet: single row, scroll if needed instead of wrapping */}
        <nav className="hidden min-w-0 flex-1 flex-nowrap items-center justify-end gap-1 overflow-x-auto overflow-y-hidden py-1 [scrollbar-width:none] md:flex md:[&_a]:shrink-0 md:[&::-webkit-scrollbar]:hidden lg:gap-2">
          {!onDashboard ? (
            <>
              <Link to="/#pricing" className={navLinkClass}>
                Pricing
              </Link>
              <Link to={`/portfolio/${SAMPLE_PORTFOLIO_SLUG}`} className={`${navLinkClass} hidden sm:inline-block`}>
                Sample
              </Link>
            </>
          ) : null}

          {showDashboard && user ? (
            <Link to="/app" className={navLinkClass}>
              Dashboard
            </Link>
          ) : null}

          {user && hasApi ? (
            <Link to="/analytics" className={navLinkClass}>
              Analytics
            </Link>
          ) : null}

          {user && hasApi ? (
            <Link to="/billing" className={navLinkClass}>
              Plans
            </Link>
          ) : null}

          {!user && hasApi ? (
            <>
              <Link to="/auth" className={navLinkClass}>
                Sign in
              </Link>
              <Link to="/auth" className="glass-pill inline-block rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground">
                Sign up
              </Link>
            </>
          ) : null}

          {user ? (
            <Link
              to="/profile"
              className="ml-1 inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-2 py-1.5 transition-colors hover:bg-white/10"
              title="Open profile"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="User avatar" className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {initials}
                </span>
              )}
              <span className="hidden max-w-[120px] truncate text-xs text-muted-foreground lg:inline">{displayName}</span>
            </Link>
          ) : null}
        </nav>

        {/* Mobile menu */}
        <div className="flex shrink-0 items-center gap-2 md:hidden">
          {user ? (
            <Link
              to="/profile"
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.02] p-1 transition-colors hover:bg-white/10"
              title="Profile"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {initials}
                </span>
              )}
            </Link>
          ) : null}
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-foreground transition hover:bg-white/10"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <>
          <button
            type="button"
            aria-hidden
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-x-0 top-14 z-50 max-h-[min(70vh,calc(100dvh-3.5rem))] overflow-y-auto border-b border-white/10 bg-background/95 px-4 py-4 shadow-xl backdrop-blur-xl sm:top-16 sm:max-h-[min(70vh,calc(100dvh-4rem))] md:hidden">
            <div className="mx-auto flex max-w-6xl flex-col gap-1">
              {!onDashboard ? (
                <>
                  <Link to="/#pricing" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                    Pricing
                  </Link>
                  <Link
                    to={`/portfolio/${SAMPLE_PORTFOLIO_SLUG}`}
                    className={navLinkClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    Sample
                  </Link>
                </>
              ) : null}
              {showDashboard && user ? (
                <Link to="/app" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
              ) : null}
              {user && hasApi ? (
                <Link to="/analytics" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                  Analytics
                </Link>
              ) : null}
              {user && hasApi ? (
                <Link to="/billing" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                  Plans
                </Link>
              ) : null}
              {!user && hasApi ? (
                <>
                  <Link to="/auth" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                    Sign in
                  </Link>
                  <Link
                    to="/auth"
                    className="glass-pill mt-1 block rounded-full px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign up
                  </Link>
                </>
              ) : null}
              {user ? (
                <div className="mt-2 border-t border-white/10 pt-3">
                  <p className="px-3 text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">Signed in</p>
                  <p className="truncate px-3 py-1 text-sm text-foreground">{displayName}</p>
                  <Link to="/profile" className={`${navLinkClass} mt-1`} onClick={() => setMobileOpen(false)}>
                    Profile &amp; account
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
