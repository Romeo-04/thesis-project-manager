import { create } from "zustand";
import type { Issue } from "@/lib/db/types";

type UiState = {
  isSidebarOpen: boolean;
  selectedIssue: Issue | null;
  setSidebarOpen: (open: boolean) => void;
  setSelectedIssue: (issue: Issue | null) => void;
};

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  selectedIssue: null,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setSelectedIssue: (issue) => set({ selectedIssue: issue })
}));
