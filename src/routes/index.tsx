import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { sortPosts, type SortKey } from "@/lib/selectors";
import { PostCard } from "@/components/orbit/PostCard";
import { SortTabs } from "@/components/orbit/SortTabs";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Orbit — communities done right" }, { name: "description", content: "A premium community platform for builders and thinkers." }] }),
  component: Index,
});

function Index() {
  const [sort, setSort] = useState<SortKey>("hot");
  const [feed, setFeed] = useState<"all" | "following">("all");
  const allPosts = useAppStore((s) => s.posts);
  const votes = useAppStore((s) => s.votes);
  const communities = useAppStore((s) => s.communities);
  const me = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  const myUser = useMemo(() => users.find((u) => u.id === me), [users, me]);
  const sorted = useMemo(() => {
    const hidden = new Set(myUser?.hiddenPosts ?? []);
    const following = new Set(myUser?.following ?? []);
    let list = allPosts.filter((p) => !p.deleted && !hidden.has(p.id));
    if (feed === "following" && me) list = list.filter((p) => following.has(p.authorId));
    return sortPosts(list, votes, sort);
  }, [allPosts, votes, sort, myUser, feed, me]);

  return (
    <div className="space-y-6">
      <section className="glass rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full bg-primary/15 text-primary text-xs font-medium mb-3">
            <Sparkles className="h-3 w-3" /> Welcome to your feed
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient max-w-2xl">Where curious people gather around ideas worth keeping.</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">Join communities, post things you care about, and have actual conversations.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {communities.slice(0, 4).map((c) => (
              <Link key={c.id} to="/c/$name" params={{ name: c.name }} className="px-3 h-8 inline-flex items-center gap-2 rounded-full bg-secondary text-sm hover:bg-primary/15 transition">
                <span>{c.icon}</span> o/{c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="font-display font-bold text-xl">Your feed</h2>
          {me && (
            <div className="inline-flex p-1 rounded-lg bg-secondary/60 text-xs">
              {(["all", "following"] as const).map((k) => (
                <button key={k} onClick={() => setFeed(k)} className={`px-2.5 h-7 rounded-md capitalize ${feed === k ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{k}</button>
              ))}
            </div>
          )}
        </div>
        <SortTabs value={sort} onChange={setSort} />
      </div>

      <div className="space-y-4">
        {sorted.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-muted-foreground">
            {feed === "following" ? "Follow people to see their posts here." : "Nothing to show yet."}
          </div>
        )}
        {sorted.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}
