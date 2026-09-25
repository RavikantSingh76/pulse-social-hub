import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={theme === 'dark' ? 'Switch to Light Mode (Bright)' : 'Switch to Dark Mode'}
      className={`p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-600 hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
};

export const PostSkeleton = () => (
  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800/80 p-5 mb-4 shadow-sm animate-pulse">
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800" />
      <div className="space-y-2 flex-1">
        <div className="w-32 h-4 bg-gray-200 dark:bg-zinc-800 rounded" />
        <div className="w-20 h-3 bg-gray-200 dark:bg-zinc-800 rounded" />
      </div>
    </div>
    <div className="w-full h-64 bg-gray-200 dark:bg-zinc-800 rounded-xl mb-4" />
    <div className="space-y-2">
      <div className="w-full h-4 bg-gray-200 dark:bg-zinc-800 rounded" />
      <div className="w-2/3 h-4 bg-gray-200 dark:bg-zinc-800 rounded" />
    </div>
  </div>
);

export const UserSkeleton = () => (
  <div className="flex items-center justify-between py-3 animate-pulse">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800" />
      <div className="space-y-1.5">
        <div className="w-24 h-4 bg-gray-200 dark:bg-zinc-800 rounded" />
        <div className="w-16 h-3 bg-gray-200 dark:bg-zinc-800 rounded" />
      </div>
    </div>
    <div className="w-16 h-8 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
  </div>
);
