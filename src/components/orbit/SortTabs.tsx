import type { SortKey } from "@/lib/selectors";
import { Flame, Clock, TrendingUp } from "lucide-react";

const items: { key: SortKey; label: string; icon: typeof Flame }[] = [
  { key: "hot", label: "Hot", icon: Flame },
  { key: "new", label: "New", icon: Clock },
  { key: "top", label: "Top", icon: TrendingUp },
];

export function SortTabs({ value, onChange }: { value: SortKey; onChange: (k: SortKey) => void }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl glass">
      {items.map((it) => {
        const active = it.key === value;
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className={`px-3 h-8 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <it.icon className="h-3.5 w-3.5" /> {it.label}
          </button>
        );
      })}
    </div>
  );
}
