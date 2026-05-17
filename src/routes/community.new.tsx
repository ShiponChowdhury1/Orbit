import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/community/new")({
  component: NewCommunity,
});

const palette = ["#a3e635", "#a78bfa", "#fb7185", "#22d3ee", "#fbbf24", "#f472b6"];
const icons = ["🚀", "🧠", "🎨", "📚", "🌌", "⚡", "🔥", "🛠️", "🎮"];

function NewCommunity() {
  const nav = useNavigate();
  const create = useAppStore((s) => s.createCommunity);
  const me = useAppStore((s) => s.currentUserId);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🚀");
  const [color, setColor] = useState(palette[0]);
  const [nsfw, setNsfw] = useState(false);

  if (!me) return <div className="glass rounded-2xl p-8">Sign in to create a community.</div>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !title.trim()) return;
    const c = create({ name, title, description, icon, color, nsfw });
    nav({ to: "/c/$name", params: { name: c.name } });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display font-bold text-2xl mb-4">Create a community</h1>
      <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Slug</label>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-muted-foreground">o/</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="design" className="flex-1 h-11 px-3 rounded-xl bg-secondary border border-border" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Design Systems" className="mt-1 w-full h-11 px-3 rounded-xl bg-secondary border border-border" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this community about?" rows={3} className="mt-1 w-full p-3 rounded-xl bg-secondary border border-border" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Icon</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {icons.map((i) => (
                <button type="button" key={i} onClick={() => setIcon(i)} className={`h-10 w-10 rounded-lg text-xl ${icon === i ? "bg-primary/20 ring-2 ring-primary" : "bg-secondary"}`}>{i}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Color</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {palette.map((p) => (
                <button type="button" key={p} onClick={() => setColor(p)} className={`h-10 w-10 rounded-lg ${color === p ? "ring-2 ring-foreground" : ""}`} style={{ background: p }} />
              ))}
            </div>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={nsfw} onChange={(e) => setNsfw(e.target.checked)} /> Mark community as NSFW (18+)
        </label>
        <div className="flex gap-2">
          <button type="submit" className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-medium">Create community</button>
          <Link to="/explore" className="h-11 px-5 rounded-xl bg-secondary font-medium grid place-items-center">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
