'use client';

import { useState } from 'react';
import { type BoardWithColumns } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  board: BoardWithColumns;
  onCardClick: (cardId: string) => void;
}

const priorityConfig = {
  P0: { label: 'P0', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900' },
  P1: { label: 'P1', color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-900' },
  P2: { label: 'P2', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900' },
  P3: { label: 'P3', color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
};

export function CalendarView({ board, onCardClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const allCards = board.columns.flatMap((column) =>
    column.cards.map((card) => ({ ...card, columnName: column.name }))
  ).filter(card => card.due_date);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getWeekDays = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const weekDay = new Date(monday);
      weekDay.setDate(monday.getDate() + i);
      days.push(weekDay);
    }
    
    return days;
  };

  const getCardsForDate = (date: Date) => {
    // Utiliser la date locale (pas UTC) pour éviter le décalage d'un jour
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    return allCards.filter(card => {
      if (!card.due_date) return false;
      const cardDate = new Date(card.due_date);
      const cardYear = cardDate.getFullYear();
      const cardMonth = String(cardDate.getMonth() + 1).padStart(2, '0');
      const cardDay = String(cardDate.getDate()).padStart(2, '0');
      const cardDateString = `${cardYear}-${cardMonth}-${cardDay}`;
      return cardDateString === dateString;
    });
  };

  const previousPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const nextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const days = viewMode === 'month' ? getDaysInMonth(currentDate) : getWeekDays(currentDate);
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {currentDate.toLocaleDateString('fr-FR', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={previousPeriod}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Aujourd'hui
                </Button>
                <Button variant="outline" size="sm" onClick={nextPeriod}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Mois
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Semaine
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase py-2"
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        <div className={cn(
          "grid grid-cols-7 gap-2 p-4",
          viewMode === 'month' ? "auto-rows-fr min-h-[600px]" : "auto-rows-fr min-h-[400px]"
        )}>
          {days.map((day, index) => {
            const cardsForDay = day ? getCardsForDate(day) : [];
            
            return (
              <div
                key={index}
                className={cn(
                  "border border-slate-200 dark:border-slate-700 rounded-lg p-2 min-h-[100px]",
                  !day && "bg-slate-50 dark:bg-slate-900/50",
                  isToday(day) && "ring-2 ring-blue-500",
                  isPast(day) && "bg-slate-50/50 dark:bg-slate-900/30"
                )}
              >
                {day && (
                  <>
                    <div className={cn(
                      "text-sm font-medium mb-2",
                      isToday(day) && "text-blue-600 dark:text-blue-400 font-bold",
                      isPast(day) && "text-slate-400 dark:text-slate-600"
                    )}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {cardsForDay.map((card) => {
                        const priority = priorityConfig[card.priority];
                        const isOverdue = new Date(card.due_date!) < new Date();
                        
                        return (
                          <div
                            key={card.id}
                            onClick={() => onCardClick(card.id)}
                            className={cn(
                              "p-2 rounded text-xs cursor-pointer hover:shadow-md transition-shadow",
                              "bg-white dark:bg-slate-800 border",
                              isOverdue 
                                ? "border-red-300 dark:border-red-900" 
                                : "border-slate-200 dark:border-slate-700"
                            )}
                          >
                            <div className="font-medium line-clamp-2 mb-1 text-slate-900 dark:text-slate-100">
                              {card.title}
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                              <Badge
                                variant="outline"
                                className={cn('text-xs', priority.color)}
                              >
                                {priority.label}
                              </Badge>
                              {isOverdue && (
                                <Badge variant="destructive" className="text-xs">
                                  En retard
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {allCards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-sm text-slate-400 dark:text-slate-500">
            <CalendarIcon className="h-12 w-12 mb-4 opacity-50" />
            <p>Aucune carte avec date d'échéance</p>
          </div>
        )}
      </div>
    </div>
  );
}
