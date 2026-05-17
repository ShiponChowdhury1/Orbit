import { useRef, useState } from "react";
import { Image as ImageIcon, Video, X, Upload } from "lucide-react";
import type { MediaType } from "@/lib/types";

type Props = {
  mediaUrl?: string;
  mediaType?: MediaType;
  onChange: (data: { mediaUrl?: string; mediaType?: MediaType }) => void;
};

const MAX_BYTES = 8 * 1024 * 1024; // 8MB cap for localStorage friendliness

export function MediaUploader({ mediaUrl, mediaType, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [urlMode, setUrlMode] = useState(false);
  const [urlVal, setUrlVal] = useState(mediaUrl ?? "");

  const onFile = (file: File) => {
    setError(null);
    if (file.size > MAX_BYTES) { setError(`File too large (max ${(MAX_BYTES / 1024 / 1024).toFixed(0)}MB).`); return; }
    const isImg = file.type.startsWith("image/");
    const isVid = file.type.startsWith("video/");
    if (!isImg && !isVid) { setError("Only image or video files are supported."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ mediaUrl: String(reader.result), mediaType: isImg ? "image" : "video" });
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      {mediaUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-border bg-secondary/40">
          {mediaType === "video" ? (
            <video src={mediaUrl} controls className="w-full max-h-80" />
          ) : (
            <img src={mediaUrl} alt="" className="w-full max-h-80 object-contain" />
          )}
          <button
            type="button"
            onClick={() => onChange({ mediaUrl: undefined, mediaType: undefined })}
            className="absolute top-2 right-2 h-8 w-8 grid place-items-center rounded-full bg-background/80 hover:bg-background"
            aria-label="Remove media"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => { fileRef.current?.click(); }}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 h-11 rounded-xl border border-dashed border-border bg-secondary/40 hover:bg-secondary text-sm font-medium"
          >
            <Upload className="h-4 w-4" /> Upload image or video
          </button>
          <button
            type="button"
            onClick={() => setUrlMode((v) => !v)}
            className="h-11 px-4 rounded-xl bg-secondary/60 text-sm font-medium hover:bg-secondary"
          >
            Or paste URL
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }}
          />
        </div>
      )}

      {urlMode && !mediaUrl && (
        <div className="flex gap-2">
          <input
            value={urlVal}
            onChange={(e) => setUrlVal(e.target.value)}
            placeholder="https://example.com/image.jpg or .mp4"
            className="flex-1 h-10 px-3 rounded-xl bg-secondary border border-border text-sm"
          />
          <button
            type="button"
            onClick={() => {
              if (!urlVal.trim()) return;
              const isVid = /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(urlVal);
              onChange({ mediaUrl: urlVal.trim(), mediaType: isVid ? "video" : "image" });
              setUrlMode(false);
            }}
            className="h-10 px-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
          >
            Add
          </button>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground flex items-center gap-3">
        <span className="inline-flex items-center gap-1"><ImageIcon className="h-3 w-3" /> JPG/PNG/GIF/WEBP</span>
        <span className="inline-flex items-center gap-1"><Video className="h-3 w-3" /> MP4/WEBM</span>
        <span>· up to 8MB</span>
      </p>
    </div>
  );
}
