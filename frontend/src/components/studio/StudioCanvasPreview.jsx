import React, { useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Activity,
  Layers,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { soundFx } from '../../utils/audioEffects';

export default function StudioCanvasPreview({
  aspectRatio = '9:16',
  timelineClips = [],
  textLayers = [],
  activeFilter = 'none',
  currentTime = 0,
  totalDuration = 30,
  isPlaying = false,
  onTogglePlay,
  onRestart,
  playbackSpeed = 1.0,
  onChangeSpeed,
  selectedElementId = null,
  onSelectElement
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  // Locate active clip at currentTime
  let accumulatedTime = 0;
  let activeClip = timelineClips[0] || null;
  let clipLocalTime = 0;

  for (const clip of timelineClips) {
    const clipDur = clip.duration || 3;
    if (currentTime >= accumulatedTime && currentTime <= accumulatedTime + clipDur) {
      activeClip = clip;
      clipLocalTime = (currentTime - accumulatedTime) + (clip.trimStart || 0);
      break;
    }
    accumulatedTime += clipDur;
  }

  // Update video element position when currentTime changes
  useEffect(() => {
    if (videoRef.current && activeClip && activeClip.mediaType === 'VIDEO') {
      try {
        if (Math.abs(videoRef.current.currentTime - clipLocalTime) > 0.3) {
          videoRef.current.currentTime = clipLocalTime;
        }
      } catch (e) {}
    }
  }, [currentTime, activeClip?.id]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  // Compute aspect ratio CSS classes
  const aspectClass =
    aspectRatio === '9:16'
      ? 'aspect-[9/16] max-h-[580px]'
      : aspectRatio === '1:1'
      ? 'aspect-square max-h-[520px]'
      : 'aspect-[16/9] max-h-[460px] w-full max-w-2xl';

  // Apply Filter CSS
  const getFilterStyle = (filter) => {
    switch (filter) {
      case 'cinematic':
        return 'contrast-125 brightness-95 saturate-110';
      case 'cyberpunk':
        return 'contrast-125 saturate-150 hue-rotate-15';
      case 'warm':
        return 'sepia-[0.25] saturate-125 brightness-105';
      case 'cool':
        return 'hue-rotate-[185deg] contrast-105';
      case 'vintage':
        return 'sepia-[0.4] contrast-110 brightness-90';
      case 'bw':
        return 'grayscale contrast-125';
      default:
        return '';
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-slate-900/60 flex flex-col items-center justify-between p-4 overflow-hidden relative select-none"
    >
      {/* Top Preview Status Bar */}
      <div className="w-full max-w-lg flex items-center justify-between text-xs text-slate-400 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white uppercase tracking-wider text-[10px]">Real-Time Compositor</span>
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-mono">
            {aspectRatio} • {activeFilter !== 'none' ? activeFilter.toUpperCase() : 'RAW'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Playback Speed Selector */}
          <select
            value={playbackSpeed}
            onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
            className="bg-slate-800 text-slate-300 text-[10px] font-bold rounded-lg px-2 py-1 outline-none cursor-pointer border border-slate-700"
          >
            <option value="0.5">0.5x</option>
            <option value="1.0">1.0x</option>
            <option value="1.5">1.5x</option>
            <option value="2.0">2.0x</option>
          </select>

          <button
            onClick={handleFullscreen}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Toggle Fullscreen (F)"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport with Safe Zone */}
      <div className="relative flex items-center justify-center my-auto w-full">
        <div
          className={`relative ${aspectClass} rounded-3xl overflow-hidden bg-black border-2 border-slate-800 shadow-2xl flex items-center justify-center`}
          onClick={onTogglePlay}
        >
          {activeClip ? (
            activeClip.mediaType === 'VIDEO' ? (
              <video
                ref={videoRef}
                src={activeClip.url}
                className={`w-full h-full object-cover transition-all duration-300 ${getFilterStyle(activeClip.filter || activeFilter)}`}
                style={{
                  transform: `scale(${(activeClip.scale || 100) / 100}) rotate(${activeClip.rotation || 0}deg)`,
                  opacity: (activeClip.opacity ?? 100) / 100
                }}
                autoPlay={isPlaying}
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={activeClip.url}
                alt={activeClip.title}
                className={`w-full h-full object-cover transition-all duration-300 ${getFilterStyle(activeClip.filter || activeFilter)} animate-scale-subtle`}
                style={{
                  transform: `scale(${(activeClip.scale || 100) / 100}) rotate(${activeClip.rotation || 0}deg)`,
                  opacity: (activeClip.opacity ?? 100) / 100
                }}
              />
            )
          ) : (
            <div className="text-center p-6 text-slate-500 space-y-2">
              <Layers className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
              <p className="text-xs font-bold text-slate-400">Timeline is Empty</p>
              <p className="text-[10px]">Add media clips or load a template from the left sidebar.</p>
            </div>
          )}

          {/* Active Text Layers Overlay */}
          {(textLayers || []).filter(Boolean).map((layer) => {
            const start = layer?.startTime || 0;
            const end = start + (layer?.duration || 3);
            const isVisible = currentTime >= start && currentTime <= end;
            const isSelected = selectedElementId === layer?.id;

            if (!isVisible) return null;

            return (
              <div
                key={layer.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectElement(layer.id, 'text');
                }}
                className={`absolute inset-x-4 text-center cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-black rounded-xl' : ''
                }`}
                style={{
                  bottom: '22%',
                  transform: `translate(${layer.posX || 0}px, ${layer.posY || 0}px)`
                }}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-2xl ${
                    layer.hasBackground ? 'bg-black/75 backdrop-blur-md shadow-2xl border border-white/10' : ''
                  }`}
                >
                  <p
                    className={`font-black tracking-wide leading-tight drop-shadow-md ${
                      layer.animation === 'pop'
                        ? 'animate-bounce'
                        : layer.animation === 'glow'
                        ? 'text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.9)]'
                        : ''
                    }`}
                    style={{
                      fontSize: `${layer.fontSize ? layer.fontSize * 0.75 : 22}px`,
                      color: layer.color || '#ffffff'
                    }}
                  >
                    {layer.text}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Center Play Overlay Icon when Paused */}
          {!isPlaying && activeClip && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-cyan-500/90 text-slate-950 flex items-center justify-center shadow-xl shadow-cyan-500/30">
                <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Transport Controls Strip */}
      <div className="w-full max-w-lg bg-slate-950 rounded-2xl p-2.5 border border-slate-800 flex items-center justify-between mt-2 shadow-lg">
        {/* Play / Pause / Restart */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              soundFx.playSwipeTick();
              onTogglePlay();
            }}
            className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors cursor-pointer"
            title="Play / Pause (Space)"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
          </button>

          <button
            onClick={() => {
              soundFx.playSwipeTick();
              onRestart();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
            title="Restart from Beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Time Display */}
        <div className="text-center font-mono font-bold text-xs">
          <span className="text-cyan-400">{formatTime(currentTime)}</span>
          <span className="text-slate-600 mx-1.5">/</span>
          <span className="text-slate-400">{formatTime(totalDuration)}</span>
        </div>

        {/* Clip Info Badge */}
        <div className="text-[11px] font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 truncate max-w-[130px]">
          {activeClip ? activeClip.title : 'No Clip'}
        </div>
      </div>
    </div>
  );
}
