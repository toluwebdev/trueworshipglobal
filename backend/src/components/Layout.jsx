import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/blogs", label: "Blogs" },
  { to: "/events", label: "Events" },
  { to: "/comments", label: "Comments" },
  { to: "/mailing", label: "Mailing list" },
];

export default function Layout() {
  const { admin, logout } = useAuth();

  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-white/10 bg-neutral-950 md:w-56 md:shrink-0 md:border-b-0 md:border-r">
        <div className="px-6 py-6">
          <p className="text-xs tracking-[0.3em] text-white/50 uppercase">True Worship</p>
          <h1 className="mt-1 text-lg font-semibold tracking-wide">Admin</h1>
          {admin?.email && (
            <p className="mt-2 truncate text-xs text-white/50">{admin.email}</p>
          )}
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-4 md:flex-col md:px-3 md:pb-6">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-white text-black"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden px-3 pb-6 md:block">
          <button
            type="button"
            onClick={logout}
            className="w-full rounded border border-white/30 px-3 py-2 text-sm text-white/80 transition hover:border-white hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-4 md:hidden">
          <span className="text-sm font-medium">Admin</span>
          <button
            type="button"
            onClick={logout}
            className="text-xs tracking-wide text-white/60 uppercase"
          >
            Sign out
          </button>
        </header>
        <main className="flex-1 px-6 py-8 md:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
