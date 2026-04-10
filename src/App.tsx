import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth-service";
import { toast } from "sonner";
import Auth from "./pages/Auth.tsx";
import Landing from "./pages/Landing.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import PortfolioEditor from "./pages/PortfolioEditor.tsx";
import NotFound from "./pages/NotFound.tsx";
import Portfolio from "./pages/Portfolio.tsx";
import Billing from "./pages/Billing.tsx";
import Analytics from "./pages/Analytics.tsx";
import Privacy from "./pages/Privacy.tsx";
import Terms from "./pages/Terms.tsx";
import Refunds from "./pages/Refunds.tsx";
import ContactUs from "./pages/ContactUs.tsx";
import Profile from "./pages/Profile.tsx";
import { getPortfolioByDomain } from "./lib/portfolio-service";

const queryClient = new QueryClient();

const hasApi = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());
const knownHosts = new Set([
  "localhost",
  "127.0.0.1",
  "www.portfolioforge.uk",
  "portfolioforge.uk",
  "app.portfolioforge.uk",
  "api.portfolioforge.uk",
]);
const INACTIVITY_LIMIT_MS = 5 * 60 * 1000;
const WARNING_WINDOW_MS = 60 * 1000;

function SessionInactivityGuard() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const warningTimeoutRef = useRef<number | null>(null);
  const logoutTimeoutRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const warningEndsAtRef = useRef<number>(0);
  const loggingOutRef = useRef(false);

  const clearTimers = () => {
    if (warningTimeoutRef.current) window.clearTimeout(warningTimeoutRef.current);
    if (logoutTimeoutRef.current) window.clearTimeout(logoutTimeoutRef.current);
    if (countdownIntervalRef.current) window.clearInterval(countdownIntervalRef.current);
    warningTimeoutRef.current = null;
    logoutTimeoutRef.current = null;
    countdownIntervalRef.current = null;
  };

  const doLogout = async () => {
    if (loggingOutRef.current) return;
    loggingOutRef.current = true;
    clearTimers();
    setSecondsLeft(null);
    try {
      await signOut();
      await refresh();
      toast.warning("You were logged out due to inactivity.");
      if (location.pathname !== "/auth") navigate("/auth", { replace: true });
    } finally {
      loggingOutRef.current = false;
    }
  };

  const startWarning = () => {
    warningEndsAtRef.current = Date.now() + WARNING_WINDOW_MS;
    setSecondsLeft(Math.ceil(WARNING_WINDOW_MS / 1000));
    if (countdownIntervalRef.current) window.clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = window.setInterval(() => {
      const next = Math.max(0, Math.ceil((warningEndsAtRef.current - Date.now()) / 1000));
      setSecondsLeft(next);
    }, 1000);
  };

  const resetInactivityTimers = () => {
    if (!user || loggingOutRef.current) return;
    clearTimers();
    setSecondsLeft(null);
    warningTimeoutRef.current = window.setTimeout(startWarning, INACTIVITY_LIMIT_MS - WARNING_WINDOW_MS);
    logoutTimeoutRef.current = window.setTimeout(() => {
      void doLogout();
    }, INACTIVITY_LIMIT_MS);
  };

  useEffect(() => {
    if (!user) {
      clearTimers();
      setSecondsLeft(null);
      return;
    }

    const activityEvents: (keyof WindowEventMap)[] = ["mousemove", "keydown", "mousedown", "scroll", "touchstart"];
    const onActivity = () => resetInactivityTimers();
    const onVisibility = () => {
      if (!document.hidden) resetInactivityTimers();
    };

    resetInactivityTimers();
    activityEvents.forEach((eventName) => window.addEventListener(eventName, onActivity, { passive: true }));
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearTimers();
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, onActivity));
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [user]);

  if (!user || secondsLeft === null) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[90] w-[min(92vw,360px)] rounded-2xl border border-amber-400/40 bg-background/95 p-4 shadow-xl backdrop-blur">
      <p className="text-sm font-semibold text-amber-300">You are about to be logged out</p>
      <p className="mt-1 text-sm text-muted-foreground">
        No activity detected. Logging out in <span className="font-semibold text-foreground">{secondsLeft}s</span>.
      </p>
      <button type="button" onClick={resetInactivityTimers} className="glass-pill mt-3 rounded-full px-4 py-2 text-xs font-semibold">
        Stay signed in
      </button>
    </div>
  );
}

function HomeRoute() {
  const [resolvedSlug, setResolvedSlug] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const host = window.location.hostname.toLowerCase();
    if (knownHosts.has(host) || host.endsWith(".vercel.app")) {
      setChecked(true);
      return;
    }
    if (!hasApi) {
      setChecked(true);
      return;
    }
    getPortfolioByDomain(host)
      .then((p) => setResolvedSlug(p?.slug ?? null))
      .finally(() => setChecked(true));
  }, []);

  if (!checked) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">Loading...</div>;
  }
  if (resolvedSlug) return <Navigate to={`/portfolio/${resolvedSlug}`} replace />;
  return <Landing />;
}

function PortfolioEditorRoute() {
  const { user } = useAuth();
  const location = useLocation();
  return <PortfolioEditor key={location.pathname} userId={user?.id ?? "local-user"} />;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6">
        <div className="h-10 w-10 animate-pulse rounded-full border-2 border-primary/30 border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading your workspace…</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/app"
        element={
          hasApi && !user ? (
            <Navigate to="/auth" replace />
          ) : (
            <Dashboard />
          )
        }
      />
      <Route
        path="/app/new"
        element={hasApi && !user ? <Navigate to="/auth" replace /> : <PortfolioEditorRoute />}
      />
      <Route
        path="/app/edit/:slug"
        element={hasApi && !user ? <Navigate to="/auth" replace /> : <PortfolioEditorRoute />}
      />
      <Route path="/portfolio/:slug" element={<Portfolio />} />
      <Route path="/billing" element={<Billing />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/refunds" element={<Refunds />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" richColors />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <SessionInactivityGuard />
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
