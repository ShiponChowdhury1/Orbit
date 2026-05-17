import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "@/store/app-store";

type Search = { redirect?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): Search => ({ redirect: typeof s.redirect === "string" ? s.redirect : undefined }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const search = useSearch({ from: "/login" });
  const loginWithEmail = useAppStore((s) => s.loginWithEmail);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = loginWithEmail(email, password);
    if (!res.ok) { setError(res.error); return; }
    nav({ to: search.redirect ?? "/" });
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="font-display font-bold text-2xl mb-2">Welcome back</h1>
      <p className="text-sm text-muted-foreground mb-6">Sign in to post, comment, and vote.</p>
      <form onSubmit={onSubmit} className="glass rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Email</label>
          <input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full h-11 px-3 rounded-xl bg-secondary border border-border" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Password</label>
          <input type="password" autoComplete="current-password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full h-11 px-3 rounded-xl bg-secondary border border-border" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button type="submit" className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium">Sign in</button>
        <div className="flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground">Forgot password?</Link>
          <Link to="/signup" className="text-primary hover:underline">Create account</Link>
        </div>
      </form>
    </div>
  );
}
