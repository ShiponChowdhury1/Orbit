import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { sortPosts, type SortKey } from "@/lib/selectors";
import { PostCard } from "@/components/orbit/PostCard";
import { SortTabs } from "@/components/orbit/SortTabs";
import { Users, ShieldAlert, Plus, X } from "lucide-react";

export const Route = createFileRoute("/c/$name")({
  component: CommunityPage,
});

function CommunityPage() {
  const { name } = Route.useParams();
  const [sort, setSort] = useState<SortKey>("hot");
  const allCommunities = useAppStore((s) => s.communities);
  const me = useAppStore((s) => s.currentUserId);
  const toggleJoin = useAppStore((s) => s.toggleJoin);
  const allPosts = useAppStore((s) => s.posts);
  const votes = useAppStore((s) => s.votes);
  const allUsers = useAppStore((s) => s.users);
  const community = useMemo(() => allCommunities.find((c) => c.name === name), [allCommunities, name]);
  const owner = useMemo(() => allUsers.find((u) => u.id === community?.ownerId), [allUsers, community]);
  const posts = useMemo(() => allPosts.filter((p) => community && p.communityId === community.id && !p.deleted), [allPosts, community]);
  const sorted = useMemo(() => {
    const arr = sortPosts(posts, votes, sort);
    // pinned posts always on top
    return [...arr.filter((p) => p.pinned), ...arr.filter((p) => !p.pinned)];
  }, [posts, votes, sort]);
  const addRule = useAppStore((s) => s.addCommunityRule);
  const removeRule = useAppStore((s) => s.removeCommunityRule);
  const [newRule, setNewRule] = useState("");

  if (!community) {
    return <div className="glass rounded-2xl p-8 text-center text-muted-foreground">Community not found.</div>;
  }
  const joined = me && community.members.includes(me);
  const isOwner = me && community.ownerId === me;

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl overflow-hidden">
        <div className="h-32 relative" style={{ background: `linear-gradient(135deg, ${community.color}66, ${community.color}11)` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/30" />
        </div>
        <div className="p-6 -mt-12 relative">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="h-20 w-20 grid place-items-center rounded-2xl text-4xl border-4 border-background" style={{ background: community.color + "33" }}>{community.icon}</div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-2xl flex items-center gap-2 flex-wrap">o/{community.name}
                {community.nsfw && <span className="px-1.5 h-5 inline-flex items-center rounded text-[10px] font-bold bg-destructive/15 text-destructive">NSFW</span>}
              </h1>
              <p className="text-sm text-muted-foreground">{community.title}</p>
            </div>
            <button onClick={() => toggleJoin(community.id)} className={`h-10 px-5 rounded-xl text-sm font-medium ${joined ? "bg-secondary" : "bg-primary text-primary-foreground"}`}>
              {joined ? (isOwner ? "Owner" : "Leave") : "Join"}
            </button>
          </div>
          <p className="mt-4 text-sm text-foreground/80">{community.description}</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {community.members.length} members</span>
            {owner && <span>Owned by <Link to="/u/$username" params={{ username: owner.username }} className="text-foreground hover:text-primary">@{owner.username}</Link></span>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-4 min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg">Posts</h2>
            <SortTabs value={sort} onChange={setSort} />
          </div>
          {sorted.length === 0 && <div className="glass rounded-2xl p-8 text-center text-muted-foreground">No posts yet.</div>}
          {sorted.map((p) => <PostCard key={p.id} post={p} />)}
        </div>

        <aside className="space-y-4">
          <div className="glass rounded-2xl p-4">
            <h3 className="font-display font-semibold text-sm mb-2 flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5" /> Rules</h3>
            {(community.rules ?? []).length === 0 && <p className="text-xs text-muted-foreground">No rules yet.</p>}
            <ol className="space-y-2 text-sm">
              {(community.rules ?? []).map((r, i) => (
                <li key={r.id} className="flex items-start gap-2">
                  <span className="text-xs font-bold text-muted-foreground mt-0.5">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{r.title}</div>
                    {r.description && <div className="text-xs text-muted-foreground">{r.description}</div>}
                  </div>
                  {isOwner && (
                    <button onClick={() => removeRule(community.id, r.id)} className="text-muted-foreground hover:text-destructive shrink-0"><X className="h-3.5 w-3.5" /></button>
                  )}
                </li>
              ))}
            </ol>
            {isOwner && (
              <form
                onSubmit={(e) => { e.preventDefault(); if (newRule.trim()) { addRule(community.id, { title: newRule.trim() }); setNewRule(""); } }}
                className="mt-3 flex gap-1"
              >
                <input value={newRule} onChange={(e) => setNewRule(e.target.value)} placeholder="Add a rule…" maxLength={80} className="flex-1 h-9 px-2 rounded-lg bg-secondary border border-border text-sm" />
                <button type="submit" className="h-9 w-9 grid place-items-center rounded-lg bg-primary text-primary-foreground"><Plus className="h-4 w-4" /></button>
              </form>
            )}
          </div>

          <div className="glass rounded-2xl p-4 text-xs text-muted-foreground space-y-1">
            <div className="font-display font-semibold text-sm text-foreground mb-1">About</div>
            <p>{community.description}</p>
            <p className="pt-2">Created {new Date(community.createdAt).toLocaleDateString()}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
