import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Compass, PlusSquare, Tv, User } from 'lucide-react';
import { Avatar } from '../common/Avatar';

export const BottomNav = ({ onOpenCreatePost }) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-lg border-t border-gray-200 dark:border-zinc-800 px-6 py-2 flex items-center justify-between">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `p-2 rounded-xl transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-500 dark:text-zinc-400'}`
        }
      >
        <Home className="w-6 h-6" />
      </NavLink>

      <NavLink
        to="/explore"
        className={({ isActive }) =>
          `p-2 rounded-xl transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-500 dark:text-zinc-400'}`
        }
      >
        <Compass className="w-6 h-6" />
      </NavLink>

      <button
        onClick={onOpenCreatePost}
        className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-500 text-white shadow-md active:scale-95 transition-transform"
      >
        <PlusSquare className="w-6 h-6" />
      </button>

      <NavLink
        to="/watch"
        className={({ isActive }) =>
          `p-2 rounded-xl transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-500 dark:text-zinc-400'}`
        }
      >
        <Tv className="w-6 h-6" />
      </NavLink>

      <NavLink
        to={isAuthenticated && user ? `/profile/${user.username}` : '/login'}
        className={({ isActive }) =>
          `p-1.5 rounded-xl transition-colors ${isActive ? 'ring-2 ring-indigo-500 rounded-full' : ''}`
        }
      >
        {isAuthenticated && user ? (
          <Avatar src={user.avatarUrl} username={user.username} size="xs" />
        ) : (
          <User className="w-6 h-6 text-gray-500 dark:text-zinc-400" />
        )}
      </NavLink>
    </nav>
  );
};
