import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAppStore } from "@/store/app-store";
import { Search, Sun, Moon, Plus, Bell, Compass, Home, Bookmark, Shield, Users, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationsPanel } from "./NotificationsPanel";
import { UserSwitcher } from "./UserSwitcher";

type MenuKey = null | "notif" | "user";

const AUTH_ROUTES = new Set(["/login", "/signup", "/forgot-password", "/reset-password"]);

export function AppShell() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const communities = useAppStore((s) => s.communities);
  const users = useAppStore((s) => s.users);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const allNotifications = useAppStore((s) => s.notifications);
  const me = useMemo(() => users.find((u) => u.id === currentUserId), [users, currentUserId]);
  const notifications = useMemo(
    () => allNotifications.filter((n) => n.userId === currentUserId && !n.read),
    [allNotifications, currentUserId],
  );

  const [q, setQ] = useState("");
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const [mobileSearch, setMobileSearch] = useState(false);
  const nav = useNavigate();
  const route = useRouterState({ select: (s) => s.location.pathname });
  const menuRef = useRef<HTMLDivElement | null>(null);
  const isAuthRoute = AUTH_ROUTES.has(route);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Close any open menu when route changes
  useEffect(() => {
    setOpenMenu(null);
    setMobileSearch(false);
  }, [route]);

  // Close on outside click
  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openMenu]);

  const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/explore", label: "Explore", icon: Compass },
    { to: "/saved", label: "Saved", icon: Bookmark },
    { to: "/moderation", label: "Mod", icon: Shield },
  ];

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      nav({ to: "/search", search: { q: q.trim() } as never });
      setMobileSearch(false);
    }
  };

  // Minimal auth layout: just logo + theme toggle, no sidebar / bottom nav.
  if (isAuthRoute) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-40 glass">
          <div className="mx-auto max-w-[1400px] px-3 sm:px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold font-display glow-primary">O</div>
              <span className="font-display font-bold text-lg tracking-tight">orbit</span>
            </Link>
            <button
              onClick={toggleTheme}
              className="h-10 w-10 grid place-items-center rounded-xl hover:bg-secondary transition"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-[1400px] px-3 sm:px-4 py-10">
          <motion.div key={route} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Topbar */}
      <header className="sticky top-0 z-40 glass">
        <div className="mx-auto max-w-[1400px] px-3 sm:px-4 h-16 flex items-center justify-between gap-2 sm:gap-4">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold font-display glow-primary">O</div>
            <span className="font-display font-bold text-lg tracking-tight hidden sm:block">orbit</span>
          </Link>

          {/* Desktop centered search */}
          <form onSubmit={onSearch} className="hidden lg:block flex-1 max-w-xl mx-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search posts, communities, people…"
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary/60 border border-border focus:outline-none focus:ring-2 focus:ring-ring/40 text-sm"
            />
          </form>

          <div className="flex items-center gap-1 shrink-0" ref={menuRef}>
            {/* Search trigger (tablet & mobile) */}
            <button
              onClick={() => setMobileSearch((v) => !v)}
              className="lg:hidden h-10 w-10 grid place-items-center rounded-xl hover:bg-secondary transition"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            <Link
              to="/submit"
              className="hidden sm:inline-flex items-center gap-1.5 h-10 px-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
            >
              <Plus className="h-4 w-4" /> Post
            </Link>
            <button
              onClick={toggleTheme}
              className="h-10 w-10 grid place-items-center rounded-xl hover:bg-secondary transition"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="relative">
              <button
                onClick={() => setOpenMenu((m) => (m === "notif" ? null : "notif"))}
                className="h-10 w-10 grid place-items-center rounded-xl hover:bg-secondary transition relative"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
              <AnimatePresence>
                {openMenu === "notif" && <NotificationsPanel onClose={() => setOpenMenu(null)} />}
              </AnimatePresence>
            </div>
            <UserSwitcher
              open={openMenu === "user"}
              onOpenChange={(v) => setOpenMenu(v ? "user" : null)}
            />
          </div>
        </div>

        {/* Mobile search expanded */}
        <AnimatePresence>
          {mobileSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-border overflow-hidden"
            >
              <form onSubmit={onSearch} className="px-3 py-2 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    autoFocus
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search…"
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary/60 border border-border focus:outline-none focus:ring-2 focus:ring-ring/40 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSearch(false)}
                  className="h-10 w-10 grid place-items-center rounded-xl hover:bg-secondary"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-[1400px] w-full px-3 sm:px-4 py-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 flex-1">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <nav className="glass rounded-2xl p-2">
              {navItems.map((n) => {
                const active = route === n.to;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-medium transition ${active ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                  >
                    <n.icon className="h-4 w-4" /> {n.label}
                  </Link>
                );
              })}
            </nav>

            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-sm flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Communities
                </h3>
                <Link to="/community/new" className="text-xs text-primary hover:underline">
                  New
                </Link>
              </div>
              <div className="space-y-1 max-h-[40vh] overflow-y-auto scrollbar-thin">
                {communities.map((c) => (
                  <Link
                    key={c.id}
                    to="/c/$name"
                    params={{ name: c.name }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary text-sm transition"
                  >
                    <span className="h-7 w-7 grid place-items-center rounded-lg shrink-0" style={{ background: c.color + "33" }}>
                      {c.icon}
                    </span>
                    <span className="font-medium truncate">o/{c.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground shrink-0">{c.members.length}</span>
                  </Link>
                ))}
              </div>
            </div>

            {me ? (
              <Link
                to="/u/$username"
                params={{ username: me.username }}
                className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-secondary/40 transition"
              >
                <span className="h-10 w-10 grid place-items-center rounded-xl bg-secondary text-xl shrink-0 overflow-hidden">
                  {me.avatar?.startsWith("data:") ? <img src={me.avatar} alt="" className="h-full w-full object-cover" /> : me.avatar}
                </span>
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">@{me.username}</div>
                  <div className="text-xs text-muted-foreground truncate">View profile</div>
                </div>
              </Link>
            ) : (
              <div className="glass rounded-2xl p-4 space-y-2">
                <div className="text-sm font-semibold">Welcome to Orbit</div>
                <p className="text-xs text-muted-foreground">Sign in to post, comment, and vote.</p>
                <div className="flex gap-2">
                  <Link to="/login" className="flex-1 h-9 grid place-items-center rounded-xl bg-primary text-primary-foreground text-sm font-medium">Sign in</Link>
                  <Link to="/signup" className="flex-1 h-9 grid place-items-center rounded-xl bg-secondary text-sm font-medium">Sign up</Link>
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="min-w-0">
          <motion.div key={route} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden sticky bottom-0 glass border-t border-border z-30">
        <div className="grid grid-cols-5 max-w-[1400px] mx-auto">
          {navItems.map((n) => {
            const active = route === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex flex-col items-center justify-center gap-1 h-14 text-[11px] font-medium transition ${active ? "text-primary" : "text-muted-foreground"}`}
              >
                <n.icon className="h-5 w-5" />
                {n.label}
              </Link>
            );
          })}
          <Link
            to="/submit"
            className={`flex flex-col items-center justify-center gap-1 h-14 text-[11px] font-medium ${route === "/submit" ? "text-primary" : "text-primary/80"}`}
          >
            <Plus className="h-5 w-5" /> Post
          </Link>
        </div>
      </nav>
    </div>
  );
}
