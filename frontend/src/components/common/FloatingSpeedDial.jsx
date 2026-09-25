import React, { useState } from 'react';
import { Plus, Edit3, Clapperboard, Sparkles, Image, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const FloatingSpeedDial = ({
  onOpenCreatePost,
  onOpenCreateReel,
  onOpenCreateStory
}) => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Background click overlay when open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Speed Dial Hub */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
        {/* Speed Dial Menu Items */}
        {isOpen && (
          <div className="flex flex-col items-end space-y-2.5 mb-1 animate-in slide-in-from-bottom-5 fade-in duration-200">
            {/* Story Button */}
            {onOpenCreateStory && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenCreateStory();
                }}
                className="flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-xs font-bold text-amber-500 cursor-pointer group"
              >
                <span className="text-slate-700 dark:text-slate-200 font-semibold group-hover:text-amber-500 transition-colors">
                  Add 24h Story
                </span>
                <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500">
                  <Sparkles className="w-4 h-4" />
                </div>
              </button>
            )}

            {/* Reel Button */}
            {onOpenCreateReel && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenCreateReel();
                }}
                className="flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-xs font-bold text-purple-500 cursor-pointer group"
              >
                <span className="text-slate-700 dark:text-slate-200 font-semibold group-hover:text-purple-500 transition-colors">
                  Create 20s Reel
                </span>
                <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-500">
                  <Clapperboard className="w-4 h-4" />
                </div>
              </button>
            )}

            {/* Post Button */}
            {onOpenCreatePost && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenCreatePost();
                }}
                className="flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-xs font-bold text-primary-500 cursor-pointer group"
              >
                <span className="text-slate-700 dark:text-slate-200 font-semibold group-hover:text-primary-500 transition-colors">
                  Create Post
                </span>
                <div className="p-1.5 rounded-xl bg-primary-500/10 text-primary-500">
                  <Edit3 className="w-4 h-4" />
                </div>
              </button>
            )}
          </div>
        )}

        {/* Main Floating Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all transform hover:scale-110 active:scale-95 cursor-pointer ${
            isOpen
              ? 'bg-slate-800 rotate-45 border border-slate-700 shadow-slate-900/50'
              : 'bg-gradient-to-tr from-primary-600 to-indigo-600 shadow-primary-500/30'
          }`}
          title={isOpen ? "Close Menu" : "Create New Content"}
        >
          <Plus className="w-6 h-6 transition-transform duration-300" />
        </button>
      </div>
    </>
  );
};

export default FloatingSpeedDial;
