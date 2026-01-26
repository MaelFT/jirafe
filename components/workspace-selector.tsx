'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Check, ChevronDown, Plus, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Workspace } from '@/lib/types';

export function WorkspaceSelector() {
  const router = useRouter();
  const { currentWorkspace, setCurrentWorkspace, workspaces, setWorkspaces, _hasHydrated } = useStore();
  const [loading, setLoading] = useState(true);

  // Attendre que le store soit hydraté depuis le localStorage avant de charger
  useEffect(() => {
    if (_hasHydrated) {
      loadWorkspaces();
    }
  }, [_hasHydrated]);

  async function loadWorkspaces() {
    // Récupérer le currentWorkspace APRÈS l'hydratation
    const { currentWorkspace: hydratedWorkspace } = useStore.getState();
    
    try {
      const response = await fetch('/api/workspaces');
      if (response.ok) {
        const { data } = await response.json();
        setWorkspaces(data);
        
        if (data.length > 0) {
          // Vérifier si le workspace persisté existe toujours
          const persistedWorkspace = hydratedWorkspace 
            ? data.find((w: Workspace) => w.id === hydratedWorkspace.id)
            : null;
          
          if (persistedWorkspace) {
            // Mettre à jour avec les données fraîches (compteurs, etc.)
            setCurrentWorkspace(persistedWorkspace);
          } else {
            // Si pas de workspace actif ou s'il n'existe plus, prendre le premier
            setCurrentWorkspace(data[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleWorkspaceChange(workspace: Workspace) {
    const { setSelectedBoardId } = useStore.getState();
    
    // Réinitialiser le board sélectionné car on change de workspace
    setSelectedBoardId(null);
    setCurrentWorkspace(workspace);
    
    // Recharger la page pour mettre à jour les boards
    router.refresh();
  }

  if (!_hasHydrated || loading || !currentWorkspace) {
    return (
      <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="gap-2 px-3 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-sm bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              {currentWorkspace.avatar}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm max-w-[150px] truncate">
            {currentWorkspace.name}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Your workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => handleWorkspaceChange(workspace)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-sm bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                {workspace.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{workspace.name}</div>
              <div className="text-xs text-slate-500">
                {(workspace as any).member_count || 0} member(s) · {(workspace as any).board_count || 0} board(s)
              </div>
            </div>
            {currentWorkspace.id === workspace.id && (
              <Check className="h-4 w-4 text-blue-600" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push('/workspace/new')}
          className="flex items-center gap-2 cursor-pointer text-blue-600"
        >
          <Plus className="h-4 w-4" />
          Create a workspace
        </DropdownMenuItem>
        {currentWorkspace && (
          <DropdownMenuItem
            onClick={() => router.push(`/workspace/${currentWorkspace.id}/settings`)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            Manage this space
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


