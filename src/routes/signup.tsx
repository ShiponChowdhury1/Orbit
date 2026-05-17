import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const nav = useNavigate();
  const signup = useAppStore((s) => s.signup);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = signup({ email, username, password });
    if (!res.ok) { setError(res.error); return; }
    nav({ to: "/" });
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="font-display font-bold text-2xl mb-2">Create your account</h1>
      <p className="text-sm text-muted-foreground mb-6">Join the conversation.</p>
      <form onSubmit={onSubmit} className="glass rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. nova" autoComplete="username" className="mt-1 w-full h-11 px-3 rounded-xl bg-secondary border border-border" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="mt-1 w-full h-11 px-3 rounded-xl bg-secondary border border-border" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Password</label>
            <input type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className="mt-1 w-full h-11 px-3 rounded-xl bg-secondary border border-border" />
          <p className="text-[11px] text-muted-foreground mt-1">At least 6 characters.</p>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button type="submit" className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium">Create account</button>
        <p className="text-sm text-center text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
