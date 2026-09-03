import React from 'react';
import { X, Keyboard, Sparkles, Command } from 'lucide-react';

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause video preview' },
    { key: 'Ctrl + Z', desc: 'Undo last timeline edit' },
    { key: 'Ctrl + Y', desc: 'Redo timeline edit' },
    { key: 'S', desc: 'Split selected clip at playhead' },
    { key: 'Delete / Backspace', desc: 'Delete selected clip or text layer' },
    { key: 'Ctrl + S', desc: 'Save project to local storage' },
    { key: 'F', desc: 'Toggle Fullscreen preview' },
    { key: 'M', desc: 'Mute / Unmute audio' },
    { key: 'Arrow Left / Right', desc: 'Seek timeline by ±0.5 seconds' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-cyan-400" />
            <h3 className="font-extrabold text-base text-white">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
            >
              <span className="text-slate-300 font-medium">{s.desc}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-mono font-bold text-cyan-400 text-[11px] shadow-inner">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-white transition-colors cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
