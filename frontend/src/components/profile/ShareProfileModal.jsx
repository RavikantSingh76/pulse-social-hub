import React, { useState } from 'react';
import { X, Copy, Check, Send, Share2, Sparkles, MessageCircle, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShareProfileModal({ isOpen, onClose, profile }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !profile) return null;

  const profileUrl = `${window.location.origin}/profile/${profile.username}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success('Profile link copied! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.displayName || profile.username} on Pulse`,
          text: `Check out ${profile.displayName || profile.username}'s profile on Pulse Social Hub!`,
          url: profileUrl
        });
      } catch (e) {}
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Card Preview */}
        <div className="flex flex-col items-center text-center pt-2 space-y-3">
          <div className="relative">
            <img
              src={profile.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
              alt={profile.displayName || profile.username}
              className="w-20 h-20 rounded-full border-2 border-cyan-400 object-cover shadow-xl shadow-cyan-500/20"
            />
            <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-cyan-500 text-slate-950 font-black text-xs">
              ✓
            </span>
          </div>

          <div>
            <h3 className="font-extrabold text-base text-white">{profile.displayName || profile.username}</h3>
            <p className="text-xs text-cyan-400 font-semibold">@{profile.username}</p>
          </div>
        </div>

        {/* Copy Link Input Bar */}
        <div className="flex items-center gap-2 p-2 bg-slate-950 rounded-2xl border border-slate-800">
          <input
            type="text"
            readOnly
            value={profileUrl}
            className="flex-1 bg-transparent text-xs text-slate-300 px-2 outline-none font-mono truncate"
          />
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            title="Copy link"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Action Share Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleNativeShare}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
