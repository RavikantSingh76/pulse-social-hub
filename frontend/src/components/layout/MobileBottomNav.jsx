import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import {
  Home,
  Compass,
  Film,
  MessageCircle,
  PlusSquare,
  User,
  Sparkles
} from 'lucide-react';

export default function MobileBottomNav({ onOpenCreatePost }) {
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/explore', label: 'Explore', icon: Compass },
    { to: '/reels', label: 'Reels', icon: Film },
    { to: '/messages', label: 'Direct', icon: MessageCircle, badge: user?.unreadMessagesCount },
    { to: user ? `/profile/${user.username}` : '/login', label: 'Profile', icon: User, isProfile: true },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-lg select-none">
      {navItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-2 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            {item.isProfile && user ? (
              <Avatar src={user.avatarUrl} username={user.username} size="xs" />
            ) : (
              <Icon className="w-5 h-5" />
            )}
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.label}</span>

            {item.badge > 0 && (
              <span className="absolute top-1 right-2 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-sm">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </NavLink>
        );
      })}

      {/* Center Floating Create Trigger */}
      {isAuthenticated && (
        <button
          onClick={onOpenCreatePost}
          className="p-2.5 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white shadow-md shadow-primary-500/30 active:scale-95 transition-transform cursor-pointer"
          title="Create Post"
        >
          <PlusSquare className="w-5 h-5" />
        </button>
      )}
    </nav>
  );
}
