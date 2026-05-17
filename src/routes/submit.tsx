import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { RichTextEditor } from "@/components/orbit/RichTextEditor";
import { MediaUploader } from "@/components/orbit/MediaUploader";
import type { MediaType } from "@/lib/types";

const FLAIR_COLORS = ["#a3e635", "#22d3ee", "#fb7185", "#a78bfa", "#fbbf24", "#f472b6"];

export const Route = createFileRoute("/submit")({
  component: Submit,
});

function Submit() {
  const nav = useNavigate();
  const me = useAppStore((s) => s.currentUserId);
  const communities = useAppStore((s) => s.communities);
  const create = useAppStore((s) => s.createPost);

  const [communityId, setCommunityId] = useState(communities[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(undefined);
  const [mediaType, setMediaType] = useState<MediaType | undefined>(undefined);
  const [nsfw, setNsfw] = useState(false);
  const [spoiler, setSpoiler] = useState(false);
  const [flairLabel, setFlairLabel] = useState("");
  const [flairColor, setFlairColor] = useState(FLAIR_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  if (!me) {
    return (
      <div className="glass rounded-2xl p-8 text-center space-y-3">
        <p className="text-foreground">You need an account to post.</p>
        <div className="flex justify-center gap-2">
          <Link to="/login" className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium grid place-items-center">Sign in</Link>
          <Link to="/signup" className="h-10 px-4 rounded-xl bg-secondary text-sm font-medium grid place-items-center">Create account</Link>
        </div>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) { setError("Title is required."); return; }
    if (title.trim().length > 200) { setError("Title is too long (max 200)."); return; }
    if (!communityId) { setError("Pick a community."); return; }
    const flair = flairLabel.trim() ? { label: flairLabel.trim().slice(0, 24), color: flairColor } : undefined;
    const p = create({ communityId, title: title.trim(), body, mediaUrl, mediaType, nsfw, spoiler, flair });
    if (p) nav({ to: "/post/$id", params: { id: p.id } });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display font-bold text-2xl mb-4">Create a post</h1>
      <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-5">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Community</label>
          <select value={communityId} onChange={(e) => setCommunityId(e.target.value)} className="mt-1 w-full h-11 px-3 rounded-xl bg-secondary border border-border">
            {communities.map((c) => <option key={c.id} value={c.id}>o/{c.name} — {c.title}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="An interesting, descriptive title"
            maxLength={200}
            className="mt-1 w-full h-11 px-3 rounded-xl bg-secondary border border-border"
          />
          <div className="text-[11px] text-muted-foreground mt-1 text-right">{title.length}/200</div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Media (optional)</label>
          <div className="mt-1">
            <MediaUploader
              mediaUrl={mediaUrl}
              mediaType={mediaType}
              onChange={({ mediaUrl, mediaType }) => { setMediaUrl(mediaUrl); setMediaType(mediaType); }}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Body</label>
          <div className="mt-1">
            <RichTextEditor value={body} onChange={setBody} placeholder="Share your thoughts — use formatting, links, emojis…" minHeight={180} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Flair (optional)</label>
            <input value={flairLabel} onChange={(e) => setFlairLabel(e.target.value)} placeholder="e.g. Discussion" maxLength={24} className="mt-1 w-full h-11 px-3 rounded-xl bg-secondary border border-border" />
            <div className="flex gap-1 mt-2">
              {FLAIR_COLORS.map((c) => (
                <button type="button" key={c} onClick={() => setFlairColor(c)} className={`h-7 w-7 rounded-md ${flairColor === c ? "ring-2 ring-foreground" : ""}`} style={{ background: c }} />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Tags</label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={nsfw} onChange={(e) => setNsfw(e.target.checked)} /> Mark as NSFW
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={spoiler} onChange={(e) => setSpoiler(e.target.checked)} /> Mark as Spoiler
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          <button type="submit" className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-medium">Publish</button>
          <Link to="/" className="h-11 px-5 rounded-xl bg-secondary font-medium grid place-items-center">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
