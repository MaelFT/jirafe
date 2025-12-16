'use client';

import { type BoardWithColumns } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Calendar, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListViewProps {
  board: BoardWithColumns;
  onCardClick: (cardId: string) => void;
}

const priorityConfig = {
  P0: { label: 'P0', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900' },
  P1: { label: 'P1', color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-900' },
  P2: { label: 'P2', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900' },
  P3: { label: 'P3', color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
};

export function ListView({ board, onCardClick }: ListViewProps) {
  const allCards = board.columns.flatMap((column) =>
    column.cards.map((card) => ({ ...card, columnName: column.name }))
  );

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 dark:border-slate-700">
              <tr className="text-left bg-slate-50 dark:bg-slate-800/50">
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-center">
                  Subtasks
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-center">
                  Comments
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {allCards.map((card) => {
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
                  <tr
                    key={card.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors"
                    onClick={() => onCardClick(card.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-sm text-slate-900 dark:text-slate-100">
                          {card.title}
                        </span>
                        {card.description && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {card.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {card.columnName}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn('text-xs font-medium', priority.color)}
                      >
                        {priority.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
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
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {card.assignee && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {card.assignee.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {card.assignee.name}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {card.due_date && dueDateStatus && (
                        <Badge 
                          variant={dueDateStatus.color === 'destructive' ? 'destructive' : 'outline'}
                          className={cn(
                            'text-xs flex items-center gap-1',
                            dueDateStatus.color === 'warning' && 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-900'
                          )}
                        >
                          <Calendar className="h-3 w-3" />
                          {new Date(card.due_date).toLocaleDateString('fr-FR', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {subtasksTotal > 0 && (
                        <div className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <CheckSquare className="h-3 w-3" />
                          <span>{subtasksCompleted}/{subtasksTotal}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {commentCount > 0 && (
                        <div className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <MessageSquare className="h-3 w-3" />
                          <span>{commentCount}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {allCards.length === 0 && (
          <div className="flex items-center justify-center py-12 text-sm text-slate-400 dark:text-slate-500">
            No cards found
          </div>
        )}
      </div>
    </div>
  );
}
