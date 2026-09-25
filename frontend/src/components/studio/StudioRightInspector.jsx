import React from 'react';
import {
  Sliders,
  Type,
  Music,
  Video,
  Scissors,
  Copy,
  Trash2,
  Maximize2,
  RotateCw,
  Eye,
  Gauge,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Move,
  ArrowUp,
  ArrowDown,
  Volume2,
  Check,
  Layers,
  Settings,
  Sun,
  Sparkles
} from 'lucide-react';
import { soundFx } from '../../utils/audioEffects';
import toast from 'react-hot-toast';

export default function StudioRightInspector({
  selectedElement,
  elementType, // 'clip' | 'text' | 'music' | 'project'
  onUpdateClip,
  onDeleteClip,
  onDuplicateClip,
  onSplitClip,
  onUpdateTextLayer,
  onDeleteTextLayer,
  onUpdateMusic,
  onRemoveMusic,
  projectInfo
}) {
  if (!selectedElement && elementType !== 'project') {
    return (
      <div className="w-72 bg-slate-950 border-l border-slate-800 p-4 flex flex-col items-center justify-center text-center space-y-3 text-slate-500 select-none h-[calc(100vh-3.5rem)]">
        <Settings className="w-8 h-8 text-slate-700 animate-spin-slow" />
        <h4 className="text-xs font-bold text-slate-400">Inspector Properties</h4>
        <p className="text-[11px] leading-relaxed">
          Select any video clip, text layer, or audio track on the timeline to edit properties in real-time.
        </p>

        {/* Project Summary Card */}
        {projectInfo && (
          <div className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-2 mt-4">
            <p className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">Project Summary</p>
            <div className="text-xs space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>Aspect Ratio:</span>
                <span className="font-mono text-white font-bold">{projectInfo.aspectRatio}</span>
              </div>
              <div className="flex justify-between">
                <span>Clips Count:</span>
                <span className="font-mono text-white font-bold">{projectInfo.clipsCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Duration:</span>
                <span className="font-mono text-cyan-400 font-bold">{projectInfo.totalDuration.toFixed(1)}s</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-72 bg-slate-950 border-l border-slate-800 flex flex-col h-[calc(100vh-3.5rem)] select-none">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2">
          {elementType === 'clip' ? (
            <Video className="w-4 h-4 text-cyan-400" />
          ) : elementType === 'text' ? (
            <Type className="w-4 h-4 text-fuchsia-400" />
          ) : (
            <Music className="w-4 h-4 text-amber-400" />
          )}
          <h3 className="font-black text-xs text-white uppercase tracking-wider">
            {elementType === 'clip' ? 'Clip Inspector' : elementType === 'text' ? 'Text Layer' : 'Audio Track'}
          </h3>
        </div>

        {/* Delete button */}
        <button
          onClick={() => {
            soundFx.playSwipeTick();
            if (elementType === 'clip') onDeleteClip(selectedElement.id);
            else if (elementType === 'text') onDeleteTextLayer(selectedElement.id);
            else if (elementType === 'music') onRemoveMusic();
          }}
          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
          title="Delete Element (Delete key)"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Inspector Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {/* 1. CLIP INSPECTOR */}
        {elementType === 'clip' && (
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Clip Name</label>
              <input
                type="text"
                value={selectedElement.title}
                onChange={(e) => onUpdateClip(selectedElement.id, { title: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white outline-none focus:border-cyan-400"
              />
            </div>

            {/* Scale Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Scale</span>
                </span>
                <span className="font-mono text-cyan-400">{selectedElement.scale || 100}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="200"
                value={selectedElement.scale || 100}
                onChange={(e) => onUpdateClip(selectedElement.id, { scale: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Rotation Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Rotation</span>
                </span>
                <span className="font-mono text-cyan-400">{selectedElement.rotation || 0}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={selectedElement.rotation || 0}
                onChange={(e) => onUpdateClip(selectedElement.id, { rotation: Number(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Opacity Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Opacity</span>
                </span>
                <span className="font-mono text-cyan-400">{selectedElement.opacity ?? 100}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedElement.opacity ?? 100}
                onChange={(e) => onUpdateClip(selectedElement.id, { opacity: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Brightness / Exposure Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Brightness</span>
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-amber-400">{selectedElement.brightness ?? 100}%</span>
                  {(selectedElement.brightness !== undefined && selectedElement.brightness !== 100) && (
                    <button
                      onClick={() => onUpdateClip(selectedElement.id, { brightness: 100 })}
                      className="text-[9px] text-slate-500 hover:text-amber-400 font-mono"
                    >
                      (reset)
                    </button>
                  )}
                </div>
              </div>
              <input
                type="range"
                min="50"
                max="180"
                value={selectedElement.brightness ?? 100}
                onChange={(e) => onUpdateClip(selectedElement.id, { brightness: Number(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Contrast Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Contrast</span>
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-cyan-400">{selectedElement.contrast ?? 100}%</span>
                  {(selectedElement.contrast !== undefined && selectedElement.contrast !== 100) && (
                    <button
                      onClick={() => onUpdateClip(selectedElement.id, { contrast: 100 })}
                      className="text-[9px] text-slate-500 hover:text-cyan-400 font-mono"
                    >
                      (reset)
                    </button>
                  )}
                </div>
              </div>
              <input
                type="range"
                min="50"
                max="160"
                value={selectedElement.contrast ?? 100}
                onChange={(e) => onUpdateClip(selectedElement.id, { contrast: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Saturation Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>Saturation</span>
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-fuchsia-400">{selectedElement.saturation ?? 100}%</span>
                  {(selectedElement.saturation !== undefined && selectedElement.saturation !== 100) && (
                    <button
                      onClick={() => onUpdateClip(selectedElement.id, { saturation: 100 })}
                      className="text-[9px] text-slate-500 hover:text-fuchsia-400 font-mono"
                    >
                      (reset)
                    </button>
                  )}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={selectedElement.saturation ?? 100}
                onChange={(e) => onUpdateClip(selectedElement.id, { saturation: Number(e.target.value) })}
                className="w-full accent-fuchsia-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Clip Duration Trimmer */}
            <div className="space-y-1 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1">
                  <Scissors className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Duration</span>
                </span>
                <span className="font-mono text-cyan-400">{(selectedElement.duration || 3).toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="30"
                step="0.5"
                value={selectedElement.duration || 3}
                onChange={(e) => onUpdateClip(selectedElement.id, { duration: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Clip Audio Track & Volume Slider */}
            {selectedElement.mediaType === 'VIDEO' && (
              <div className="space-y-1 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Clip Audio Volume</span>
                  </span>
                  <span className="font-mono text-emerald-400">{selectedElement.volume !== undefined ? selectedElement.volume : 100}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedElement.volume !== undefined ? selectedElement.volume : 100}
                  onChange={(e) => onUpdateClip(selectedElement.id, { volume: Number(e.target.value) })}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <button
                onClick={() => onSplitClip(selectedElement.id)}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Scissors className="w-3.5 h-3.5 text-cyan-400" />
                <span>Split at Playhead (S)</span>
              </button>


              <button
                onClick={() => onDuplicateClip(selectedElement.id)}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Duplicate Clip</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. TEXT LAYER INSPECTOR */}
        {elementType === 'text' && (
          <div className="space-y-4">
            {/* Text Content Input */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Text Content</label>
              <textarea
                rows="3"
                value={selectedElement.text}
                onChange={(e) => onUpdateTextLayer(selectedElement.id, { text: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white outline-none focus:border-fuchsia-400 resize-none"
              />
            </div>

            {/* 9-Point Visual Alignment Matrix */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">9-Point Alignment Grid</label>
                <span className="text-[9px] font-mono text-cyan-400 font-bold">1-Tap Snap</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-2 rounded-2xl border border-slate-800">
                {[
                  { h: 'left', v: 'top', icon: '↖', label: 'Top-L' },
                  { h: 'center', v: 'top', icon: '⬆', label: 'Top' },
                  { h: 'right', v: 'top', icon: '↗', label: 'Top-R' },
                  { h: 'left', v: 'center', icon: '⬅', label: 'Mid-L' },
                  { h: 'center', v: 'center', icon: '✛', label: 'Center' },
                  { h: 'right', v: 'center', icon: '➡', label: 'Mid-R' },
                  { h: 'left', v: 'bottom', icon: '↙', label: 'Bot-L' },
                  { h: 'center', v: 'bottom', icon: '⬇', label: 'Bot (Reels)' },
                  { h: 'right', v: 'bottom', icon: '↘', label: 'Bot-R' }
                ].map((grid, gIdx) => {
                  const isCurrent =
                    (selectedElement.textAlign || 'center') === grid.h &&
                    (selectedElement.verticalAlign || 'bottom') === grid.v &&
                    !selectedElement.posX &&
                    !selectedElement.posY;

                  return (
                    <button
                      key={gIdx}
                      onClick={() => {
                        soundFx.playReactionBubble();
                        onUpdateTextLayer(selectedElement.id, {
                          textAlign: grid.h,
                          verticalAlign: grid.v,
                          posX: 0,
                          posY: 0
                        });
                      }}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-gradient-to-br from-cyan-500 to-fuchsia-600 text-white font-black shadow-lg shadow-cyan-500/20 scale-102'
                          : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80'
                      }`}
                      title={`${grid.label} Alignment`}
                    >
                      <span className="text-sm leading-none">{grid.icon}</span>
                      <span className="text-[8px] font-bold mt-1 tracking-tight">{grid.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Style Presets Palette */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5">Visual Style Presets</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  {
                    name: '✨ Neon Glow',
                    color: '#38bdf8',
                    bg: false,
                    anim: 'glow',
                    isBold: true,
                    spacing: 1
                  },
                  {
                    name: '💬 Glass Subtitle',
                    color: '#ffffff',
                    bg: true,
                    anim: 'none',
                    isBold: true,
                    spacing: 0
                  },
                  {
                    name: '⚡ Cyber Pop',
                    color: '#facc15',
                    bg: true,
                    anim: 'pop',
                    isBold: true,
                    spacing: 2
                  },
                  {
                    name: '👑 Minimal Luxury',
                    color: '#ffffff',
                    bg: false,
                    anim: 'slide',
                    isBold: false,
                    spacing: 4
                  }
                ].map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => {
                      soundFx.playChimeCTA();
                      onUpdateTextLayer(selectedElement.id, {
                        color: preset.color,
                        hasBackground: preset.bg,
                        animation: preset.anim,
                        isBold: preset.isBold,
                        letterSpacing: preset.spacing
                      });
                    }}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400 text-left transition-all cursor-pointer text-xs font-bold text-slate-200 hover:text-white"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Horizontal Alignment Toolbar */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5">Horizontal Flow</label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {[
                  { id: 'left', label: 'Left', icon: AlignLeft },
                  { id: 'center', label: 'Center', icon: AlignCenter },
                  { id: 'right', label: 'Right', icon: AlignRight }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = (selectedElement.textAlign || 'center') === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        soundFx.playSwipeTick();
                        onUpdateTextLayer(selectedElement.id, { textAlign: item.id });
                      }}
                      className={`py-1.5 rounded-lg flex items-center justify-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Position X & Y Sliders */}
            <div className="space-y-2 pt-1 border-t border-slate-800/80">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300">Offset X</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-cyan-400">{selectedElement.posX || 0}px</span>
                    {selectedElement.posX !== 0 && (
                      <button
                        onClick={() => onUpdateTextLayer(selectedElement.id, { posX: 0 })}
                        className="text-[9px] text-slate-500 hover:text-cyan-400 font-mono"
                      >
                        (reset)
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  value={selectedElement.posX || 0}
                  onChange={(e) => onUpdateTextLayer(selectedElement.id, { posX: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300">Offset Y</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-fuchsia-400">{selectedElement.posY || 0}px</span>
                    {selectedElement.posY !== 0 && (
                      <button
                        onClick={() => onUpdateTextLayer(selectedElement.id, { posY: 0 })}
                        className="text-[9px] text-slate-500 hover:text-fuchsia-400 font-mono"
                      >
                        (reset)
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={selectedElement.posY || 0}
                  onChange={(e) => onUpdateTextLayer(selectedElement.id, { posY: Number(e.target.value) })}
                  className="w-full accent-fuchsia-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>
            </div>

            {/* Font Size Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-300">Font Size</span>
                <span className="font-mono text-fuchsia-400">{selectedElement.fontSize || 32}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="72"
                value={selectedElement.fontSize || 32}
                onChange={(e) => onUpdateTextLayer(selectedElement.id, { fontSize: Number(e.target.value) })}
                className="w-full accent-fuchsia-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Letter Spacing Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-300">Letter Spacing</span>
                <span className="font-mono text-cyan-400">{selectedElement.letterSpacing || 0}px</span>
              </div>
              <input
                type="range"
                min="-2"
                max="10"
                value={selectedElement.letterSpacing || 0}
                onChange={(e) => onUpdateTextLayer(selectedElement.id, { letterSpacing: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Bold / Italic / Text Case Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateTextLayer(selectedElement.id, { isBold: !selectedElement.isBold })}
                className={`flex-1 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedElement.isBold !== false
                    ? 'bg-fuchsia-600/30 text-fuchsia-300 border-fuchsia-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Bold className="w-3.5 h-3.5" />
                <span>Bold</span>
              </button>
              <button
                onClick={() => onUpdateTextLayer(selectedElement.id, { isItalic: !selectedElement.isItalic })}
                className={`flex-1 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedElement.isItalic
                    ? 'bg-fuchsia-600/30 text-fuchsia-300 border-fuchsia-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Italic className="w-3.5 h-3.5" />
                <span>Italic</span>
              </button>
            </div>

            {/* Color Picker Presets */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5">Text Color</label>
              <div className="flex items-center gap-2">
                {['#ffffff', '#facc15', '#38bdf8', '#f472b6', '#34d399', '#f87171', '#c084fc'].map((color) => (
                  <button
                    key={color}
                    onClick={() => onUpdateTextLayer(selectedElement.id, { color })}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                      selectedElement.color === color ? 'scale-125 border-white shadow-lg' : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Background Pill Switch */}
            <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-200">Dark Background Glass Pill</span>
              <input
                type="checkbox"
                checked={selectedElement.hasBackground || false}
                onChange={(e) => onUpdateTextLayer(selectedElement.id, { hasBackground: e.target.checked })}
                className="w-4 h-4 rounded text-fuchsia-500 focus:ring-fuchsia-400 cursor-pointer accent-fuchsia-400"
              />
            </div>

            {/* Animation Selector */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Animation Style</label>
              <select
                value={selectedElement.animation || 'none'}
                onChange={(e) => onUpdateTextLayer(selectedElement.id, { animation: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white outline-none cursor-pointer"
              >
                <option value="none">None (Static)</option>
                <option value="pop">⚡ Bouncing Pop</option>
                <option value="typewriter">⌨️ Typewriter</option>
                <option value="glow">✨ Neon Glow</option>
                <option value="slide">🚀 Slide Up</option>
              </select>
            </div>
          </div>
        )}

        {/* 3. MUSIC TRACK INSPECTOR */}
        {elementType === 'music' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-xs font-black text-white">{selectedElement.title}</p>
              <p className="text-[10px] text-slate-400">{selectedElement.artist}</p>
            </div>

            {/* Volume Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Music Volume</span>
                </span>
                <span className="font-mono text-amber-400">{selectedElement.volume ?? 75}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedElement.volume ?? 75}
                onChange={(e) => onUpdateMusic({ volume: Number(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Auto-Ducking Switch */}
            <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-200">Voice Auto-Ducking</p>
                <p className="text-[10px] text-slate-400">Reduce music volume while voice-over speaks</p>
              </div>
              <input
                type="checkbox"
                checked={selectedElement.autoDucking ?? true}
                onChange={(e) => onUpdateMusic({ autoDucking: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-400"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
