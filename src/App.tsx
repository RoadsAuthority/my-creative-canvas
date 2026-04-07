import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Auth from "./pages/Auth.tsx";
import Landing from "./pages/Landing.tsx";
import Builder from "./pages/Builder.tsx";
import NotFound from "./pages/NotFound.tsx";
import Portfolio from "./pages/Portfolio.tsx";
import Billing from "./pages/Billing.tsx";
import Analytics from "./pages/Analytics.tsx";
import Privacy from "./pages/Privacy.tsx";
import Terms from "./pages/Terms.tsx";
import Refunds from "./pages/Refunds.tsx";
import ContactUs from "./pages/ContactUs.tsx";
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
            <Builder userId={user?.id ?? "local-user"} />
          )
        }
      />
      <Route path="/portfolio/:slug" element={<Portfolio />} />
      <Route path="/billing" element={<Billing />} />
      <Route path="/analytics" element={<Analytics />} />
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
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
