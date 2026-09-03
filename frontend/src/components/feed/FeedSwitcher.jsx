import React from 'react';
import { Sparkles, Users, Flame, Clock, Video, Image as ImageIcon } from 'lucide-react';

const FEEDS = [
  { id: 'FOR_YOU', label: 'For You', icon: Sparkles },
  { id: 'FOLLOWING', label: 'Following', icon: Users },
  { id: 'TRENDING', label: 'Trending', icon: Flame },
  { id: 'LATEST', label: 'Latest', icon: Clock },
  { id: 'VIDEOS', label: 'Videos', icon: Video },
  { id: 'PHOTOS', label: 'Photos', icon: ImageIcon },
];

export default function FeedSwitcher({ currentFeed, onSelectFeed }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-4">
      {FEEDS.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentFeed === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectFeed(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md shadow-primary-500/25 scale-[1.02]'
                : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-primary-500'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
