'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';
import { supabase, type User } from '@/lib/supabase';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const priorityConfig = {
  P0: { label: 'P0 - Critical', color: 'bg-red-100 text-red-700 border-red-200' },
  P1: { label: 'P1 - High', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  P2: { label: 'P2 - Medium', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  P3: { label: 'P3 - Low', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

interface SearchFiltersProps {
  onFilterChange: (filters: {
    search: string;
    assignee: string;
    priority: string;
  }) => void;
}

export function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [assignee, setAssignee] = useState(searchParams.get('assignee') || 'all');
  const [priority, setPriority] = useState(searchParams.get('priority') || 'all');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (assignee !== 'all') params.set('assignee', assignee);
    if (priority !== 'all') params.set('priority', priority);

    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.push(newUrl, { scroll: false });

    onFilterChange({ search, assignee, priority });
  }, [search, assignee, priority]);

  async function loadUsers() {
    const { data } = await supabase.from('users').select('*').order('name');
    if (data) setUsers(data);
  }

  function clearFilters() {
    setSearch('');
    setAssignee('all');
    setPriority('all');
  }

  const hasActiveFilters = search || assignee !== 'all' || priority !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="relative flex-1 min-w-[250px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search cards by title or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={assignee} onValueChange={setAssignee}>
        <SelectTrigger className="w-[180px]">
          <SelectValue>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {assignee === 'all' ? (
                'All Assignees'
              ) : (
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs">
                      {users.find((u) => u.id === assignee)?.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <span>{users.find((u) => u.id === assignee)?.name}</span>
                </div>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Assignees</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs">{user.avatar}</AvatarFallback>
                </Avatar>
                <span>{user.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={priority} onValueChange={setPriority}>
        <SelectTrigger className="w-[180px]">
          <SelectValue>
            {priority === 'all' ? (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                All Priorities
              </div>
            ) : (
              <Badge
                variant="outline"
                className={cn('text-xs', priorityConfig[priority as keyof typeof priorityConfig].color)}
              >
                {priorityConfig[priority as keyof typeof priorityConfig].label}
              </Badge>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          {Object.entries(priorityConfig).map(([key, config]) => (
            <SelectItem key={key} value={key}>
              <Badge variant="outline" className={cn('text-xs', config.color)}>
                {config.label}
              </Badge>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
