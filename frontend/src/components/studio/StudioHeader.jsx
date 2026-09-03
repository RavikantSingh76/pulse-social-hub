import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Download,
  Save,
  Undo2,
  Redo2,
  Sparkles,
  HelpCircle,
  Smartphone,
  Square,
  Monitor,
  Check,
  Zap,
  Flame,
  Music2,
  Play
} from 'lucide-react';
import { soundFx } from '../../utils/audioEffects';
import toast from 'react-hot-toast';

export default function StudioHeader({
  projectName,
  onRenameProject,
  aspectRatio,
  onChangeAspectRatio,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onOpenExport,
  onOpenShortcuts,
  beatSyncEnabled,
  onToggleBeatSync
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(projectName);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onRenameProject(nameInput.trim());
      setIsEditingName(false);
      toast.success('Project renamed');
    }
  };

  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Back to Dashboard & Project Title */}
      <div className="flex items-center space-x-3 min-w-0">
        <Link
          to="/studio"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors flex items-center gap-1 text-xs font-bold"
          title="Back to Studio Dashboard"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        <div className="h-4 w-px bg-slate-800" />

        {isEditingName ? (
          <form onSubmit={handleNameSubmit} className="flex items-center gap-1">
            <input
              type="text"
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameSubmit}
              className="bg-slate-900 border border-cyan-500 rounded-lg px-2 py-1 text-xs font-bold text-white outline-none"
            />
          </form>
        ) : (
          <button
            onClick={() => {
              setNameInput(projectName);
              setIsEditingName(true);
            }}
            className="text-xs font-black text-white hover:text-cyan-400 truncate max-w-[200px] sm:max-w-xs transition-colors flex items-center gap-1.5 cursor-pointer text-left"
            title="Click to rename project"
          >
            <span>{projectName}</span>
            <span className="text-[10px] text-slate-500 hover:text-slate-300">✏️</span>
          </button>
        )}
      </div>

      {/* Center: Undo/Redo & Aspect Ratio Switcher */}
      <div className="hidden md:flex items-center space-x-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-900 rounded-xl p-0.5 border border-slate-800">
          <button
            onClick={() => {
              soundFx.playSwipeTick();
              onUndo();
            }}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              soundFx.playSwipeTick();
              onRedo();
            }}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="flex items-center bg-slate-900 rounded-xl p-0.5 border border-slate-800 text-xs">
          <button
            onClick={() => {
              soundFx.playSwipeTick();
              onChangeAspectRatio('9:16');
            }}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              aspectRatio === '9:16'
                ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="9:16 Reel / TikTok"
          >
            <Smartphone className="w-3 h-3" />
            <span>9:16</span>
          </button>

          <button
            onClick={() => {
              soundFx.playSwipeTick();
              onChangeAspectRatio('1:1');
            }}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              aspectRatio === '1:1'
                ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="1:1 Square Post"
          >
            <Square className="w-3 h-3" />
            <span>1:1</span>
          </button>

          <button
            onClick={() => {
              soundFx.playSwipeTick();
              onChangeAspectRatio('16:9');
            }}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              aspectRatio === '16:9'
                ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="16:9 Landscape"
          >
            <Monitor className="w-3 h-3" />
            <span>16:9</span>
          </button>
        </div>

        {/* Beat Sync Toggle */}
        <button
          onClick={() => {
            soundFx.playChimeCTA();
            onToggleBeatSync();
          }}
          className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer ${
            beatSyncEnabled
              ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/50 shadow-sm shadow-fuchsia-500/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
          title="Align cuts & transitions to detected music beats"
        >
          <Music2 className={`w-3.5 h-3.5 ${beatSyncEnabled ? 'text-fuchsia-400 animate-pulse' : ''}`} />
          <span>Beat Sync</span>
        </button>
      </div>

      {/* Right: Save, Help & Export CTA */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenShortcuts}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
          title="Keyboard Shortcuts & Help (?)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            soundFx.playReactionBubble();
            onSave();
          }}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Save Project (Ctrl+S)"
        >
          <Save className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Save</span>
        </button>

        <button
          onClick={() => {
            soundFx.playChimeCTA();
            onOpenExport();
          }}
          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Export Reel</span>
        </button>
      </div>
    </header>
  );
}
