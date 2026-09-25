import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Move,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Grid,
  Crosshair,
  Type,
  Trash2,
  Maximize2,
  Check,
  Edit3,
  Volume2,
  VolumeX,
  RefreshCw,
  Video
} from 'lucide-react';
import { soundFx } from '../../utils/audioEffects';
import { LOCAL_SAMPLE_VIDEOS, resolveSafeMediaUrl } from '../../utils/mediaUtils';
import toast from 'react-hot-toast';

// Verified, Ultra-Fast Local & CORS-Safe Video Streams
const VERIFIED_STUDIO_STREAMS = [
  ...LOCAL_SAMPLE_VIDEOS,
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://media.w3.org/2010/05/bunny/trailer.mp4'
];

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
  onSelectElement,
  onUpdateTextLayer,
  onDeleteTextLayer
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasBoxRef = useRef(null);

  // Safe-zone & Alignment Grid toggles
  const [showSafeZone, setShowSafeZone] = useState(false);
  const [showCenterGuides, setShowCenterGuides] = useState(false);
  const [isInlineEditing, setIsInlineEditing] = useState(false);

  // Audio Playback & Volume Control
  const [isMuted, setIsMuted] = useState(false);
  const [previewVolume, setPreviewVolume] = useState(100);
  const [videoErrorOccurred, setVideoErrorOccurred] = useState(false);
  const [fallbackStreamIndex, setFallbackStreamIndex] = useState(0);

  // Network Connectivity & Local Fallback Mode (Defaults to local high-speed stream for zero network lag)
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [useLocalFallbackForYouTube, setUseLocalFallbackForYouTube] = useState(true);

  useEffect(() => {
    // Proactively verify internet and YouTube connectivity
    const checkReachability = async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsOnline(false);
        setUseLocalFallbackForYouTube(true);
        return;
      }
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2000);
        await fetch('https://www.youtube-nocookie.com/generate_204', {
          mode: 'no-cors',
          signal: controller.signal,
          cache: 'no-store'
        });
        clearTimeout(timer);
        setIsOnline(true);
      } catch (e) {
        setIsOnline(false);
        setUseLocalFallbackForYouTube(true);
      }
    };

    checkReachability();

    const handleOnline = () => checkReachability();
    const handleOffline = () => {
      setIsOnline(false);
      setUseLocalFallbackForYouTube(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Interactive Canvas Drag State for Text Layers
  const [dragState, setDragState] = useState({
    isDragging: false,
    layerId: null,
    startX: 0,
    startY: 0,
    initPosX: 0,
    initPosY: 0,
    snappedX: false,
    snappedY: false
  });

  // Extract YouTube ID if URL is from YouTube / YouTube Shorts
  const getYouTubeId = (url) => {
    if (!url || typeof url !== 'string') return null;
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
    );
    return match ? match[1] : null;
  };

  // Resolve media URL to ensure valid working stream
  const resolveMediaUrl = (clip, clipIndex = 0) => {
    if (!clip || !clip.url) return VERIFIED_STUDIO_STREAMS[clipIndex % VERIFIED_STUDIO_STREAMS.length];
    return resolveSafeMediaUrl(clip.url, clipIndex);
  };

  // Locate active clip and compute precise local time at current playhead position
  let accumulatedTime = 0;
  let activeClip = null;
  let activeClipIndex = 0;
  let clipLocalTime = 0;

  for (let i = 0; i < timelineClips.length; i++) {
    const clip = timelineClips[i];
    const clipDur = clip.duration || 3;
    if (currentTime >= accumulatedTime && currentTime < accumulatedTime + clipDur) {
      activeClip = clip;
      activeClipIndex = i;
      clipLocalTime = (currentTime - accumulatedTime) + (clip.trimStart || 0);
      break;
    }
    accumulatedTime += clipDur;
  }

  // Handle boundary when playhead is at total duration or index overflow
  if (!activeClip && timelineClips.length > 0) {
    if (currentTime >= totalDuration) {
      const lastIdx = timelineClips.length - 1;
      activeClip = timelineClips[lastIdx];
      activeClipIndex = lastIdx;
      clipLocalTime = (activeClip.trimStart || 0) + (activeClip.duration || 3);
    } else {
      activeClip = timelineClips[0];
      activeClipIndex = 0;
      clipLocalTime = activeClip.trimStart || 0;
    }
  }

  const activeVideoUrl = resolveMediaUrl(activeClip, activeClipIndex);
  const activeYouTubeId = getYouTubeId(activeClip?.url);
  const shouldEmbedYouTube = !!(activeYouTubeId && isOnline && !useLocalFallbackForYouTube);

  // Synchronize HTML5 video element playhead, playback state, and audio volume
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeClip || (activeClip.mediaType !== 'VIDEO' && !activeYouTubeId) || shouldEmbedYouTube) return;

    // Update audio volume and unmuted state
    video.muted = isMuted;
    const clipVol = (activeClip.volume !== undefined ? activeClip.volume : 100) / 100;
    const masterVol = previewVolume / 100;
    video.volume = Math.max(0, Math.min(1, clipVol * masterVol));
    video.playbackRate = playbackSpeed || 1.0;

    // Sync playhead timestamp
    if (Number.isFinite(clipLocalTime)) {
      if (Math.abs(video.currentTime - clipLocalTime) > 0.35) {
        try {
          video.currentTime = clipLocalTime;
        } catch (e) {}
      }
    }

    // Sync Play / Pause state
    if (isPlaying) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy fallback: temporarily mute and retry if needed
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    } else {
      video.pause();
    }
  }, [currentTime, isPlaying, clipLocalTime, activeClip?.id, isMuted, previewVolume, playbackSpeed, activeYouTubeId]);


  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  // Compute aspect ratio CSS classes
  const aspectClass =
    aspectRatio === '9:16'
      ? 'aspect-[9/16] max-h-[580px] w-[326px]'
      : aspectRatio === '1:1'
      ? 'aspect-square max-h-[520px] w-[520px]'
      : 'aspect-[16/9] max-h-[460px] w-full max-w-2xl';

  // Compute combined CSS filter string factoring both filter preset and clip custom exposure/brightness
  const getCombinedFilter = (filterName, clip = {}) => {
    let baseB = 1.0;
    let baseC = 1.0;
    let baseS = 1.0;
    let extra = '';

    switch (filterName) {
      case 'bright':
        baseB = 1.25;
        baseC = 1.08;
        baseS = 1.25;
        break;
      case 'cinematic':
        baseB = 1.12;
        baseC = 1.10;
        baseS = 1.15;
        break;
      case 'cyberpunk':
        baseB = 1.08;
        baseC = 1.18;
        baseS = 1.45;
        extra = 'hue-rotate(15deg) ';
        break;
      case 'warm':
        baseB = 1.15;
        baseS = 1.22;
        extra = 'sepia(22%) ';
        break;
      case 'cool':
        baseB = 1.10;
        baseC = 1.06;
        extra = 'hue-rotate(185deg) ';
        break;
      case 'vintage':
        baseB = 1.10;
        baseC = 1.06;
        extra = 'sepia(25%) ';
        break;
      case 'bw':
        baseB = 1.08;
        baseC = 1.15;
        extra = 'grayscale(100%) ';
        break;
      default:
        break;
    }

    const clipB = (clip?.brightness ?? 100) / 100;
    const clipC = (clip?.contrast ?? 100) / 100;
    const clipS = (clip?.saturation ?? 100) / 100;

    const finalB = Math.round(baseB * clipB * 100);
    const finalC = Math.round(baseC * clipC * 100);
    const finalS = Math.round(baseS * clipS * 100);

    return `${extra}brightness(${finalB}%) contrast(${finalC}%) saturate(${finalS}%)`.trim();
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

  // Drag Handlers for Text Layers on Canvas
  const handlePointerDown = (e, layer) => {
    e.stopPropagation();
    if (onSelectElement) onSelectElement(layer.id, 'text');

    soundFx.playSwipeTick();
    setDragState({
      isDragging: true,
      layerId: layer.id,
      startX: e.clientX,
      startY: e.clientY,
      initPosX: layer.posX || 0,
      initPosY: layer.posY || 0,
      snappedX: false,
      snappedY: false
    });
  };

  const handlePointerMove = useCallback((e) => {
    if (!dragState.isDragging || !dragState.layerId) return;

    const deltaX = e.clientX - dragState.startX;
    const deltaY = e.clientY - dragState.startY;

    let targetX = Math.round(dragState.initPosX + deltaX);
    let targetY = Math.round(dragState.initPosY + deltaY);

    // Smart Center Snapping within +/- 8 pixels
    let snappedX = false;
    let snappedY = false;

    if (Math.abs(targetX) < 8) {
      targetX = 0;
      snappedX = true;
    }
    if (Math.abs(targetY) < 8) {
      targetY = 0;
      snappedY = true;
    }

    setDragState(prev => ({ ...prev, snappedX, snappedY }));

    if (onUpdateTextLayer) {
      onUpdateTextLayer(dragState.layerId, { posX: targetX, posY: targetY });
    }
  }, [dragState, onUpdateTextLayer]);

  const handlePointerUp = useCallback(() => {
    if (dragState.isDragging) {
      setDragState(prev => ({ ...prev, isDragging: false }));
    }
  }, [dragState.isDragging]);

  useEffect(() => {
    if (dragState.isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [dragState.isDragging, handlePointerMove, handlePointerUp]);

  // 9-Point Visual Alignment Matrix Applier
  const applyAlignmentPreset = (layerId, hAlign, vAlign) => {
    soundFx.playReactionBubble();
    if (onUpdateTextLayer) {
      onUpdateTextLayer(layerId, {
        textAlign: hAlign,
        verticalAlign: vAlign,
        posX: 0,
        posY: 0
      });
    }
  };

  const handleVideoError = () => {
    const nextIdx = fallbackStreamIndex + 1;
    setFallbackStreamIndex(nextIdx);
    setVideoErrorOccurred(true);
    if (videoRef.current) {
      videoRef.current.src = VERIFIED_STUDIO_STREAMS[nextIdx % VERIFIED_STUDIO_STREAMS.length];
      videoRef.current.load();
      if (isPlaying) videoRef.current.play().catch(() => {});
    }
  };

  const selectedTextLayer = (textLayers || []).find(t => t.id === selectedElementId);

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-slate-900/60 flex flex-col items-center justify-between p-3.5 overflow-hidden relative select-none"
    >
      {/* Top Preview Status Bar & Visual Tool Toggles */}
      <div className="w-full max-w-xl flex items-center justify-between text-xs text-slate-400 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white uppercase tracking-wider text-[10px]">Real-Time Compositor</span>
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-mono">
            {aspectRatio} • {activeFilter !== 'none' ? activeFilter.toUpperCase() : 'RAW'}
          </span>
          {!isOnline && (
            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Offline
            </span>
          )}
        </div>

        {/* Alignment Guides, Audio & Safe-Zone Toggles */}
        <div className="flex items-center gap-1.5">
          {/* YouTube Online / Local Stream Switcher */}
          {activeYouTubeId && (
            <button
              onClick={() => {
                soundFx.playReactionBubble();
                if (!isOnline && useLocalFallbackForYouTube) {
                  toast.error('Network disconnected. YouTube stream unavailable offline.', { icon: '⚠️' });
                  return;
                }
                setUseLocalFallbackForYouTube(!useLocalFallbackForYouTube);
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                useLocalFallbackForYouTube
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-red-600 text-white font-bold hover:bg-red-500 shadow-md shadow-red-600/20'
              }`}
              title="Toggle between online YouTube embed and zero-latency local fallback stream"
            >
              <span>{useLocalFallbackForYouTube ? '⚡ Local Stream (Active)' : '▶ YouTube Embed'}</span>
            </button>
          )}
          {/* Audio Unmute / Mute Toggle */}
          <button
            onClick={() => {
              soundFx.playReactionBubble();
              setIsMuted(!isMuted);
            }}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              !isMuted
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-rose-400 hover:text-white hover:bg-slate-700'
            }`}
            title={isMuted ? 'Unmute Audio (Sound Disabled)' : 'Audio Enabled (Unmuted)'}
          >
            {isMuted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3" />}
            <span>{isMuted ? 'Muted' : `${previewVolume}% Sound`}</span>
          </button>

          <button
            onClick={() => {
              soundFx.playSwipeTick();
              setShowSafeZone(!showSafeZone);
            }}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              showSafeZone
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="Toggle Reel / TikTok Safe Margin Zones"
          >
            <Grid className="w-3 h-3" />
            <span>Safe Zones</span>
          </button>

          <button
            onClick={() => {
              soundFx.playSwipeTick();
              setShowCenterGuides(!showCenterGuides);
            }}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              showCenterGuides
                ? 'bg-fuchsia-500 text-slate-950 font-black shadow-md shadow-fuchsia-500/20'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="Toggle Center Alignment Guides"
          >
            <Crosshair className="w-3 h-3" />
            <span>Center Crosshair</span>
          </button>

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

      {/* Main Canvas Viewport with Interactive Text Overlay & Alignment Snapping */}
      <div className="relative flex items-center justify-center my-auto w-full">
        <div
          ref={canvasBoxRef}
          className={`relative ${aspectClass} rounded-3xl overflow-hidden bg-black border-2 border-slate-800 shadow-2xl flex items-center justify-center group`}
          onClick={() => {
            if (!dragState.isDragging) onTogglePlay();
          }}
        >
          {/* Active Media Clip / YouTube / Image Preview */}
          {activeClip ? (
            shouldEmbedYouTube ? (
              /* YouTube Shorts / Video Embed Player */
              <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeYouTubeId}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${activeYouTubeId}&start=${Math.floor(clipLocalTime)}&enablejsapi=1&playsinline=1`}
                  title={activeClip.title || 'Studio Video Preview'}
                  className="w-full h-full object-cover pointer-events-none"
                  style={{
                    filter: getCombinedFilter(activeClip.filter || activeFilter, activeClip)
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; compute-pressure; web-share"
                  allowFullScreen
                />
              </div>
            ) : (activeClip.mediaType === 'VIDEO' || activeYouTubeId) ? (
              /* HTML5 Video Element with Full Frame Rendering & Unmuted Audio */
              <>
                <video
                  ref={videoRef}
                  src={activeVideoUrl}
                  className="w-full h-full object-cover transition-all duration-300 pointer-events-none"
                  style={{
                    transform: `scale(${(activeClip.scale || 100) / 100}) rotate(${activeClip.rotation || 0}deg)`,
                    opacity: (activeClip.opacity ?? 100) / 100,
                    filter: getCombinedFilter(activeClip.filter || activeFilter, activeClip)
                  }}
                  playsInline
                  preload="auto"
                  loop
                  muted={isMuted}
                  onError={handleVideoError}
                />
                {activeYouTubeId && (
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 border border-amber-500/40 text-amber-300 font-bold text-[10px] backdrop-blur-md shadow-lg pointer-events-auto">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>{!isOnline ? 'Offline Stream Active' : 'Local Fast Preview'}</span>
                    {isOnline && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUseLocalFallbackForYouTube(false);
                        }}
                        className="ml-1 text-[9px] text-white underline hover:text-amber-300 font-semibold cursor-pointer"
                      >
                        Use YouTube
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <img
                src={activeClip.url}
                alt={activeClip.title}
                className="w-full h-full object-cover transition-all duration-300 pointer-events-none animate-scale-subtle"
                style={{
                  transform: `scale(${(activeClip.scale || 100) / 100}) rotate(${activeClip.rotation || 0}deg)`,
                  opacity: (activeClip.opacity ?? 100) / 100,
                  filter: getCombinedFilter(activeClip.filter || activeFilter, activeClip)
                }}
              />
            )
          ) : (
            <div className="text-center p-6 text-slate-500 space-y-2 pointer-events-none">
              <Layers className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
              <p className="text-xs font-bold text-slate-400">Timeline is Empty</p>
              <p className="text-[10px]">Add media clips or load a template from the left sidebar.</p>
            </div>
          )}

          {/* Social Media Safe-Zone Margin Overlay (Reels / Shorts / TikTok) */}
          {showSafeZone && (
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* Top Header Margin */}
              <div className="absolute top-0 inset-x-0 h-[15%] border-b border-dashed border-amber-400/40 bg-amber-500/5 flex items-start justify-center pt-2">
                <span className="text-[9px] font-mono text-amber-300/80 bg-black/60 px-1.5 py-0.5 rounded">Header Safe Margin</span>
              </div>
              {/* Bottom Reel Description & Action Margin */}
              <div className="absolute bottom-0 inset-x-0 h-[22%] border-t border-dashed border-amber-400/40 bg-amber-500/5 flex items-end justify-center pb-2">
                <span className="text-[9px] font-mono text-amber-300/80 bg-black/60 px-1.5 py-0.5 rounded">Captions & Audio Safe Margin</span>
              </div>
              {/* Right Side Icons Margin */}
              <div className="absolute inset-y-0 right-0 w-[18%] border-l border-dashed border-amber-400/30 bg-amber-500/5 flex items-center justify-center">
                <span className="text-[8px] font-mono text-amber-300/70 rotate-90 whitespace-nowrap">UI Action Bar</span>
              </div>
            </div>
          )}

          {/* Visual Center Crosshair Guides */}
          {(showCenterGuides || dragState.snappedX || dragState.snappedY) && (
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* Vertical Center Line */}
              {(showCenterGuides || dragState.snappedX) && (
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 border-l-2 border-dashed border-cyan-400 flex flex-col justify-between py-4 shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                  <span className="text-[8px] font-bold text-cyan-300 bg-black/80 px-1 py-0.5 rounded self-center">CENTER X</span>
                  <span className="text-[8px] font-bold text-cyan-300 bg-black/80 px-1 py-0.5 rounded self-center">CENTER X</span>
                </div>
              )}
              {/* Horizontal Center Line */}
              {(showCenterGuides || dragState.snappedY) && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 border-t-2 border-dashed border-fuchsia-400 flex justify-between px-4 shadow-[0_0_8px_rgba(217,70,239,0.8)]">
                  <span className="text-[8px] font-bold text-fuchsia-300 bg-black/80 px-1 py-0.5 rounded self-center">CENTER Y</span>
                  <span className="text-[8px] font-bold text-fuchsia-300 bg-black/80 px-1 py-0.5 rounded self-center">CENTER Y</span>
                </div>
              )}
            </div>
          )}

          {/* Active Text Layers Overlay with Direct Drag & Real-time Alignment */}
          {(textLayers || []).filter(Boolean).map((layer) => {
            const start = layer?.startTime || 0;
            const end = start + (layer?.duration || 3);
            const isVisible = currentTime >= start && currentTime <= end;
            const isSelected = selectedElementId === layer?.id;

            if (!isVisible) return null;

            const textAlign = layer?.textAlign || 'center';
            const vertAlign = layer?.verticalAlign || 'bottom';

            let verticalStyle = { bottom: '20%' };
            if (vertAlign === 'top') {
              verticalStyle = { top: '16%' };
            } else if (vertAlign === 'center') {
              verticalStyle = { top: '50%', transform: 'translateY(-50%)' };
            }

            const alignClass =
              textAlign === 'left'
                ? 'text-left justify-start'
                : textAlign === 'right'
                ? 'text-right justify-end'
                : 'text-center justify-center';

            return (
              <div
                key={layer.id}
                onPointerDown={(e) => handlePointerDown(e, layer)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setIsInlineEditing(true);
                }}
                className={`absolute inset-x-3.5 flex ${alignClass} z-20 transition-transform ${
                  dragState.isDragging && dragState.layerId === layer.id
                    ? 'cursor-grabbing select-none'
                    : 'cursor-grab'
                }`}
                style={{
                  ...verticalStyle,
                  transform: `${verticalStyle.transform || ''} translate(${layer.posX || 0}px, ${layer.posY || 0}px)`
                }}
              >
                {/* Visual Bounding Box & Handles when Selected */}
                <div
                  className={`relative inline-block max-w-[290px] rounded-2xl transition-all ${
                    isSelected
                      ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-black shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                      : 'hover:ring-1 hover:ring-white/40'
                  }`}
                >
                  {/* Text Container with Background Pill & Typography Styling */}
                  <div
                    className={`px-4 py-2.5 rounded-2xl max-w-full transition-all ${
                      layer.hasBackground
                        ? 'bg-black/75 backdrop-blur-xl shadow-2xl border border-white/20'
                        : 'drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]'
                    }`}
                    style={{
                      boxShadow: layer.hasBackground
                        ? '0 10px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        : undefined
                    }}
                  >
                    {isInlineEditing && isSelected ? (
                      <textarea
                        rows={(layer.text || '').includes('\n') ? 2 : 1}
                        autoFocus
                        value={layer.text}
                        onChange={(e) => {
                          if (onUpdateTextLayer) onUpdateTextLayer(layer.id, { text: e.target.value });
                        }}
                        onBlur={() => setIsInlineEditing(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            setIsInlineEditing(false);
                          }
                        }}
                        className="bg-transparent text-white font-black outline-none border-b-2 border-cyan-400 text-center w-full min-w-[140px] resize-none leading-snug"
                        style={{
                          fontSize: `${layer.fontSize ? Math.min(22, layer.fontSize * 0.75) : 18}px`,
                          color: layer.color || '#ffffff'
                        }}
                      />
                    ) : (
                      <div
                        className={`leading-snug select-none whitespace-pre-line tracking-tight ${
                          layer.isBold !== false ? 'font-black' : 'font-medium'
                        } ${layer.isItalic ? 'italic' : ''} ${
                          layer.animation === 'pop'
                            ? 'animate-bounce'
                            : layer.animation === 'glow'
                            ? 'drop-shadow-[0_0_18px_rgba(6,182,212,0.95)]'
                            : ''
                        }`}
                        style={{
                          textAlign: textAlign,
                          fontSize: `${layer.fontSize ? Math.min(22, layer.fontSize * 0.75) : 18}px`,
                          color: layer.color || '#ffffff',
                          letterSpacing: `${layer.letterSpacing || 0}px`,
                          textShadow: layer.hasBackground
                            ? '0 1px 2px rgba(0,0,0,0.8)'
                            : '0 2px 4px rgba(0,0,0,0.95), 0 0 16px rgba(0,0,0,0.8)'
                        }}
                      >
                        {(layer.text || '').split('\n').map((line, lIdx) => (
                          <div
                            key={lIdx}
                            className={lIdx === 0 ? 'font-extrabold text-white tracking-tight' : 'text-[88%] font-semibold opacity-95 mt-0.5 tracking-normal'}
                            style={{ color: lIdx === 0 ? (layer.color || '#ffffff') : '#f1f5f9' }}
                          >
                            {line}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Drag Handle Corner Badges when selected */}
                  {isSelected && (
                    <>
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-black shadow" />
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-black shadow" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-black shadow" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-black shadow" />
                      
                      {/* Active Alignment & Offset Tag */}
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-cyan-300 font-mono text-[9px] px-2 py-0.5 rounded-md border border-slate-700 whitespace-nowrap shadow-md pointer-events-none">
                        {vertAlign.toUpperCase()} • {textAlign.toUpperCase()} {layer.posX !== 0 || layer.posY !== 0 ? `(${layer.posX}px, ${layer.posY}px)` : '• CENTERED'}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Center Play Overlay Icon when Paused */}
          {!isPlaying && activeClip && !dragState.isDragging && (
            <div className="absolute inset-0 bg-black/25 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-cyan-500/90 text-slate-950 flex items-center justify-center shadow-xl shadow-cyan-500/30">
                <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Canvas Quick Alignment Toolbar (When a text layer is selected) */}
      {selectedTextLayer && (
        <div className="w-full max-w-xl bg-slate-950/95 backdrop-blur-xl rounded-2xl p-2 border border-slate-800 flex items-center justify-between shadow-2xl z-30 mb-1.5 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1 px-1">
              <Type className="w-3.5 h-3.5" />
              <span>Align:</span>
            </span>

            {/* Quick 9-Grid Alignment Matrix Buttons */}
            <div className="grid grid-cols-3 gap-0.5 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              {[
                { h: 'left', v: 'top', icon: '↖', title: 'Top-Left' },
                { h: 'center', v: 'top', icon: '⬆', title: 'Top-Center' },
                { h: 'right', v: 'top', icon: '↗', title: 'Top-Right' },
                { h: 'left', v: 'center', icon: '⬅', title: 'Middle-Left' },
                { h: 'center', v: 'center', icon: '✛', title: 'Exact Center' },
                { h: 'right', v: 'center', icon: '➡', title: 'Middle-Right' },
                { h: 'left', v: 'bottom', icon: '↙', title: 'Bottom-Left' },
                { h: 'center', v: 'bottom', icon: '⬇', title: 'Bottom-Center (Captions)' },
                { h: 'right', v: 'bottom', icon: '↘', title: 'Bottom-Right' }
              ].map((grid, gIdx) => {
                const isCurrent =
                  (selectedTextLayer.textAlign || 'center') === grid.h &&
                  (selectedTextLayer.verticalAlign || 'bottom') === grid.v &&
                  !selectedTextLayer.posX &&
                  !selectedTextLayer.posY;

                return (
                  <button
                    key={gIdx}
                    onClick={() => applyAlignmentPreset(selectedTextLayer.id, grid.h, grid.v)}
                    className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title={grid.title}
                  >
                    {grid.icon}
                  </button>
                );
              })}
            </div>

            {/* Horizontal Alignment Toggles */}
            <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              {[
                { id: 'left', icon: AlignLeft, title: 'Align Left' },
                { id: 'center', icon: AlignCenter, title: 'Align Center' },
                { id: 'right', icon: AlignRight, title: 'Align Right' }
              ].map((item) => {
                const Icon = item.icon;
                const active = (selectedTextLayer.textAlign || 'center') === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      soundFx.playSwipeTick();
                      onUpdateTextLayer(selectedTextLayer.id, { textAlign: item.id });
                    }}
                    className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                      active ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title={item.title}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>

            {/* Reset / Center Offset Button */}
            {(selectedTextLayer.posX !== 0 || selectedTextLayer.posY !== 0) && (
              <button
                onClick={() => {
                  soundFx.playReactionBubble();
                  onUpdateTextLayer(selectedTextLayer.id, { posX: 0, posY: 0 });
                }}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-bold text-cyan-300 transition-colors cursor-pointer"
                title="Reset X/Y offset to exact anchor position"
              >
                Snap to Anchor
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Font Size Controls */}
            <button
              onClick={() => {
                soundFx.playSwipeTick();
                onUpdateTextLayer(selectedTextLayer.id, {
                  fontSize: Math.max(16, (selectedTextLayer.fontSize || 32) - 4)
                });
              }}
              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-bold text-white transition-colors cursor-pointer"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="font-mono text-xs font-bold text-fuchsia-400 min-w-[24px] text-center">
              {selectedTextLayer.fontSize || 32}
            </span>
            <button
              onClick={() => {
                soundFx.playSwipeTick();
                onUpdateTextLayer(selectedTextLayer.id, {
                  fontSize: Math.min(72, (selectedTextLayer.fontSize || 32) + 4)
                });
              }}
              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-bold text-white transition-colors cursor-pointer"
              title="Increase Font Size"
            >
              A+
            </button>

            {/* Edit Text Button */}
            <button
              onClick={() => setIsInlineEditing(!isInlineEditing)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 transition-colors cursor-pointer"
              title="Edit text content"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Transport Controls Strip */}
      <div className="w-full max-w-xl bg-slate-950 rounded-2xl p-2.5 border border-slate-800 flex items-center justify-between shadow-lg">
        {/* Play / Pause / Restart */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              soundFx.playSwipeTick();
              onTogglePlay();
            }}
            className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all active:scale-95 cursor-pointer shadow-lg shadow-cyan-500/20"
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
            title="Restart from Beginning (00:00.0)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Quick Sound Mute Toggle */}
          <button
            onClick={() => {
              soundFx.playReactionBubble();
              setIsMuted(!isMuted);
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              !isMuted
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Time Display */}
        <div className="text-center font-mono font-bold text-xs">
          <span className="text-cyan-400">{formatTime(currentTime)}</span>
          <span className="text-slate-600 mx-1.5">/</span>
          <span className="text-slate-400">{formatTime(totalDuration)}</span>
        </div>

        {/* Clip Info Badge */}
        <div className="flex items-center gap-1.5">
          <div className="text-[11px] font-bold text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 truncate max-w-[140px] flex items-center gap-1">
            <Video className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="truncate">{activeClip ? activeClip.title : 'No Clip'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}


