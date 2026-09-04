import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { soundFx } from '../../utils/audioEffects';

export default function FeedVideoPlayer({
  videoUrl,
  posterUrl,
  caption,
  onDoubleTap
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const controlsTimeoutRef = useRef(null);

  // Fallback high-quality poster if none provided
  const effectivePoster =
    posterUrl ||
    'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800';

  // Check if URL is YouTube Shorts / Video
  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
    );
    return match ? match[1] : null;
  };

  const youtubeId = getYouTubeId(videoUrl);

  // IntersectionObserver for Viewport-Based Lazy Autoplay
  useEffect(() => {
    const video = videoRef.current;
    if (!video || youtubeId) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          // Play when at least 50% visible
          video.play().then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
          }).catch(() => {
            // Autoplay blocked without gesture
            setIsPlaying(false);
          });
        } else {
          // Pause when leaving viewport
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: [0.2, 0.5, 0.8] }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
      observer.disconnect();
    };
  }, [videoUrl, youtubeId]);

  const handleTogglePlay = (e) => {
    e.stopPropagation();
    soundFx.playSwipeTick();

    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleMute = (e) => {
    e.stopPropagation();
    soundFx.playReactionBubble();

    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime || 0);
    if (!duration && video.duration) {
      setDuration(video.duration);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration || 0);
    setIsBuffering(false);
    setHasError(false);
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seekTime = (clickX / rect.width) * duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleFullscreenToggle = (e) => {
    e.stopPropagation();
    soundFx.playSwipeTick();

    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleRetry = (e) => {
    e.stopPropagation();
    setHasError(false);
    setIsBuffering(true);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  const formatSeconds = (sec) => {
    if (!sec || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const triggerControls = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2800);
  };

  // YouTube Shorts / Embed Rendering
  if (youtubeId) {
    return (
      <div
        ref={containerRef}
        className="w-full aspect-video md:aspect-[16/10] max-h-[580px] bg-black relative overflow-hidden rounded-2xl flex items-center justify-center select-none"
        onDoubleClick={onDoubleTap}
      >
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=0&mute=1&controls=1&loop=1&playlist=${youtubeId}&modestbranding=1&rel=0&playsinline=1`}
          title={caption || 'Pulse Video'}
          className="w-full h-full object-cover border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={triggerControls}
      onMouseEnter={triggerControls}
      onClick={handleTogglePlay}
      onDoubleClick={onDoubleTap}
      className="relative w-full aspect-video md:aspect-[16/10] max-h-[580px] bg-slate-950 overflow-hidden flex items-center justify-center select-none cursor-pointer group"
    >
      {/* HTML5 Native Video Tag */}
      {!hasError ? (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={effectivePoster}
          playsInline
          loop
          muted={isMuted}
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onCanPlay={() => setIsBuffering(false)}
          onError={() => {
            setHasError(true);
            setIsBuffering(false);
          }}
          className="w-full h-full object-contain"
        />
      ) : (
        /* Video Error / Fallback UI */
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
          <img
            src={effectivePoster}
            alt="Poster"
            className="absolute inset-0 w-full h-full object-cover opacity-30 filter blur-sm"
          />
          <div className="relative z-10 space-y-2 max-w-xs">
            <AlertCircle className="w-10 h-10 text-cyan-400 mx-auto animate-bounce" />
            <p className="text-xs font-bold text-white leading-tight">Video Stream Connecting...</p>
            <p className="text-[11px] text-slate-400">Click below to reconnect the video player stream.</p>
            <button
              onClick={handleRetry}
              className="px-4 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Playback</span>
            </button>
          </div>
        </div>
      )}

      {/* Buffering Loading Spinner */}
      {isBuffering && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none z-10">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-lg shadow-cyan-500/30" />
        </div>
      )}

      {/* Center Play Button Overlay (when paused) */}
      {!isPlaying && !isBuffering && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] pointer-events-none z-10">
          <div className="w-16 h-16 rounded-full bg-cyan-500/90 text-slate-950 flex items-center justify-center shadow-2xl shadow-cyan-500/40 transform group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 fill-slate-950 ml-1" />
          </div>
        </div>
      )}

      {/* Top Controls Overlay (Mute & Fullscreen) */}
      <div
        className={`absolute top-3 inset-x-3 flex items-center justify-between pointer-events-auto z-20 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'
        }`}
      >
        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-black text-white border border-white/10 uppercase tracking-wider">
          Pulse HD
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-full backdrop-blur-md transition-all border cursor-pointer ${
              !isMuted
                ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400/50 shadow-cyan-500/20'
                : 'bg-black/60 text-white border-white/10 hover:bg-black/80'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />}
          </button>

          <button
            onClick={handleFullscreenToggle}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 hover:bg-black/80 transition-colors cursor-pointer"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Bottom Progress Bar & Time Strip */}
      <div
        className={`absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-auto z-20 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'
        }`}
      >
        {/* Interactive Scrub Bar */}
        <div
          onClick={handleSeek}
          className="w-full bg-white/20 h-1.5 hover:h-2.5 rounded-full overflow-hidden cursor-pointer transition-all duration-150 relative mb-1.5"
        >
          <div
            className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-100"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        {/* Time Counters */}
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-300">
          <span>{formatSeconds(currentTime)}</span>
          <span>{formatSeconds(duration)}</span>
        </div>
      </div>
    </div>
  );
}
