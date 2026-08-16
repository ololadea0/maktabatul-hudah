import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Send,
  Settings,
  Tag,
  Upload,
  User,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice.js";
import {
  LIBRARY_LOGO_URL,
  LIBRARY_NAME,
  SUPPORT_EMAIL,
} from "../config/branding.js";

const navItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Books", to: "/admin/books", icon: Layers },
  { label: "Collections", to: "/admin/collections", icon: Layers },
  { label: "Categories", to: "/admin/categories", icon: Tag },
  { label: "Upload Book", to: "/admin/upload", icon: Upload },
  { label: "Newsletters", to: "/admin/newsletters", icon: Send },
  { label: "Subscribers", to: "/admin/subscribers", icon: Mail },
  { label: "Users", to: "/admin/users", icon: User },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

function Sidebar({ onNavigate }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const initial = user?.fullName?.charAt(0) || user?.email?.charAt(0) || "A";

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/auth");
  };

  return (
    <aside className="flex h-full w-52 flex-shrink-0 flex-col border-r border-white/10 bg-secondary">
      <div className="flex-shrink-0 border-b border-white/10 p-4">
        <div className="flex items-center gap-2">
          <img src={LIBRARY_LOGO_URL} alt={`${LIBRARY_NAME} logo`} className="h-9 w-9 rounded-lg object-contain" />
          <div>
            <p className="font-display text-xs font-bold leading-none text-white">{LIBRARY_NAME}</p>
            <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.08em] text-accent">
              Management Panel
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                isActive
                  ? "bg-primary font-semibold text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white",
              ].join(" ")
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex-shrink-0 space-y-0.5 border-t border-white/10 p-3">
        <div className="mb-1 flex items-center gap-2.5 px-3 py-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {initial.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-[11px] font-semibold text-white">
              {user?.fullName || "Admin User"}
            </p>
            <p className="truncate text-[9px] text-white/40">{user?.email || SUPPORT_EMAIL}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={15} />
          Browse Library
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-300/80 transition-colors hover:bg-red-500/10 hover:text-red-200"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const initial = user?.fullName?.charAt(0) || user?.email?.charAt(0) || "A";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative h-full">
            <Sidebar onNavigate={() => setIsOpen(false)} />
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setIsOpen(false)}
              className="absolute left-56 top-4 rounded-lg bg-white p-2 text-secondary shadow-sm"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : null}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setIsOpen(true)}
              className="rounded-lg p-1.5 text-gray-700 transition-colors hover:bg-gray-100 lg:hidden"
            >
              <Menu size={18} />
            </button>
            <div>
              <p className="font-display text-lg font-bold leading-none text-secondary">{LIBRARY_NAME} Admin</p>
              <p className="mt-1 text-[11px] text-gray-400">Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
            >
              <Bell size={17} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>
            <div className="flex items-center gap-2">
              <div className="hidden text-right sm:block">
                <p className="font-display text-xs font-semibold leading-none text-secondary">
                  {user?.fullName || "Admin User"}
                </p>
                <p className="mt-1 text-[10px] text-gray-400">Administrator</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
                {initial.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
