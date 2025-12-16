import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from './supabase';

interface AppStore {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  selectedBoardId: string | null;
  setSelectedBoardId: (boardId: string | null) => void;
  viewMode: 'board' | 'list' | 'calendar';
  setViewMode: (mode: 'board' | 'list' | 'calendar') => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      selectedBoardId: null,
      setSelectedBoardId: (boardId) => set({ selectedBoardId: boardId }),
      viewMode: 'board',
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: 'jirafe-task-storage',
    }
  )
);
