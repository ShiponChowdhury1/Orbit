import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { PostCard } from "@/components/orbit/PostCard";

export const Route = createFileRoute("/saved")({
  component: SavedPage,
});

function SavedPage() {
  const me = useAppStore((s) => s.currentUserId);
  const savedList = useAppStore((s) => s.saved);
  const allPosts = useAppStore((s) => s.posts);
  const posts = useMemo(() => {
    const ids = new Set(savedList.filter((x) => x.userId === me).map((x) => x.postId));
    return allPosts.filter((p) => ids.has(p.id) && !p.deleted);
  }, [savedList, allPosts, me]);

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl">Saved</h1>
      {posts.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-muted-foreground">Nothing saved yet.</div>
      ) : (
        <div className="space-y-4">{posts.map((p) => <PostCard key={p.id} post={p} />)}</div>
      )}
    </div>
  );
}
