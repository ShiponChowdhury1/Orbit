import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useAppStore } from "@/store/app-store";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User as UserIcon, Settings, KeyRound, LogIn } from "lucide-react";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

export function UserSwitcher({ open, onOpenChange }: Props) {
  const users = useAppStore((s) => s.users);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const me = useMemo(() => users.find((u) => u.id === currentUserId), [users, currentUserId]);
  const logout = useAppStore((s) => s.logout);

  const close = () => onOpenChange(false);

  return (
    <div className="relative">
      <button
        onClick={() => onOpenChange(!open)}
        className="h-10 px-1 rounded-xl hover:bg-secondary transition flex items-center gap-2"
        aria-label="Account menu"
      >
        <span className="h-8 w-8 grid place-items-center rounded-lg bg-secondary text-base overflow-hidden">
          {me?.avatar?.startsWith("data:") ? (
            <img src={me.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            me?.avatar ?? "👤"
          )}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 mt-2 w-64 glass rounded-2xl p-2 shadow-xl z-50"
          >
            {me ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <span className="h-10 w-10 grid place-items-center rounded-xl bg-secondary text-xl overflow-hidden shrink-0">
                    {me.avatar?.startsWith("data:") ? <img src={me.avatar} alt="" className="h-full w-full object-cover" /> : me.avatar}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">@{me.username}</div>
                    {me.email && <div className="text-xs text-muted-foreground truncate">{me.email}</div>}
                  </div>
                </div>
                <div className="border-t border-border my-1" />
                <Link to="/u/$username" params={{ username: me.username }} onClick={close}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary text-sm">
                  <UserIcon className="h-4 w-4" /> Profile
                </Link>
                <Link to="/settings/profile" onClick={close}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary text-sm">
                  <Settings className="h-4 w-4" /> Edit profile
                </Link>
                <Link to="/settings/password" onClick={close}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary text-sm">
                  <KeyRound className="h-4 w-4" /> Change password
                </Link>
                <div className="border-t border-border my-1" />
                <button onClick={() => { logout(); close(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary text-sm text-muted-foreground">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <>
                <div className="px-3 py-2 text-xs text-muted-foreground">You're not signed in.</div>
                <Link to="/login" onClick={close}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary text-sm font-medium">
                  <LogIn className="h-4 w-4" /> Sign in
                </Link>
                <Link to="/signup" onClick={close}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary text-sm">
                  Create account
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
