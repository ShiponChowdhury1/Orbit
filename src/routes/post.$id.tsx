import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { scoreFor, userVote } from "@/lib/selectors";
import {
  ArrowBigDown,
  ArrowBigUp,
  Bookmark,
  Pencil,
  Trash2,
  Share2,
  Check,
  Flag,
  Lock,
  Pin,
  EyeOff,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommentTree } from "@/components/orbit/CommentTree";
import { RichTextEditor, RichContent } from "@/components/orbit/RichTextEditor";
import { MediaUploader } from "@/components/orbit/MediaUploader";
import type { MediaType } from "@/lib/types";
import type { CommentSort } from "@/lib/selectors";

export const Route = createFileRoute("/post/$id")({
  component: PostPage,
});

function PostPage() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const allPosts = useAppStore((s) => s.posts);
  const allCommunities = useAppStore((s) => s.communities);
  const allUsers = useAppStore((s) => s.users);
  const me = useAppStore((s) => s.currentUserId);
  const votes = useAppStore((s) => s.votes);
  const vote = useAppStore((s) => s.vote);
  const addComment = useAppStore((s) => s.addComment);
  const updatePost = useAppStore((s) => s.updatePost);
  const deletePost = useAppStore((s) => s.deletePost);
  const toggleSave = useAppStore((s) => s.toggleSave);
  const reportItem = useAppStore((s) => s.reportItem);
  const togglePostLock = useAppStore((s) => s.togglePostLock);
  const togglePostPin = useAppStore((s) => s.togglePostPin);
  const toggleHidePost = useAppStore((s) => s.toggleHidePost);
  const toggleFollow = useAppStore((s) => s.toggleFollow);
  const savedList = useAppStore((s) => s.saved);
  const post = useMemo(() => allPosts.find((p) => p.id === id), [allPosts, id]);
  const community = useMemo(
    () => allCommunities.find((c) => c.id === post?.communityId),
    [allCommunities, post],
  );
  const author = useMemo(() => allUsers.find((u) => u.id === post?.authorId), [allUsers, post]);
  const saved = useMemo(
    () => savedList.some((x) => x.userId === me && x.postId === id),
    [savedList, me, id],
  );
  const myUser = useMemo(() => allUsers.find((u) => u.id === me), [allUsers, me]);
  const isFollowing = !!(myUser?.following ?? []).includes(post?.authorId ?? "");
  const isHidden = !!(myUser?.hiddenPosts ?? []).includes(id);

  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editMediaUrl, setEditMediaUrl] = useState<string | undefined>(undefined);
  const [editMediaType, setEditMediaType] = useState<MediaType | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [commentSort, setCommentSort] = useState<CommentSort>("best");

  if (!post) return <div className="glass rounded-2xl p-8 text-center">Post not found.</div>;

  const score = scoreFor(votes, "post", post.id);
  const my = userVote(votes, me, "post", post.id);
  const mine = !!me && me === post.authorId;
  const canModerate =
    !!me && (mine || community?.ownerId === me || (community?.moderators ?? []).includes(me));
  const media = post.mediaUrl ?? post.imageUrl;
  const mediaType = post.mediaType ?? (post.imageUrl ? "image" : undefined);

  const startEdit = () => {
    setEditing(true);
    setEditTitle(post.title);
    setEditBody(post.body);
    setEditMediaUrl(post.mediaUrl ?? post.imageUrl);
    setEditMediaType(post.mediaType ?? (post.imageUrl ? "image" : undefined));
  };

  const share = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/post/${post.id}`
        : `/post/${post.id}`;
    try {
      if (
        typeof navigator !== "undefined" &&
        (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }).share
      ) {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({
          title: post.title,
          url,
        });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      /* cancelled */
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <article className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
          {post.pinned && (
            <span className="inline-flex items-center gap-1 px-1.5 h-5 rounded text-[10px] font-semibold bg-primary/15 text-primary">
              <Pin className="h-3 w-3" /> Pinned
            </span>
          )}
          {community && (
            <Link
              to="/c/$name"
              params={{ name: community.name }}
              className="font-medium text-foreground hover:text-primary"
            >
              o/{community.name}
            </Link>
          )}
          <span>·</span>
          {author && (
            <Link
              to="/u/$username"
              params={{ username: author.username }}
              className="hover:underline"
            >
              @{author.username}
            </Link>
          )}
          {author && me && !mine && (
            <button
              onClick={() => toggleFollow(author.id)}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
          <span>·</span>
          <span>{formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
          {post.updatedAt > post.createdAt + 1000 && (
            <span className="text-[10px] uppercase tracking-wide opacity-70">edited</span>
          )}
          {post.locked && (
            <span className="inline-flex items-center gap-1 text-amber-500">
              <Lock className="h-3 w-3" /> locked
            </span>
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              maxLength={200}
              className="w-full h-11 px-3 rounded-xl bg-secondary border border-border"
            />
            <MediaUploader
              mediaUrl={editMediaUrl}
              mediaType={editMediaType}
              onChange={({ mediaUrl, mediaType }) => {
                setEditMediaUrl(mediaUrl);
                setEditMediaType(mediaType);
              }}
            />
            <RichTextEditor
              value={editBody}
              onChange={setEditBody}
              placeholder="Edit body…"
              minHeight={160}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (!editTitle.trim()) return;
                  updatePost(post.id, {
                    title: editTitle.trim(),
                    body: editBody,
                    mediaUrl: editMediaUrl,
                    mediaType: editMediaType,
                  });
                  setEditing(false);
                }}
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="h-9 px-4 rounded-lg bg-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {post.flair && (
                <span
                  className="px-2 h-5 inline-flex items-center rounded-full text-[10px] font-semibold"
                  style={{ background: post.flair.color + "33", color: post.flair.color }}
                >
                  {post.flair.label}
                </span>
              )}
              {post.nsfw && (
                <span className="px-1.5 h-5 inline-flex items-center rounded text-[10px] font-bold bg-destructive/15 text-destructive">
                  NSFW
                </span>
              )}
              {post.spoiler && (
                <span className="px-1.5 h-5 inline-flex items-center rounded text-[10px] font-bold bg-secondary text-foreground">
                  SPOILER
                </span>
              )}
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl mb-3 break-words">
              {post.title}
            </h1>
            {post.body && (
              <RichContent html={post.body} className="text-foreground/90 break-words" />
            )}
            {media && (
              <div className="mt-4 rounded-xl overflow-hidden border border-border bg-secondary/40">
                {mediaType === "video" ? (
                  <video src={media} controls className="w-full" />
                ) : (
                  <img src={media} alt="" className="w-full" />
                )}
              </div>
            )}
          </>
        )}

        <div className="mt-5 flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-secondary/60 rounded-full">
            <button
              onClick={() => vote("post", post.id, my === 1 ? 0 : 1)}
              className={`h-9 w-9 grid place-items-center rounded-full ${my === 1 ? "text-primary" : ""}`}
              aria-label="Upvote"
            >
              <ArrowBigUp className="h-4 w-4" fill={my === 1 ? "currentColor" : "none"} />
            </button>
            <span
              className={`text-sm font-semibold w-8 text-center ${my === 1 ? "text-primary" : my === -1 ? "text-destructive" : ""}`}
            >
              {score}
            </span>
            <button
              onClick={() => vote("post", post.id, my === -1 ? 0 : -1)}
              className={`h-9 w-9 grid place-items-center rounded-full ${my === -1 ? "text-destructive" : ""}`}
              aria-label="Downvote"
            >
              <ArrowBigDown className="h-4 w-4" fill={my === -1 ? "currentColor" : "none"} />
            </button>
          </div>
          <button
            onClick={() => toggleSave(post.id)}
            className={`h-9 px-3 rounded-full bg-secondary/60 hover:bg-secondary text-sm flex items-center gap-1.5 ${saved ? "text-primary" : ""}`}
          >
            <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} />{" "}
            {saved ? "Saved" : "Save"}
          </button>
          <button
            onClick={share}
            className="h-9 px-3 rounded-full bg-secondary/60 hover:bg-secondary text-sm flex items-center gap-1.5"
          >
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Share2 className="h-4 w-4" />}
            {copied ? "Copied" : "Share"}
          </button>
          {!mine && me && (
            <>
              <button
                onClick={() => reportItem("post", post.id, "User report")}
                className="h-9 px-3 rounded-full bg-secondary/60 hover:bg-secondary text-sm flex items-center gap-1.5"
              >
                <Flag className="h-4 w-4" /> Report
              </button>
              <button
                onClick={() => toggleHidePost(post.id)}
                className="h-9 px-3 rounded-full bg-secondary/60 hover:bg-secondary text-sm flex items-center gap-1.5"
              >
                <EyeOff className="h-4 w-4" /> {isHidden ? "Unhide" : "Hide"}
              </button>
            </>
          )}
          {canModerate && !editing && (
            <>
              <button
                onClick={() => togglePostPin(post.id)}
                className={`h-9 px-3 rounded-full bg-secondary/60 hover:bg-secondary text-sm flex items-center gap-1.5 ${post.pinned ? "text-primary" : ""}`}
              >
                <Pin className="h-4 w-4" /> {post.pinned ? "Unpin" : "Pin"}
              </button>
              <button
                onClick={() => togglePostLock(post.id)}
                className={`h-9 px-3 rounded-full bg-secondary/60 hover:bg-secondary text-sm flex items-center gap-1.5 ${post.locked ? "text-amber-500" : ""}`}
              >
                <Lock className="h-4 w-4" /> {post.locked ? "Unlock" : "Lock"}
              </button>
            </>
          )}
          {mine && !editing && (
            <>
              <button
                onClick={startEdit}
                className="h-9 px-3 rounded-full bg-secondary/60 hover:bg-secondary text-sm flex items-center gap-1.5"
              >
                <Pencil className="h-4 w-4" /> Edit
              </button>
              {confirmDelete ? (
                <>
                  <button
                    onClick={() => {
                      deletePost(post.id);
                      nav({ to: "/" });
                    }}
                    className="h-9 px-3 rounded-full bg-destructive text-destructive-foreground text-sm flex items-center gap-1.5"
                  >
                    <Trash2 className="h-4 w-4" /> Confirm delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="h-9 px-3 rounded-full bg-secondary text-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="h-9 px-3 rounded-full bg-secondary/60 hover:bg-secondary text-sm flex items-center gap-1.5 text-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              )}
            </>
          )}
        </div>
      </article>

      <section className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-display font-semibold text-lg">Comments</h2>
          <div className="inline-flex p-1 rounded-lg bg-secondary/60 text-xs">
            {(["best", "new", "old", "top"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setCommentSort(k)}
                className={`px-2.5 h-7 rounded-md capitalize ${commentSort === k ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
        {post.locked ? (
          <div className="text-sm text-amber-500 mb-4 flex items-center gap-1.5">
            <Lock className="h-4 w-4" /> This post is locked. New comments are disabled.
          </div>
        ) : me ? (
          <div className="mb-6 space-y-2">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add to the conversation…"
              rows={3}
              maxLength={2000}
              className="w-full p-3 rounded-xl bg-secondary border border-border"
            />
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (comment.trim()) {
                    addComment(post.id, comment.trim());
                    setComment("");
                  }
                }}
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
              >
                Comment
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground mb-4">
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>{" "}
            to comment.
          </div>
        )}
        <CommentTree postId={post.id} sort={commentSort} locked={!!post.locked} />
      </section>
    </div>
  );
}
