import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "@/store/app-store";

type Search = { token?: string };

export const Route = createFileRoute("/reset-password")({
  validateSearch: (s: Record<string, unknown>): Search => ({ token: typeof s.token === "string" ? s.token : undefined }),
  component: ResetPage,
});

function ResetPage() {
  const nav = useNavigate();
  const search = useSearch({ from: "/reset-password" });
  const resetPassword = useAppStore((s) => s.resetPassword);
  const [token, setToken] = useState(search.token ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("Passwords don't match."); return; }
    const res = resetPassword(token.trim(), password);
    if (!res.ok) { setError(res.error); return; }
    setDone(true);
    setTimeout(() => nav({ to: "/login" }), 1200);
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="font-display font-bold text-2xl mb-2">Set a new password</h1>
      <form onSubmit={onSubmit} className="glass rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Reset token</label>
          <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste your reset token" className="mt-1 w-full h-11 px-3 rounded-xl bg-secondary border border-border font-mono text-xs" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">New password</label>
          <input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className="mt-1 w-full h-11 px-3 rounded-xl bg-secondary border border-border" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Confirm new password</label>
          <input type="password" placeholder="Re-enter new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" className="mt-1 w-full h-11 px-3 rounded-xl bg-secondary border border-border" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {done && <p className="text-sm text-primary">Password updated. Redirecting to sign in…</p>}
        <button type="submit" className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium">Update password</button>
        <p className="text-sm text-center text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
        </p>
      </form>
    </div>
  );
}
