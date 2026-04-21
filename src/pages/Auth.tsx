import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/contexts/AuthContext";
import { signIn, signUp } from "@/lib/auth-service";

const Auth = () => {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = mode === "signup" ? await signUp(email, password) : await signIn(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    await refresh();
    navigate("/app");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
      <form onSubmit={submit} className="glass-frosted w-full max-w-md rounded-3xl p-8 md:p-10">
        <Link to="/" className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary">
          ← Back to home
        </Link>
        <h1 className="mt-4 text-3xl font-bold">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Secure sign-in for your portfolio workspace.</p>

        <div className="mt-6 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="glass-subtle w-full rounded-xl border border-white/10 bg-transparent p-3 outline-none focus:border-primary"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            minLength={6}
            className="glass-subtle w-full rounded-xl border border-white/10 bg-transparent p-3 outline-none focus:border-primary"
            required
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <button type="submit" disabled={loading} className="glass-pill mt-6 w-full rounded-full px-6 py-3 font-semibold">
          {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Login"}
        </button>

        <button
          type="button"
          onClick={() => setMode((prev) => (prev === "signup" ? "login" : "signup"))}
          className="mt-3 w-full text-sm text-muted-foreground underline underline-offset-4"
        >
          {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </form>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Auth;
