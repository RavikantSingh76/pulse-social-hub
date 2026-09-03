import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import {
  Home,
  Compass,
  Film,
  Plus,
  User,
  Sparkles
} from 'lucide-react';

export default function MobileBottomNav({ onOpenCreatePost }) {
  const { user, isAuthenticated } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/90 px-3 py-2 flex items-center justify-around shadow-2xl select-none">
      {/* 1. Home */}
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center p-1.5 rounded-2xl transition-all relative ${
            isActive
              ? 'text-cyan-400 font-bold scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]'
              : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-semibold">Home</span>
      </NavLink>

      {/* 2. Explore */}
      <NavLink
        to="/explore"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center p-1.5 rounded-2xl transition-all relative ${
            isActive
              ? 'text-cyan-400 font-bold scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]'
              : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-semibold">Explore</span>
      </NavLink>

      {/* 3. Center Create (+) Button */}
      <button
        onClick={onOpenCreatePost}
        className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-500 text-white shadow-lg shadow-cyan-500/25 active:scale-95 transition-transform cursor-pointer"
        title="Create New Post"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* 4. Reels */}
      <NavLink
        to="/reels"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center p-1.5 rounded-2xl transition-all relative ${
            isActive
              ? 'text-cyan-400 font-bold scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]'
              : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <Film className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-semibold">Reels</span>
      </NavLink>

      {/* 5. Profile */}
      <NavLink
        to={user ? `/profile/${user.username}` : '/login'}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center p-1.5 rounded-2xl transition-all relative ${
            isActive
              ? 'text-cyan-400 font-bold scale-110'
              : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        {user ? (
          <Avatar src={user.avatarUrl} username={user.username} size="xs" disableLink={true} className="border border-cyan-400/80" />
        ) : (
          <User className="w-5 h-5" />
        )}
        <span className="text-[10px] mt-0.5 font-semibold">{user ? 'Profile' : 'Log In'}</span>
      </NavLink>
    </nav>
  );
}
