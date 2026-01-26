'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { LogOut, User, Settings } from 'lucide-react';
import Link from 'next/link';

export function UserSelector() {
  const router = useRouter();
  const { currentUser, setCurrentUser } = useStore();

  useEffect(() => {
    loadCurrentUser();
  }, []);

  async function loadCurrentUser() {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const { user } = await response.json();
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  if (!currentUser) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="gap-2 px-3 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              {currentUser.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{currentUser.name}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {currentUser.email}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <div className="flex flex-col">
            <span className="text-sm">{currentUser.name}</span>
            <span className="text-xs text-slate-500">{currentUser.email}</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <Link href="/profile">
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            Manage Account
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
