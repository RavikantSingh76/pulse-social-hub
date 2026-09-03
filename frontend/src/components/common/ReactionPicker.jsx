import React, { useState } from 'react';
import { Heart, ThumbsUp, Smile, Sparkles } from 'lucide-react';

const REACTIONS = [
  { type: 'LIKE', emoji: '👍', label: 'Like', color: 'text-blue-500' },
  { type: 'LOVE', emoji: '❤️', label: 'Love', color: 'text-rose-500' },
  { type: 'HAHA', emoji: '😂', label: 'Haha', color: 'text-amber-500' },
  { type: 'WOW', emoji: '😮', label: 'Wow', color: 'text-amber-400' },
  { type: 'SAD', emoji: '😢', label: 'Sad', color: 'text-yellow-500' },
  { type: 'ANGRY', emoji: '😡', label: 'Angry', color: 'text-red-600' },
];

export default function ReactionPicker({ currentReaction, onSelectReaction, onToggleLike, likesCount = 0 }) {
  const [showPicker, setShowPicker] = useState(false);
  let hoverTimeout;

  const handleMouseEnter = () => {
    hoverTimeout = setTimeout(() => setShowPicker(true), 300);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout);
    setShowPicker(false);
  };

  const activeReaction = REACTIONS.find((r) => r.type === currentReaction);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Floating Reaction Bar */}
      {showPicker && (
        <div className="absolute bottom-full left-0 mb-2 flex items-center gap-1.5 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-2xl border border-slate-700/50 z-50 animate-bounce-short">
          {REACTIONS.map((r) => (
            <button
              key={r.type}
              type="button"
              onClick={() => {
                onSelectReaction(r.type);
                setShowPicker(false);
              }}
              className="text-2xl hover:scale-135 transition-transform duration-150 p-1 hover:-translate-y-1"
              title={r.label}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => {
          if (currentReaction) {
            onSelectReaction(currentReaction); // toggle off
          } else {
            onToggleLike ? onToggleLike() : onSelectReaction('LIKE');
          }
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
          activeReaction
            ? `${activeReaction.color} bg-rose-500/10 font-semibold`
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        {activeReaction ? (
          <>
            <span className="text-base">{activeReaction.emoji}</span>
            <span>{activeReaction.label}</span>
          </>
        ) : (
          <>
            <Heart className="w-5 h-5" />
            <span>Like</span>
          </>
        )}
        {likesCount > 0 && <span className="text-xs font-normal">({likesCount})</span>}
      </button>
    </div>
  );
}
