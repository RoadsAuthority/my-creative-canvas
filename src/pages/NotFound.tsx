import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Page not found — Creative Canvas";
  }, []);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.warn("404:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="container flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">404</p>
        <h1 className="mb-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          This page does not exist
        </h1>
        <p className="mb-8 max-w-md text-muted-foreground">
          The URL may be mistyped, or the page was moved. Check the address or go back to the home page.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            Home
          </Link>
          <Link
            to="/app"
            className="rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Dashboard
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default NotFound;
