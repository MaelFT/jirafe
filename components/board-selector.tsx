'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { supabase, type Board } from '@/lib/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Folder, Trash2, History } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function BoardSelector() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const { currentUser, selectedBoardId, setSelectedBoardId } = useStore();

  useEffect(() => {
    loadBoards();
  }, []);

  async function loadBoards() {
    const { data } = await supabase
      .from('boards')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setBoards(data);
      if (!selectedBoardId && data.length > 0) {
        setSelectedBoardId(data[0].id);
      }
    }
  }

  async function createBoard() {
    if (!newBoardName.trim() || !currentUser) return;

    const { data: board } = await supabase
      .from('boards')
      .insert({
        name: newBoardName,
        owner_id: currentUser.id,
      })
      .select()
      .single();

    if (board) {
      const defaultColumns = [
        { name: 'To Do', position: 0 },
        { name: 'In Progress', position: 1 },
        { name: 'Done', position: 2 },
      ];

      await supabase.from('columns').insert(
        defaultColumns.map((col) => ({
          board_id: board.id,
          name: col.name,
          position: col.position,
        }))
      );

      setBoards([board, ...boards]);
      setSelectedBoardId(board.id);
      setNewBoardName('');
      setIsCreating(false);
    }
  }

  async function deleteBoard(boardId: string) {
    await supabase.from('boards').delete().eq('id', boardId);
    
    const updatedBoards = boards.filter(b => b.id !== boardId);
    setBoards(updatedBoards);
    
    if (selectedBoardId === boardId) {
      setSelectedBoardId(updatedBoards.length > 0 ? updatedBoards[0].id : null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedBoardId || ''}
        onValueChange={setSelectedBoardId}
      >
        <SelectTrigger className="w-[250px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <SelectValue placeholder="Select a board">
            {selectedBoardId && (
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-slate-500" />
                <span className="font-medium">
                  {boards.find((b) => b.id === selectedBoardId)?.name}
                </span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {boards.map((board) => (
            <SelectItem key={board.id} value={board.id}>
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-slate-500" />
                <span>{board.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            New Board
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="board-name">Board Name</Label>
              <Input
                id="board-name"
                placeholder="My Project Board"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') createBoard();
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setNewBoardName('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={createBoard} disabled={!newBoardName.trim()}>
                Create Board
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="gap-2">
            <History className="h-4 w-4" />
            History
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Board History</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-4 max-h-[60vh] overflow-y-auto">
            {boards.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No boards found
              </div>
            ) : (
              boards.map((board) => (
                <div
                  key={board.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Folder className="h-5 w-5 text-slate-500" />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {board.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Created {new Date(board.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedBoardId(board.id);
                        setShowHistory(false);
                      }}
                      disabled={selectedBoardId === board.id}
                    >
                      {selectedBoardId === board.id ? 'Current' : 'Open'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => {
                        if (confirm(`Delete "${board.name}"? This action cannot be undone.`)) {
                          deleteBoard(board.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
