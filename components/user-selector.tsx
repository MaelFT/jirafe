'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { supabase, type User } from '@/lib/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function UserSelector() {
  const [users, setUsers] = useState<User[]>([]);
  const { currentUser, setCurrentUser } = useStore();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('name');

    if (data) {
      setUsers(data);
      if (!currentUser && data.length > 0) {
        setCurrentUser(data[0]);
      }
    }
  }

  return (
    <Select
      value={currentUser?.id || ''}
      onValueChange={(userId) => {
        const user = users.find((u) => u.id === userId);
        if (user) setCurrentUser(user);
      }}
    >
      <SelectTrigger className="w-[200px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <SelectValue>
          {currentUser && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {currentUser.avatar}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{currentUser.name}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">{user.avatar}</AvatarFallback>
              </Avatar>
              <span>{user.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
