import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppStore } from "@/store/app-store";
import { userKarma } from "@/lib/selectors";
import { PostCard } from "@/components/orbit/PostCard";
import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/u/$username")({
  component: UserPage,
});

function UserPage() {
  const { username } = Route.useParams();
  const allUsers = useAppStore((s) => s.users);
  const allPosts = useAppStore((s) => s.posts);
  const allComments = useAppStore((s) => s.comments);
  const votes = useAppStore((s) => s.votes);
  const me = useAppStore((s) => s.currentUserId);
  const toggleFollow = useAppStore((s) => s.toggleFollow);
  const user = useMemo(() => allUsers.find((u) => u.username === username), [allUsers, username]);
  const myUser = useMemo(() => allUsers.find((u) => u.id === me), [allUsers, me]);
  const posts = useMemo(
    () => allPosts.filter((p) => user && p.authorId === user.id && !p.deleted),
    [allPosts, user],
  );
  const comments = useMemo(
    () => allComments.filter((c) => user && c.authorId === user.id),
    [allComments, user],
  );
  const followers = useMemo(
    () => allUsers.filter((u) => (u.following ?? []).includes(user?.id ?? "")).length,
    [allUsers, user],
  );
  const following = (user?.following ?? []).length;
  const isFollowing = !!(myUser?.following ?? []).includes(user?.id ?? "");
  const [tab, setTab] = useState<"posts" | "comments">("posts");

  if (!user) return <div className="glass rounded-2xl p-8 text-center">User not found.</div>;
  const karma = userKarma(allPosts, allComments, votes, user.id);

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6 flex items-center gap-5 flex-wrap">
        <div className="h-20 w-20 rounded-2xl bg-secondary grid place-items-center text-4xl overflow-hidden shrink-0">
          {user.avatar?.startsWith("data:") ? (
            <img src={user.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            user.avatar
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-2xl">
            @{user.username}{" "}
            {user.banned && <span className="text-sm text-destructive">(banned)</span>}
          </h1>
          <p className="text-sm text-muted-foreground">{user.bio}</p>
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <span>
              <b className="text-foreground">{karma}</b> karma
            </span>
            <span>
              <b className="text-foreground">{posts.length}</b> posts
            </span>
            <span>
              <b className="text-foreground">{comments.length}</b> comments
            </span>
            <span>
              <b className="text-foreground">{followers}</b> followers
            </span>
            <span>
              <b className="text-foreground">{following}</b> following
            </span>
            <span>Joined {formatDistanceToNow(user.createdAt, { addSuffix: true })}</span>
          </div>
        </div>
        {me && me !== user.id && (
          <button
            onClick={() => toggleFollow(user.id)}
            className={`h-10 px-5 rounded-xl text-sm font-medium ${isFollowing ? "bg-secondary" : "bg-primary text-primary-foreground"}`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>

      <div className="inline-flex p-1 rounded-xl glass">
        {(["posts", "comments"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 h-8 rounded-lg text-sm font-medium ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "posts" ? (
        <div className="space-y-4">
          {posts.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center text-muted-foreground">
              No posts yet.
            </div>
          )}
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {comments.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center text-muted-foreground">
              No comments yet.
            </div>
          )}
          {comments.map((c) => {
            const post = allPosts.find((p) => p.id === c.postId);
            return (
              <Link
                key={c.id}
                to="/post/$id"
                params={{ id: c.postId }}
                className="block glass rounded-2xl p-4 hover:border-primary/30 transition"
              >
                <div className="text-xs text-muted-foreground mb-1">
                  on "{post?.title}" · {formatDistanceToNow(c.createdAt, { addSuffix: true })}
                </div>
                <p className="text-sm">{c.body}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
