'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { type ColumnWithCards } from '@/lib/supabase';
import { TaskCard } from './task-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Check, X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BoardColumnProps {
  column: ColumnWithCards;
  onAddCard: () => void;
  onCardClick: (cardId: string) => void;
  onUpdateColumnName: (columnId: string, name: string) => Promise<void>;
}

export function BoardColumn({ column, onAddCard, onCardClick, onUpdateColumnName }: BoardColumnProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(column.name);
  
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cardIds = column.cards.map((card) => card.id);

  const handleSaveName = async () => {
    if (editedName.trim() && editedName !== column.name) {
      await onUpdateColumnName(column.id, editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setEditedName(column.name);
    setIsEditingName(false);
  };

  return (
    <div 
      ref={setSortableRef} 
      style={style}
      className={cn(
        "flex flex-col h-full bg-slate-50 dark:bg-slate-800/50 rounded-lg transition-opacity relative",
        isDragging && "opacity-50 z-50"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
          >
            <GripVertical className="h-4 w-4 text-slate-400" />
          </button>
          {isEditingName ? (
            <div className="flex items-center gap-1 flex-1">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                className="h-8 text-sm"
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={handleSaveName}
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={handleCancelEdit}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {column.name}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => setIsEditingName(true)}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                {column.cards.length}
              </span>
            </>
          )}
        </div>
        {!isEditingName && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={onAddCard}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div
        ref={setDroppableRef}
        className={cn(
          'flex-1 p-3 space-y-2 overflow-y-auto min-h-[200px] transition-colors',
          isOver && 'bg-slate-100 dark:bg-slate-700/50'
        )}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <TaskCard
              key={card.id}
              card={card}
              onClick={() => onCardClick(card.id)}
            />
          ))}
        </SortableContext>
        {column.cards.length === 0 && !isOver && (
          <div className="flex items-center justify-center h-32 text-sm text-slate-400 dark:text-slate-500">
            No cards yet
          </div>
        )}
      </div>
    </div>
  );
}
