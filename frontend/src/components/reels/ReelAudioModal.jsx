import React from 'react';
import { X, Music2, Disc3, Sparkles, Volume2, Share2, Play } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReelAudioModal({ audioTrack, isOpen, onClose }) {
  if (!isOpen || !audioTrack) return null;

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

        {/* Audio Cover & Disc Artwork */}
        <div className="flex flex-col items-center text-center pt-2 space-y-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-600 p-1 shadow-2xl shadow-cyan-500/30 animate-spin-slow flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-white/50 flex items-center justify-center">
                <Music2 className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-cyan-500 text-slate-950 shadow-md">
              <Volume2 className="w-3.5 h-3.5" />
            </span>
          </div>

          <div>
            <h3 className="font-extrabold text-base text-white">{audioTrack.title || 'Original Audio'}</h3>
            <p className="text-xs text-cyan-400 font-semibold mt-0.5">{audioTrack.artist || 'Pulse Original Sound'}</p>
          </div>
        </div>

        {/* Audio Stats */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reels Using Audio</span>
            <p className="text-sm font-extrabold text-white mt-0.5">2.4k+</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Audio Bitrate</span>
            <p className="text-sm font-extrabold text-cyan-400 mt-0.5">320kbps HD</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              toast.success('Audio saved to your favorites! 🎵');
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 hover:opacity-95 transition-opacity cursor-pointer"
          >
            Use Audio in Create Reel
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Audio link copied!');
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            Copy Audio Link
          </button>
        </div>
      </div>
    </div>
  );
}
