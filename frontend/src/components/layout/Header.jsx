import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, MessageCircle } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { PulseLogo } from '../common/PulseLogo';

export const Header = () => {
  const { user } = useAuth();

  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800">
      <PulseLogo variant="full" size="sm" />

      <div className="flex items-center space-x-2">
        <ThemeToggle />
        <Link
          to="/notifications"
          className="relative p-2 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-xl"
        >
          <Bell className="w-5 h-5" />
          {user?.unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </Link>
        <Link
          to="/messages"
          className="relative p-2 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-xl"
        >
          <MessageCircle className="w-5 h-5" />
          {user?.unreadMessagesCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
          )}
        </Link>
      </div>
    </header>
  );
};
