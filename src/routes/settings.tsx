import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/settings" || location.pathname === "/settings/") {
      throw redirect({ to: "/settings/profile" });
    }
  },
  component: SettingsLayout,
});

function SettingsLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const tabs = [
    { to: "/settings/profile", label: "Profile" },
    { to: "/settings/password", label: "Password" },
  ] as const;
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="font-display font-bold text-2xl">Settings</h1>
      <div className="inline-flex p-1 rounded-xl glass">
        {tabs.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className={`px-4 h-9 grid place-items-center rounded-lg text-sm font-medium ${path === t.to ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
