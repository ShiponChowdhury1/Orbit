import { createFileRoute } from "@tanstack/react-router";
import { useAppStore } from "@/store/app-store";
import { formatDistanceToNow } from "date-fns";
import { Ban, Trash2, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/moderation")({
  component: ModerationPage,
});

function ModerationPage() {
  const reports = useAppStore((s) => s.reports);
  const posts = useAppStore((s) => s.posts);
  const comments = useAppStore((s) => s.comments);
  const users = useAppStore((s) => s.users);
  const banUser = useAppStore((s) => s.banUser);
  const deletePost = useAppStore((s) => s.deletePost);
  const deleteComment = useAppStore((s) => s.deleteComment);
  const reset = useAppStore((s) => s.resetSeed);

  const findTarget = (r: typeof reports[number]) => {
    if (r.target === "post") return posts.find((p) => p.id === r.targetId)?.title ?? "(missing)";
    if (r.target === "comment") return comments.find((c) => c.id === r.targetId)?.body.slice(0, 80) ?? "(missing)";
    return users.find((u) => u.id === r.targetId)?.username ?? "(missing)";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Moderation</h1>
        <button onClick={reset} className="h-9 px-3 rounded-xl bg-secondary text-sm flex items-center gap-1.5"><RefreshCw className="h-4 w-4" /> Reset demo data</button>
      </div>

      <section className="glass rounded-2xl p-5">
        <h2 className="font-display font-semibold mb-3">Reports ({reports.length})</h2>
        {reports.length === 0 ? (
          <div className="text-sm text-muted-foreground">No reports.</div>
        ) : (
          <div className="space-y-2">
            {reports.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
                <span className="text-xs uppercase font-semibold text-muted-foreground w-20">{r.target}</span>
                <span className="flex-1 text-sm truncate">{findTarget(r)}</span>
                <span className="text-xs text-muted-foreground">{formatDistanceToNow(r.createdAt, { addSuffix: true })}</span>
                {r.target === "post" && <button onClick={() => deletePost(r.targetId)} className="h-8 px-3 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-1"><Trash2 className="h-3 w-3" /> Remove</button>}
                {r.target === "comment" && <button onClick={() => deleteComment(r.targetId)} className="h-8 px-3 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-1"><Trash2 className="h-3 w-3" /> Remove</button>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass rounded-2xl p-5">
        <h2 className="font-display font-semibold mb-3">Users</h2>
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
              <span className="h-8 w-8 grid place-items-center rounded-lg bg-secondary">{u.avatar}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">@{u.username} {u.banned && <span className="text-xs text-destructive ml-1">banned</span>}</div>
                <div className="text-xs text-muted-foreground truncate">{u.bio}</div>
              </div>
              <button onClick={() => banUser(u.id)} className="h-8 px-3 rounded-lg bg-secondary text-xs flex items-center gap-1"><Ban className="h-3 w-3" /> {u.banned ? "Unban" : "Ban"}</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
