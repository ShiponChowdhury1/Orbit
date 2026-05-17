import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppStore } from "@/store/app-store";
import { Users } from "lucide-react";

export const Route = createFileRoute("/explore")({
  head: () => ({ meta: [{ title: "Explore — Orbit" }] }),
  component: Explore,
});

function Explore() {
  const communities = useAppStore((s) => s.communities);
  const me = useAppStore((s) => s.currentUserId);
  const toggleJoin = useAppStore((s) => s.toggleJoin);
  const posts = useAppStore((s) => s.posts);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Explore communities</h1>
        <Link to="/community/new" className="inline-flex h-10 items-center justify-center px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Create</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {communities.map((c) => {
          const joined = me && c.members.includes(me);
          const count = posts.filter((p) => p.communityId === c.id && !p.deleted).length;
          return (
            <div key={c.id} className="glass rounded-2xl p-5 flex items-start gap-4">
              <div className="h-14 w-14 grid place-items-center rounded-2xl text-2xl shrink-0" style={{ background: c.color + "33" }}>{c.icon}</div>
              <div className="flex-1 min-w-0">
                <Link to="/c/$name" params={{ name: c.name }} className="font-display font-semibold text-lg hover:text-primary transition">o/{c.name}</Link>
                <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {c.members.length}</span>
                  <span>· {count} posts</span>
                </div>
              </div>
              <button onClick={() => toggleJoin(c.id)} className={`h-9 px-4 rounded-xl text-sm font-medium transition ${joined ? "bg-secondary" : "bg-primary text-primary-foreground"}`}>
                {joined ? "Joined" : "Join"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
