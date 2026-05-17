import { useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";

export function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const me = useAppStore((s) => s.currentUserId);
  const allNotifications = useAppStore((s) => s.notifications);
  const notifications = useMemo(
    () => allNotifications.filter((n) => n.userId === me),
    [allNotifications, me],
  );
  const markAllRead = useAppStore((s) => s.markAllRead);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="absolute right-0 mt-2 w-80 glass rounded-2xl p-2 shadow-xl z-50"
    >
      <div className="flex items-center justify-between px-3 py-2">
        <div className="font-semibold text-sm">Notifications</div>
        <button onClick={markAllRead} className="text-xs text-primary hover:underline">
          Mark all read
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto scrollbar-thin">
        {notifications.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <Bell className="h-6 w-6 opacity-50" /> No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <a
              key={n.id}
              href={n.link || "#"}
              onClick={onClose}
              className={`block px-3 py-2.5 rounded-xl hover:bg-secondary text-sm ${!n.read ? "bg-primary/5" : ""}`}
            >
              <div className="font-medium">{n.message}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(n.createdAt, { addSuffix: true })}
              </div>
            </a>
          ))
        )}
      </div>
    </motion.div>
  );
}
