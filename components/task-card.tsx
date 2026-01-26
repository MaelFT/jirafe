'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type CardWithDetails } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GripVertical, MessageSquare, Calendar, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  card: CardWithDetails;
  onClick: () => void;
}

const priorityConfig = {
  P0: { label: 'P0', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900' },
  P1: { label: 'P1', color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-900' },
  P2: { label: 'P2', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900' },
  P3: { label: 'P3', color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
};

export function TaskCard({ card, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = priorityConfig[card.priority];
  const commentCount = card.comments?.length || 0;
  const subtasksCompleted = card.subtasks?.filter(s => s.completed).length || 0;
  const subtasksTotal = card.subtasks?.length || 0;
  
  const getDueDateStatus = () => {
    if (!card.due_date) return null;
    const dueDate = new Date(card.due_date);
    const now = new Date();
    const diffMs = dueDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffMs < 0) return { label: 'Overdue', color: 'destructive' };
    if (diffHours < 24) return { label: 'Due Soon', color: 'warning' };
    return { label: 'Upcoming', color: 'default' };
  };

  const dueDateStatus = getDueDateStatus();

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={cn(
          'p-3 cursor-pointer hover:shadow-md transition-all bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
          isDragging && 'opacity-50 shadow-xl'
        )}
        onClick={onClick}
      >
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <button
              className="mt-0.5 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 line-clamp-2">
                {card.title}
              </h4>
              {card.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                  {card.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={cn('text-xs font-medium', priority.color)}
              >
                {priority.label}
              </Badge>
              {card.tags?.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
              {commentCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <MessageSquare className="h-3 w-3" />
                  <span>{commentCount}</span>
                </div>
              )}
              {subtasksTotal > 0 && (
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <CheckSquare className="h-3 w-3" />
                  <span>{subtasksCompleted}/{subtasksTotal}</span>
                </div>
              )}
              {card.due_date && dueDateStatus && (
                <Badge 
                  variant={dueDateStatus.color === 'destructive' ? 'destructive' : 'outline'}
                  className={cn(
                    'text-xs flex items-center gap-1',
                    dueDateStatus.color === 'warning' && 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-900'
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  {new Date(card.due_date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                </Badge>
              )}
            </div>
            {card.assignee && (
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-slate-100 dark:bg-slate-700">
                  {card.assignee.avatar}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
