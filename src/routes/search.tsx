import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useAppStore } from "@/store/app-store";
import { PostCard } from "@/components/orbit/PostCard";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

type Search = { q?: string };

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : "",
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q = "" } = useSearch({ from: "/search" });
  const [tab, setTab] = useState<"posts" | "communities" | "users">("posts");
  const allPosts = useAppStore((s) => s.posts);
  const allCommunities = useAppStore((s) => s.communities);
  const allUsers = useAppStore((s) => s.users);
  const ql = q.toLowerCase();
  const posts = useMemo(
    () =>
      allPosts.filter(
        (p) =>
          !p.deleted && (p.title.toLowerCase().includes(ql) || p.body.toLowerCase().includes(ql)),
      ),
    [allPosts, ql],
  );
  const communities = useMemo(
    () => allCommunities.filter((c) => c.name.includes(ql) || c.title.toLowerCase().includes(ql)),
    [allCommunities, ql],
  );
  const users = useMemo(
    () => allUsers.filter((u) => u.username.toLowerCase().includes(ql)),
    [allUsers, ql],
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl">
        Results for "<span className="text-primary">{q}</span>"
      </h1>
      <div className="inline-flex p-1 rounded-xl glass">
        {(["posts", "communities", "users"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 h-8 rounded-lg text-sm font-medium capitalize ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            {t} (
            {t === "posts" ? posts.length : t === "communities" ? communities.length : users.length}
            )
          </button>
        ))}
      </div>

      {tab === "posts" && (
        <div className="space-y-4">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
      {tab === "communities" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {communities.map((c) => (
            <Link
              key={c.id}
              to="/c/$name"
              params={{ name: c.name }}
              className="glass rounded-2xl p-4 flex items-center gap-3"
            >
              <span
                className="h-10 w-10 grid place-items-center rounded-xl text-xl"
                style={{ background: c.color + "33" }}
              >
                {c.icon}
              </span>
              <div>
                <div className="font-semibold">o/{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.title}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {tab === "users" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {users.map((u) => (
            <Link
              key={u.id}
              to="/u/$username"
              params={{ username: u.username }}
              className="glass rounded-2xl p-4 flex items-center gap-3"
            >
              <span className="h-10 w-10 grid place-items-center rounded-xl bg-secondary text-xl">
                {u.avatar}
              </span>
              <div>
                <div className="font-semibold">@{u.username}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{u.bio}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
