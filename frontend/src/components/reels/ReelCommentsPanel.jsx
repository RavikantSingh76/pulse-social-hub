import React from 'react';
import { X, MessageCircle, Sparkles } from 'lucide-react';
import { CommentSection } from '../comment/CommentSection';

export default function ReelCommentsPanel({ reel, isOpen, onClose, onCommentCountChange }) {
  if (!isOpen || !reel) return null;

  const authorUsername = reel.username || reel.user?.username || reel.creatorUsername || 'creator';
  const authorDisplayName = reel.displayName || reel.user?.displayName || reel.creatorName || authorUsername;
  const authorAvatarUrl = reel.avatarUrl || reel.user?.avatarUrl || reel.creatorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${authorUsername}`;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:justify-end bg-black/70 backdrop-blur-sm animate-fade-in p-0 md:p-6"
    >
      {/* Container - Bottom Sheet on Mobile, Slide-Over Panel on Desktop */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full md:w-[420px] h-[75vh] md:h-[680px] bg-slate-900 border-t md:border border-slate-800 rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
      >
        {/* Top Header with Creator Card */}
        <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-cyan-400" />
              <h3 className="font-extrabold text-sm text-white">
                Comments <span className="text-slate-400 font-semibold text-xs">({reel.commentsCount || 0})</span>
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close Comments"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Reel author mini-badge */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800/60">
            <img
              src={authorAvatarUrl}
              alt={authorDisplayName}
              className="w-7 h-7 rounded-full object-cover border border-cyan-400/50"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-200 truncate">{authorDisplayName}</div>
              {reel.caption && (
                <div className="text-[11px] text-slate-400 truncate">{reel.caption}</div>
              )}
            </div>
          </div>
        </div>

        {/* Comment List Body */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-800">
          <CommentSection
            postId={reel.id}
            onCommentAdded={() => {
              if (onCommentCountChange) onCommentCountChange(reel.id, 1);
            }}
            onCommentDeleted={() => {
              if (onCommentCountChange) onCommentCountChange(reel.id, -1);
            }}
          />
        </div>
      </div>
    </div>
  );
}
