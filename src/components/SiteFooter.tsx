import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="no-print border-t border-white/10 bg-background/50 py-12 text-center text-sm text-muted-foreground">
      <div className="mx-auto max-w-6xl px-5">
        <p className="font-display font-semibold text-foreground">
          Portfolio<span className="text-primary">Forge</span>
        </p>
        <p className="mt-2 max-w-md mx-auto leading-relaxed">
          Professional portfolios for freelancers, designers, and developers — one link for resumes and client outreach.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link to="/auth" className="hover:text-primary">
            Create account
          </Link>
          <Link to="/portfolio/demo" className="hover:text-primary">
            View sample
          </Link>
          <Link to="/contact" className="hover:text-primary">
            Contact us
          </Link>
          <Link to="/privacy" className="hover:text-primary">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-primary">
            Terms
          </Link>
          <Link to="/refunds" className="hover:text-primary">
            Refunds
          </Link>
        </div>
        <p className="mt-8 text-xs text-muted-foreground/80">© {new Date().getFullYear()} PortfolioForge</p>
      </div>
    </footer>
  );
}
