"use client";

import { useUiStore } from "@/store/ui";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FolderKanban, Settings, UserCircle2 } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  const { isSidebarOpen, setSidebarOpen } = useUiStore();

  return (
    <aside
      className={`h-screen border-r border-slate-200 bg-white/80 backdrop-blur transition-all duration-300 ${
        isSidebarOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex h-full flex-col justify-between px-4 py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <FolderKanban className="h-6 w-6" />
              {isSidebarOpen && <span className="text-lg font-semibold">Thesis PM</span>}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Workspace</p>
            <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
              {isSidebarOpen ? "Default Workspace" : "DW"}
            </div>
          </div>
          <nav className="space-y-2">
            <Link className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100" href="/workspaces">
              <FolderKanban className="h-4 w-4" />
              {isSidebarOpen && "Projects"}
            </Link>
            <Link className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100" href="/settings/profile">
              <Settings className="h-4 w-4" />
              {isSidebarOpen && "Settings"}
            </Link>
          </nav>
        </div>
        <Link className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100" href="/settings/profile">
          <UserCircle2 className="h-5 w-5" />
          {isSidebarOpen && "Profile"}
        </Link>
      </div>
    </aside>
  );
}
