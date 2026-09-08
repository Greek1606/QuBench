import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Home, Cpu, BarChart3 } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { to: "/overview", label: "Overview", icon: Home },
  { to: "/models", label: "QML Models", icon: Cpu },
  { to: "/benchmarks", label: "Benchmarks", icon: BarChart3 },
];

export default function Sidebar({ open, onClose }) {
  const handleNavClick = () => onClose?.();

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop overlay — mobile only */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-surface p-6 shadow-card transition-transform duration-300 ease-in-out",
          "lg:static lg:z-auto lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="mb-10">
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            BIO-Q LAB
          </h1>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-text-secondary">
            Quantum Research System
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-pill px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent-purple-soft text-accent-purple"
                    : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className="shrink-0"
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
