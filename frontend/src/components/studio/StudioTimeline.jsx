import React, { useRef, useState } from 'react';
import {
  Scissors,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  Magnet,
  Film,
  Type,
  Music,
  Mic,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { soundFx } from '../../utils/audioEffects';

export default function StudioTimeline({
  timelineClips = [],
  textLayers = [],
  backgroundMusic = null,
  voiceoverTracks = [],
  currentTime = 0,
  totalDuration = 30,
  onSeekTime,
  selectedElementId = null,
  selectedElementType = null,
  onSelectElement,
  onSplitClipAtPlayhead,
  onDeleteSelected,
  onDuplicateSelected,
  beatMarkers = [],
  beatSyncEnabled = false
}) {
  const [zoomLevel, setZoomLevel] = useState(35); // pixels per second
  const [isSnapping, setIsSnapping] = useState(true);
  const timelineRulerRef = useRef(null);

  const handleTimelineClick = (e) => {
    if (!timelineRulerRef.current) return;
    const rect = timelineRulerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const targetSec = Math.max(0, Math.min(totalDuration, clickX / zoomLevel));

    soundFx.playSwipeTick();
    onSeekTime(parseFloat(targetSec.toFixed(2)));
  };

  const totalWidth = Math.max(800, totalDuration * zoomLevel + 100);
  const playheadPositionPx = currentTime * zoomLevel;

  return (
    <div className="h-64 bg-slate-950 border-t border-slate-800 flex flex-col select-none relative z-20">
      {/* Timeline Toolbar Header */}
      <div className="h-10 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-900/60 text-xs">
        {/* Left Editing Tools */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => {
              soundFx.playSwipeTick();
              onSplitClipAtPlayhead();
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Split Clip at Current Time (S)"
          >
            <Scissors className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Split (S)</span>
          </button>

          <button
            onClick={() => {
              soundFx.playSwipeTick();
              onDuplicateSelected();
            }}
            disabled={!selectedElementId}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-30 cursor-pointer"
            title="Duplicate Selected Clip"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>

          <button
            onClick={() => {
              soundFx.playSwipeTick();
              onDeleteSelected();
            }}
            disabled={!selectedElementId}
            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-30 cursor-pointer"
            title="Delete Selected (Delete)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>

        {/* Right Zoom & Snapping Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSnapping(!isSnapping)}
            className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
              isSnapping
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Toggle Magnetic Snap"
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setZoomLevel(prev => Math.max(15, prev - 8))}
              className="p-1 text-slate-300 hover:text-white cursor-pointer"
              title="Zoom Out Timeline"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold text-slate-400 px-1">
              {Math.round((zoomLevel / 35) * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(80, prev + 8))}
              className="p-1 text-slate-300 hover:text-white cursor-pointer"
              title="Zoom In Timeline"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Multi-Track Scroll Viewport */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden relative scrollbar-thin scrollbar-thumb-slate-800">
        <div
          ref={timelineRulerRef}
          onClick={handleTimelineClick}
          className="relative h-full cursor-crosshair pb-4"
          style={{ width: `${totalWidth}px` }}
        >
          {/* Time Ruler (Seconds markers) */}
          <div className="h-6 border-b border-slate-800 bg-slate-900/40 relative flex items-end">
            {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, sec) => (
              <div
                key={sec}
                className="absolute flex flex-col items-center"
                style={{ left: `${sec * zoomLevel}px` }}
              >
                <div className="h-2.5 w-px bg-slate-700" />
                <span className="text-[9px] font-mono text-slate-500 select-none mt-0.5">
                  {sec}s
                </span>
              </div>
            ))}

            {/* Beat Markers (When Beat Sync is active) */}
            {beatSyncEnabled &&
              beatMarkers.map((beat, idx) => (
                <div
                  key={idx}
                  className="absolute top-0 bottom-0 w-0.5 bg-fuchsia-500/60 pointer-events-none z-10"
                  style={{ left: `${beat.time * zoomLevel}px` }}
                  title={`Beat @ ${beat.time}s`}
                />
              ))}
          </div>

          {/* Interactive Playhead Needle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-30 pointer-events-none shadow-[0_0_12px_rgba(6,182,212,0.9)]"
            style={{ left: `${playheadPositionPx}px` }}
          >
            {/* Playhead Handle */}
            <div className="w-3 h-3 bg-cyan-400 -translate-x-[5px] rotate-45 rounded-sm shadow-md" />
          </div>

          {/* TRACK 1: Video & Image Clips Track */}
          <div className="pt-2 px-2">
            <div className="flex items-center space-x-1 h-14">
              {timelineClips.map((clip, index) => {
                const clipWidth = (clip.duration || 3) * zoomLevel;
                const isSelected = selectedElementId === clip.id;

                return (
                  <div
                    key={clip.id || index}
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFx.playSwipeTick();
                      onSelectElement(clip.id, 'clip');
                    }}
                    className={`h-full rounded-xl border-2 flex items-center justify-between px-3 relative overflow-hidden transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                    style={{ width: `${clipWidth}px`, minWidth: '40px' }}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 z-10">
                      <Film className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-xs font-black text-white truncate">{clip.title}</span>
                    </div>

                    <span className="text-[10px] font-mono text-cyan-300 font-bold z-10 shrink-0">
                      {(clip.duration || 3).toFixed(1)}s
                    </span>

                    {/* Filmstrip Background Texture */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK 2: Text & Captions Track */}
          <div className="pt-1.5 px-2">
            <div className="relative h-9 rounded-xl bg-slate-900/30 border border-slate-800/40 overflow-hidden">
              {textLayers.map((layer) => {
                const leftPx = (layer.startTime || 0) * zoomLevel;
                const widthPx = (layer.duration || 3) * zoomLevel;
                const isSelected = selectedElementId === layer.id;

                return (
                  <div
                    key={layer.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFx.playSwipeTick();
                      onSelectElement(layer.id, 'text');
                    }}
                    className={`absolute inset-y-0.5 rounded-lg border flex items-center px-2 text-[11px] font-black truncate transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-fuchsia-950/90 border-fuchsia-400 text-white shadow-md shadow-fuchsia-500/20'
                        : 'bg-fuchsia-950/40 border-fuchsia-500/40 text-fuchsia-300 hover:border-fuchsia-400'
                    }`}
                    style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                  >
                    <Type className="w-3 h-3 text-fuchsia-400 mr-1 shrink-0" />
                    <span className="truncate">{layer.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK 3: Background Music Track */}
          <div className="pt-1.5 px-2">
            <div className="relative h-8 rounded-xl bg-slate-900/30 border border-slate-800/40 overflow-hidden">
              {backgroundMusic && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFx.playSwipeTick();
                    onSelectElement('music', 'music');
                  }}
                  className={`absolute inset-y-0.5 inset-x-0 rounded-lg border flex items-center justify-between px-3 text-[11px] font-bold transition-all cursor-pointer ${
                    selectedElementId === 'music'
                      ? 'bg-amber-950/80 border-amber-400 text-amber-200'
                      : 'bg-amber-950/30 border-amber-500/40 text-amber-300 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Music className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">{backgroundMusic.title} • {backgroundMusic.artist}</span>
                  </div>

                  {/* Audio Waveform Graphic */}
                  <div className="flex items-center space-x-0.5 opacity-60">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <span
                        key={i}
                        className="w-0.5 bg-amber-400 rounded-full"
                        style={{ height: `${(i % 5 + 2) * 3}px` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
