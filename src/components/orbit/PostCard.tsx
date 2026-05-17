import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAppStore } from "@/store/app-store";
import { scoreFor, userVote } from "@/lib/selectors";
import { ArrowBigDown, ArrowBigUp, Bookmark, MessageSquare, Flag, Share2, Check, EyeOff, Lock, Pin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Post } from "@/lib/types";
import { htmlToPlainText } from "@/lib/sanitize";

export function PostCard({ post }: { post: Post }) {
  const communities = useAppStore((s) => s.communities);
  const users = useAppStore((s) => s.users);
  const votes = useAppStore((s) => s.votes);
  const me = useAppStore((s) => s.currentUserId);
  const vote = useAppStore((s) => s.vote);
  const toggleSave = useAppStore((s) => s.toggleSave);
  const reportItem = useAppStore((s) => s.reportItem);
  const toggleHidePost = useAppStore((s) => s.toggleHidePost);
  const savedList = useAppStore((s) => s.saved);
  const comments = useAppStore((s) => s.comments);
  const community = useMemo(() => communities.find((c) => c.id === post.communityId), [communities, post.communityId]);
  const author = useMemo(() => users.find((u) => u.id === post.authorId), [users, post.authorId]);
  const saved = useMemo(() => savedList.some((x) => x.userId === me && x.postId === post.id), [savedList, me, post.id]);
  const commentsCount = useMemo(() => comments.filter((c) => c.postId === post.id && !c.deleted).length, [comments, post.id]);
  const [copied, setCopied] = useState(false);
  const [revealMedia, setRevealMedia] = useState(false);

  const score = scoreFor(votes, "post", post.id);
  const my = userVote(votes, me, "post", post.id);
  const preview = useMemo(() => htmlToPlainText(post.body).slice(0, 240), [post.body]);
  const media = post.mediaUrl ?? post.imageUrl;
  const mediaType = post.mediaType ?? (post.imageUrl ? "image" : undefined);
  const shouldBlur = (post.nsfw || post.spoiler) && !revealMedia;

  const share = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = typeof window !== "undefined" ? `${window.location.origin}/post/${post.id}` : `/post/${post.id}`;
    try {
      if (typeof navigator !== "undefined" && (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }).share) {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({ title: post.title, url });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch { /* user cancelled */ }
  };

  return (
    <article className="glass rounded-2xl p-4 sm:p-5 group hover:border-primary/30 transition">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
        {post.pinned && (
          <span className="inline-flex items-center gap-1 px-1.5 h-5 rounded text-[10px] font-semibold bg-primary/15 text-primary"><Pin className="h-3 w-3" /> Pinned</span>
        )}
        {community && (
          <Link to="/c/$name" params={{ name: community.name }} className="flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition">
            <span className="h-5 w-5 grid place-items-center rounded-md text-[11px]" style={{ background: community.color + "33" }}>{community.icon}</span>
            o/{community.name}
          </Link>
        )}
        <span>·</span>
        {author && (
          <Link to="/u/$username" params={{ username: author.username }} className="hover:underline">@{author.username}</Link>
        )}
        <span>·</span>
        <span>{formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
        {post.locked && <span className="inline-flex items-center gap-1 text-amber-500"><Lock className="h-3 w-3" /> locked</span>}
      </div>

      <Link to="/post/$id" params={{ id: post.id }} className="block">
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          {post.flair && (
            <span className="px-2 h-5 inline-flex items-center rounded-full text-[10px] font-semibold" style={{ background: post.flair.color + "33", color: post.flair.color }}>{post.flair.label}</span>
          )}
          {post.nsfw && <span className="px-1.5 h-5 inline-flex items-center rounded text-[10px] font-bold bg-destructive/15 text-destructive">NSFW</span>}
          {post.spoiler && <span className="px-1.5 h-5 inline-flex items-center rounded text-[10px] font-bold bg-secondary text-foreground">SPOILER</span>}
        </div>
        <h2 className="font-display text-lg sm:text-xl font-semibold leading-tight mb-1.5 group-hover:text-primary transition break-words">{post.title}</h2>
        {preview && <p className="text-sm text-muted-foreground line-clamp-3 break-words">{preview}</p>}
        {media && (
          <div className="mt-3 rounded-xl overflow-hidden border border-border bg-secondary/40 relative">
            <div className={shouldBlur ? "blur-2xl scale-105" : ""}>
              {mediaType === "video" ? (
                <video src={media} controls={!shouldBlur} className="w-full max-h-96" />
              ) : (
                <img src={media} alt="" className="w-full max-h-96 object-cover" />
              )}
            </div>
            {shouldBlur && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setRevealMedia(true); }}
                className="absolute inset-0 grid place-items-center bg-background/40 text-sm font-semibold"
              >
                {post.nsfw ? "NSFW — Click to view" : "Spoiler — Click to view"}
              </button>
            )}
          </div>
        )}
      </Link>

      <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
        <div className="flex items-center bg-secondary/60 rounded-full">
          <button onClick={() => vote("post", post.id, my === 1 ? 0 : 1)} className={`h-8 w-8 grid place-items-center rounded-full transition ${my === 1 ? "text-primary" : "hover:text-foreground"}`} aria-label="Upvote">
            <ArrowBigUp className="h-4 w-4" fill={my === 1 ? "currentColor" : "none"} />
          </button>
          <span className={`text-sm font-semibold tabular-nums w-8 text-center ${my === 1 ? "text-primary" : my === -1 ? "text-destructive" : "text-foreground"}`}>{score}</span>
          <button onClick={() => vote("post", post.id, my === -1 ? 0 : -1)} className={`h-8 w-8 grid place-items-center rounded-full transition ${my === -1 ? "text-destructive" : "hover:text-foreground"}`} aria-label="Downvote">
            <ArrowBigDown className="h-4 w-4" fill={my === -1 ? "currentColor" : "none"} />
          </button>
        </div>
        <Link to="/post/$id" params={{ id: post.id }} className="flex items-center gap-1.5 px-3 h-8 rounded-full hover:bg-secondary transition">
          <MessageSquare className="h-4 w-4" /> {commentsCount}
        </Link>
        <button onClick={() => toggleSave(post.id)} className={`flex items-center gap-1.5 px-3 h-8 rounded-full hover:bg-secondary transition ${saved ? "text-primary" : ""}`}>
          <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} /> <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
        </button>
        <button onClick={share} className="flex items-center gap-1.5 px-3 h-8 rounded-full hover:bg-secondary transition" aria-label="Share">
          {copied ? <Check className="h-4 w-4 text-primary" /> : <Share2 className="h-4 w-4" />}
          <span className="hidden sm:inline">{copied ? "Copied" : "Share"}</span>
        </button>
        {me && (
          <button onClick={() => toggleHidePost(post.id)} className="flex items-center gap-1.5 px-3 h-8 rounded-full hover:bg-secondary transition" aria-label="Hide">
            <EyeOff className="h-4 w-4" /> <span className="hidden sm:inline">Hide</span>
          </button>
        )}
        <button onClick={() => { reportItem("post", post.id, "User report"); }} className="ml-auto flex items-center gap-1.5 px-3 h-8 rounded-full hover:bg-secondary transition" aria-label="Report">
          <Flag className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
