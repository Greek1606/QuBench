import { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      <main className="flex-1 overflow-y-auto">
        {/* Mobile header bar */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-100 bg-bg-base/80 px-4 py-3 backdrop-blur lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-bold text-text-primary">BIO-Q LAB</span>
        </div>

        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
