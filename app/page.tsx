'use client';

import { useStore } from '@/lib/store';
import { UserSelector } from '@/components/user-selector';
import { BoardSelector } from '@/components/board-selector';
import { BoardView } from '@/components/board-view';
import { Layers3, LayoutGrid, List, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { viewMode, setViewMode } = useStore();

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
              <Layers3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Jirafe
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Project Management Made Simple
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <Button
              variant={viewMode === 'board' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('board')}
              className="h-8"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Board
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8"
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="h-8"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </Button>
          </div>
          <BoardSelector />
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
          <UserSelector />
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <BoardView />
      </main>
    </div>
  );
}
