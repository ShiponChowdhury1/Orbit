import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { Upload } from "lucide-react";

export const Route = createFileRoute("/settings/profile")({
  component: ProfileSettings,
});

function ProfileSettings() {
  const users = useAppStore((s) => s.users);
  const me = useAppStore((s) => s.currentUserId);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const user = useMemo(() => users.find((u) => u.id === me), [users, me]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "🙂");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!me || !user) {
    return (
      <div className="glass rounded-2xl p-6 text-center space-y-3">
        <p>Sign in to edit your profile.</p>
        <Link
          to="/login"
          className="inline-grid place-items-center h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const onAvatarFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Avatar must be an image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Avatar must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(file);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const res = updateProfile({ username, bio, avatar });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={onSubmit} className="glass rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-2xl bg-secondary grid place-items-center text-4xl overflow-hidden">
          {avatar.startsWith("data:") ? (
            <img src={avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            avatar
          )}
        </div>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="h-9 px-3 rounded-xl bg-secondary text-sm flex items-center gap-1.5"
          >
            <Upload className="h-4 w-4" /> Upload image
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onAvatarFile(f);
              e.target.value = "";
            }}
          />
          <div className="flex items-center gap-2">
            <input
              value={avatar.startsWith("data:") ? "" : avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="…or emoji"
              maxLength={4}
              className="w-20 h-9 px-2 text-center rounded-xl bg-secondary border border-border text-lg"
            />
            <span className="text-xs text-muted-foreground">use an emoji or upload an image</span>
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="your_username"
          autoComplete="username"
          className="mt-1 w-full h-11 px-3 rounded-xl bg-secondary border border-border"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell people a bit about yourself…"
          rows={4}
          maxLength={300}
          className="mt-1 w-full p-3 rounded-xl bg-secondary border border-border"
        />
        <div className="text-[11px] text-muted-foreground mt-1 text-right">{bio.length}/300</div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {saved && <p className="text-sm text-primary">Profile updated.</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
        >
          Save changes
        </button>
        <Link
          to="/u/$username"
          params={{ username: user.username }}
          className="h-10 px-4 rounded-xl bg-secondary text-sm font-medium grid place-items-center"
        >
          View profile
        </Link>
      </div>
    </form>
  );
}
