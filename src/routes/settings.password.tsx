import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/settings/password")({
  component: ChangePasswordPage,
});

function ChangePasswordPage() {
  const me = useAppStore((s) => s.currentUserId);
  const changePassword = useAppStore((s) => s.changePassword);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!me) {
    return (
      <div className="glass rounded-2xl p-6 text-center space-y-3">
        <p>Sign in to change your password.</p>
        <Link
          to="/login"
          className="inline-grid place-items-center h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(false);
    if (next !== confirm) {
      setError("New passwords don't match.");
      return;
    }
    const res = changePassword(current, next);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setDone(true);
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  return (
    <form onSubmit={onSubmit} className="glass rounded-2xl p-6 space-y-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground">Current password</label>
        <input
          type="password"
          placeholder="Current password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          autoComplete="current-password"
          className="mt-1 w-full h-11 px-3 rounded-xl bg-secondary border border-border"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">New password</label>
        <input
          type="password"
          placeholder="At least 6 characters"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          autoComplete="new-password"
          className="mt-1 w-full h-11 px-3 rounded-xl bg-secondary border border-border"
        />
        <p className="text-[11px] text-muted-foreground mt-1">At least 6 characters.</p>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">Confirm new password</label>
        <input
          type="password"
          placeholder="Re-enter new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          className="mt-1 w-full h-11 px-3 rounded-xl bg-secondary border border-border"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {done && <p className="text-sm text-primary">Password updated successfully.</p>}
      <button
        type="submit"
        className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
      >
        Update password
      </button>
    </form>
  );
}
