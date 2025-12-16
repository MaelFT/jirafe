'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { 
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove 
} from '@dnd-kit/sortable';
import { supabase, type BoardWithColumns, type CardWithDetails } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { BoardColumn } from './board-column';
import { TaskCard } from './task-card';
import { ListView } from './list-view';
import { CalendarView } from './calendar-view';
import { CardDetailModal } from './card-detail-modal';
import { SearchFilters } from './search-filters';
import { WelcomeScreen } from './welcome-screen';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

export function BoardView() {
  const { selectedBoardId, currentUser, viewMode } = useStore();
  const [board, setBoard] = useState<BoardWithColumns | null>(null);
  const [filteredBoard, setFilteredBoard] = useState<BoardWithColumns | null>(null);
  const [activeCard, setActiveCard] = useState<CardWithDetails | null>(null);
  const [activeColumn, setActiveColumn] = useState<any>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [newCardColumnId, setNewCardColumnId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [newColumnName, setNewColumnName] = useState('');
  const [filters, setFilters] = useState({ search: '', assignee: 'all', priority: 'all' });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const loadBoard = useCallback(async () => {
    if (!selectedBoardId) return;

    const { data: boardData } = await supabase
      .from('boards')
      .select('*')
      .eq('id', selectedBoardId)
      .single();

    if (!boardData) return;

    const { data: columns } = await supabase
      .from('columns')
      .select('*')
      .eq('board_id', selectedBoardId)
      .order('position');

    if (!columns) return;

    const columnsWithCards = await Promise.all(
      columns.map(async (column) => {
        const { data: cards } = await supabase
          .from('cards')
          .select('*')
          .eq('column_id', column.id)
          .order('position');

        if (!cards) return { ...column, cards: [] };

        const cardsWithDetails = await Promise.all(
          cards.map(async (card) => {
            const { data: assignee } = card.assignee_id
              ? await supabase
                  .from('users')
                  .select('*')
                  .eq('id', card.assignee_id)
                  .maybeSingle()
              : { data: null };

            const { data: comments } = await supabase
              .from('comments')
              .select('*, author:users!comments_author_id_fkey(*)')
              .eq('card_id', card.id);

            const { data: cardTags } = await supabase
              .from('card_tags')
              .select('tag_id')
              .eq('card_id', card.id);

            const tagIds = cardTags?.map(ct => ct.tag_id) || [];
            const { data: tags } = tagIds.length > 0
              ? await supabase.from('tags').select('*').in('id', tagIds)
              : { data: [] };

            const { data: subtasks } = await supabase
              .from('subtasks')
              .select('*')
              .eq('card_id', card.id)
              .order('position');

            return { ...card, assignee, comments: comments || [], tags: tags || [], subtasks: subtasks || [] };
          })
        );

        return { ...column, cards: cardsWithDetails };
      })
    );

    setBoard({ ...boardData, columns: columnsWithCards });
  }, [selectedBoardId]);

  const applyFilters = useCallback(() => {
    if (!board) return;

    const filtered = {
      ...board,
      columns: board.columns.map((column) => ({
        ...column,
        cards: column.cards.filter((card) => {
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchesTitle = card.title.toLowerCase().includes(searchLower);
            const matchesId = card.id.toLowerCase().includes(searchLower);
            if (!matchesTitle && !matchesId) return false;
          }

          if (filters.assignee !== 'all' && card.assignee_id !== filters.assignee) {
            return false;
          }

          if (filters.priority !== 'all' && card.priority !== filters.priority) {
            return false;
          }

          return true;
        }),
      })),
    };

    setFilteredBoard(filtered);
  }, [board, filters]);

  useEffect(() => {
    if (selectedBoardId) {
      loadBoard();
    }
  }, [selectedBoardId, loadBoard]);

  useEffect(() => {
    if (board) {
      applyFilters();
    }
  }, [board, filters, applyFilters]);

  async function updateColumnName(columnId: string, name: string) {
    await supabase
      .from('columns')
      .update({ name })
      .eq('id', columnId);
    await loadBoard();
  }

  function handleDragStart(event: DragStartEvent) {
    const activeId = event.active.id as string;
    
    const column = board?.columns.find((col) => col.id === activeId);
    if (column) {
      setActiveColumn(column);
      return;
    }
    
    const card = board?.columns
      .flatMap((col) => col.cards)
      .find((c) => c.id === activeId);
    setActiveCard(card || null);
  }

  function handleDragOver(event: DragOverEvent) {
    if (!event.over || !board) return;

    const { active, over } = event;
    const activeId = active.id as string;
    const overId = over.id as string;

    const isActiveAColumn = active.data.current?.type === 'column';
    const isOverAColumn = over.data.current?.type === 'column';
    
    if (isActiveAColumn || isOverAColumn) return;

    const activeCardColumn = board.columns.find((col) =>
      col.cards.some((card) => card.id === activeId)
    );
    const overColumn =
      board.columns.find((col) => col.id === overId) ||
      board.columns.find((col) => col.cards.some((card) => card.id === overId));

    if (!activeCardColumn || !overColumn || activeCardColumn.id === overColumn.id) return;

    const activeCards = [...activeCardColumn.cards];
    const overCards = [...overColumn.cards];
    const activeIndex = activeCards.findIndex((c) => c.id === activeId);
    const overIndex = overId === overColumn.id
      ? overCards.length
      : overCards.findIndex((c) => c.id === overId);

    const [movedCard] = activeCards.splice(activeIndex, 1);
    overCards.splice(overIndex, 0, { ...movedCard, column_id: overColumn.id });

    setBoard({
      ...board,
      columns: board.columns.map((col) => {
        if (col.id === activeCardColumn.id) return { ...col, cards: activeCards };
        if (col.id === overColumn.id) return { ...col, cards: overCards };
        return col;
      }),
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);
    setActiveColumn(null);
    
    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === 'column';
    const isOverAColumn = over.data.current?.type === 'column';

    if (isActiveAColumn && isOverAColumn) {
      const activeColIndex = board.columns.findIndex((col) => col.id === activeId);
      const overColIndex = board.columns.findIndex((col) => col.id === overId);
      
      if (activeColIndex !== -1 && overColIndex !== -1 && activeColIndex !== overColIndex) {
        const newColumns = arrayMove(board.columns, activeColIndex, overColIndex);
        
        setBoard({
          ...board,
          columns: newColumns,
        });
        
        await Promise.all(
          newColumns.map((col, index) =>
            supabase.from('columns').update({ position: index }).eq('id', col.id)
          )
        );
      }
      return;
    }

    const activeCardColumn = board.columns.find((col) =>
      col.cards.some((card) => card.id === activeId)
    );
    const overColumn =
      board.columns.find((col) => col.id === overId) ||
      board.columns.find((col) => col.cards.some((card) => card.id === overId));

    if (!activeCardColumn || !overColumn) return;

    const activeIndex = activeCardColumn.cards.findIndex((c) => c.id === activeId);

    if (activeCardColumn.id === overColumn.id) {
      const overIndex = activeCardColumn.cards.findIndex((c) => c.id === overId);
      if (activeIndex === overIndex) return;

      const newCards = arrayMove(activeCardColumn.cards, activeIndex, overIndex);
      await Promise.all(
        newCards.map((card, index) =>
          supabase.from('cards').update({ position: index }).eq('id', card.id)
        )
      );
    } else {
      const overIndex = overId === overColumn.id
        ? overColumn.cards.length
        : overColumn.cards.findIndex((c) => c.id === overId);

      await supabase
        .from('cards')
        .update({ column_id: overColumn.id, position: overIndex })
        .eq('id', activeId);

      if (currentUser) {
        await supabase.from('card_activities').insert({
          card_id: activeId,
          user_id: currentUser.id,
          action_type: 'moved',
          old_value: activeCardColumn.name,
          new_value: overColumn.name,
        });
      }

      const updatedOverCards = [...overColumn.cards];
      updatedOverCards.splice(overIndex, 0, activeCardColumn.cards[activeIndex]);
      
      await Promise.all(
        updatedOverCards.map((card, index) =>
          supabase.from('cards').update({ position: index }).eq('id', card.id)
        )
      );
    }

    await loadBoard();
  }

  async function createCard() {
    if (!newCardColumnId || !newCardTitle.trim() || !currentUser) return;

    const { data: column } = await supabase
      .from('columns')
      .select('cards:cards(position)')
      .eq('id', newCardColumnId)
      .single();

    const position = column?.cards?.length || 0;

    const { data: newCard } = await supabase.from('cards').insert({
      column_id: newCardColumnId,
      title: newCardTitle,
      description: newCardDescription,
      assignee_id: currentUser.id,
      priority: 'P3',
      position,
    }).select().single();

    if (newCard) {
      await supabase.from('card_activities').insert({
        card_id: newCard.id,
        user_id: currentUser.id,
        action_type: 'created',
      });
    }

    setNewCardTitle('');
    setNewCardDescription('');
    setNewCardColumnId(null);
    setIsCreatingCard(false);
    loadBoard();
  }

  async function createColumn() {
    if (!selectedBoardId || !newColumnName.trim()) return;

    const position = board?.columns.length || 0;

    await supabase.from('columns').insert({
      board_id: selectedBoardId,
      name: newColumnName,
      position,
    });

    setNewColumnName('');
    setIsCreatingColumn(false);
    loadBoard();
  }

  if (!selectedBoardId) {
    return <WelcomeScreen />;
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <SearchFilters onFilterChange={setFilters} />

      {viewMode === 'list' ? (
        <ListView
          board={filteredBoard || board}
          onCardClick={setSelectedCardId}
        />
      ) : viewMode === 'calendar' ? (
        <CalendarView
          board={filteredBoard || board}
          onCardClick={setSelectedCardId}
        />
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={(filteredBoard || board).columns.map((col) => col.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex-1 overflow-x-auto p-6">
              <div className="flex gap-6 h-full min-w-max">
                {(filteredBoard || board).columns.map((column) => (
                  <div key={column.id} className="w-[350px]">
                    <BoardColumn
                      column={column}
                      onAddCard={() => {
                        setNewCardColumnId(column.id);
                        setIsCreatingCard(true);
                      }}
                      onCardClick={setSelectedCardId}
                      onUpdateColumnName={updateColumnName}
                    />
                  </div>
                ))}
                <div className="w-[350px]">
                  <Button
                    variant="outline"
                    className="w-full h-[100px] border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    onClick={() => setIsCreatingColumn(true)}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Column
                  </Button>
                </div>
              </div>
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={null}>
            {activeCard ? (
              <TaskCard card={activeCard} onClick={() => {}} />
            ) : activeColumn ? (
              <div className="w-[350px] opacity-80">
                <BoardColumn
                  column={activeColumn}
                  onAddCard={() => {}}
                  onCardClick={() => {}}
                  onUpdateColumnName={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <Dialog open={isCreatingCard} onOpenChange={setIsCreatingCard}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="new-card-title">Title *</Label>
              <Input
                id="new-card-title"
                placeholder="Card title"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCardTitle.trim()) createCard();
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-card-description">Description</Label>
              <Textarea
                id="new-card-description"
                placeholder="Card description (optional)"
                value={newCardDescription}
                onChange={(e) => setNewCardDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreatingCard(false);
                  setNewCardTitle('');
                  setNewCardDescription('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={createCard} disabled={!newCardTitle.trim()}>
                Create Card
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreatingColumn} onOpenChange={setIsCreatingColumn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Column</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="new-column-name">Column Name *</Label>
              <Input
                id="new-column-name"
                placeholder="e.g. In Review, Testing"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newColumnName.trim()) createColumn();
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreatingColumn(false);
                  setNewColumnName('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={createColumn} disabled={!newColumnName.trim()}>
                Create Column
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CardDetailModal
        cardId={selectedCardId}
        open={!!selectedCardId}
        onOpenChange={(open) => !open && setSelectedCardId(null)}
        onUpdate={loadBoard}
      />
    </div>
  );
}
