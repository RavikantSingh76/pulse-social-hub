import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { ThemeToggle } from '../common/ThemeToggle';
import {
  Home,
  Compass,
  Film,
  Tv,
  Search,
  Bookmark,
  Settings,
  BarChart3,
  MessageCircle,
  Bell,
  PlusSquare,
  User,
  ShieldAlert,
  LogOut,
  Sparkles
} from 'lucide-react';

export const Sidebar = ({ onOpenCreatePost }) => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/explore', label: 'Explore', icon: Compass },
    { to: '/reels', label: 'Reels', icon: Film },
    { to: '/studio', label: 'Video Studio', icon: Sparkles, highlight: true },
    { to: '/watch', label: 'Watch', icon: Tv },
    { to: '/creator/studio', label: 'Creator Studio', icon: BarChart3 },
    { to: '/bookmarks', label: 'Saved', icon: Bookmark },
    { to: '/messages', label: 'Messages', icon: MessageCircle, badge: user?.unreadMessagesCount },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: user?.unreadNotificationsCount },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: user ? `/profile/${user.username}` : '/login', label: 'Profile', icon: User },
  ];

  if (isAdmin) {
    navItems.push({ to: '/admin', label: 'Admin Panel', icon: ShieldAlert, highlight: true });
  }

  return (
    <aside className="hidden md:flex flex-col justify-between w-64 h-screen sticky top-0 px-4 py-6 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 select-none z-20 overflow-y-auto scrollbar-none">
      <div className="space-y-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 px-3 py-2 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary-600 via-indigo-600 to-pink-500 bg-clip-text text-transparent">
              Pulse
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 -mt-1">
              Social Hub
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-bold shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                  } ${item.highlight ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white shadow-sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Create Post Button */}
        {isAuthenticated && (
          <button
            onClick={onOpenCreatePost}
            className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-semibold shadow-md shadow-primary-500/25 active:scale-[0.98] transition-all cursor-pointer text-xs"
          >
            <PlusSquare className="w-4 h-4" />
            <span>Create Post</span>
          </button>
        )}
      </div>

      {/* Footer / User Profile & Controls */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between px-2">
          <ThemeToggle />
          {isAuthenticated && (
            <button
              onClick={logout}
              title="Log out"
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>

        {isAuthenticated && user ? (
          <Link
            to={`/profile/${user.username}`}
            className="flex items-center space-x-3 p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <Avatar src={user.avatarUrl} username={user.username} size="md" isOnline={true} disableLink={true} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1">
                <span>{user.displayName}</span>
                {user.isVerified && <span className="text-primary-600 text-[10px]">✓</span>}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                @{user.username}
              </p>
            </div>
          </Link>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 rounded-xl bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
