import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Workspace } from './types';

interface AppStore {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;
  selectedBoardId: string | null;
  setSelectedBoardId: (boardId: string | null) => void;
  viewMode: 'board' | 'list' | 'calendar';
  setViewMode: (mode: 'board' | 'list' | 'calendar') => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      currentWorkspace: null,
      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
      workspaces: [],
      setWorkspaces: (workspaces) => set({ workspaces }),
      selectedBoardId: null,
      setSelectedBoardId: (boardId) => set({ selectedBoardId: boardId }),
      viewMode: 'board',
      setViewMode: (mode) => set({ viewMode: mode }),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'jirafe-task-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
