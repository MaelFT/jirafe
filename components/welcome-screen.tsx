'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Layers3, Plus, Sparkles } from 'lucide-react';

export function WelcomeScreen() {
  const { currentUser, setSelectedBoardId } = useStore();
  const [isCreating, setIsCreating] = useState(false);

  async function createSampleBoard() {
    if (!currentUser || isCreating) return;
    setIsCreating(true);

    try {
      // Créer le board
      const boardResponse = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'My First Project',
          owner_id: currentUser.id,
        }),
      });
      const { data: board } = await boardResponse.json();

      if (board) {
        const columns = [
          { name: 'To Do', position: 0 },
          { name: 'In Progress', position: 1 },
          { name: 'Done', position: 2 },
        ];

        // Créer les colonnes
        const createdColumns = [];
        for (const col of columns) {
          const response = await fetch('/api/columns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              board_id: board.id,
              name: col.name,
              position: col.position,
            }),
          });
          const { data } = await response.json();
          if (data) createdColumns.push(data);
        }

        if (createdColumns.length > 0) {
          const todoColumn = createdColumns.find((c) => c.name === 'To Do');
          const inProgressColumn = createdColumns.find((c) => c.name === 'In Progress');
          const doneColumn = createdColumns.find((c) => c.name === 'Done');

          const sampleCards = [
            {
              column_id: todoColumn!.id,
              title: 'Design new landing page',
              description: 'Create mockups and design system for the new landing page',
              priority: 'P1',
              position: 0,
              assignee_id: currentUser.id,
            },
            {
              column_id: todoColumn!.id,
              title: 'Set up CI/CD pipeline',
              description: 'Configure GitHub Actions for automated testing and deployment',
              priority: 'P2',
              position: 1,
              assignee_id: currentUser.id,
            },
            {
              column_id: inProgressColumn!.id,
              title: 'Implement user authentication',
              description: 'Add login, registration, and password reset functionality',
              priority: 'P0',
              position: 0,
              assignee_id: currentUser.id,
            },
            {
              column_id: doneColumn!.id,
              title: 'Project setup and initialization',
              description: 'Initialize Next.js project with TypeScript and Tailwind CSS',
              priority: 'P3',
              position: 0,
              assignee_id: currentUser.id,
            },
          ];

          // Créer les cartes
          for (const card of sampleCards) {
            await fetch('/api/cards', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(card),
            });
          }
        }

        setSelectedBoardId(board.id);
      }
    } catch (error) {
      console.error('Error creating sample board:', error);
    }

    setIsCreating(false);
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-8 max-w-md p-8">
        <div className="flex justify-center">
          <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl">
            <Layers3 className="h-16 w-16 text-white" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Welcome to Jirafe
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Your beautiful, Jira-like task management system. Get started by creating
            your first board or let us create a sample project for you.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            size="lg"
            onClick={createSampleBoard}
            disabled={isCreating}
            className="w-full gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            <Sparkles className="h-5 w-5" />
            {isCreating ? 'Creating...' : 'Create Sample Project'}
          </Button>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Or click "New Board" in the header to start fresh
          </p>
        </div>
      </div>
    </div>
  );
}
