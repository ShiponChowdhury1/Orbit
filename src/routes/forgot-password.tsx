import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPage,
});

function ForgotPage() {
  const request = useAppStore((s) => s.requestPasswordReset);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setToken(null);
    const res = request(email);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setToken(res.token);
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="font-display font-bold text-2xl mb-2">Reset your password</h1>
      <p className="text-sm text-muted-foreground mb-6">
        We'll generate a reset link tied to your account.
      </p>
      <form onSubmit={onSubmit} className="glass rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full h-11 px-3 rounded-xl bg-secondary border border-border"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {token && (
          <div className="rounded-xl bg-primary/10 border border-primary/30 p-3 text-sm space-y-2">
            <p>Reset link generated (local mock — no email is actually sent):</p>
            <Link
              to="/reset-password"
              search={{ token }}
              className="text-primary font-medium underline break-all"
            >
              /reset-password?token={token}
            </Link>
          </div>
        )}
        <button
          type="submit"
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium"
        >
          Send reset link
        </button>
        <p className="text-sm text-center text-muted-foreground">
          Remembered it?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
