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
  Loader2,
  Code2,
  Terminal,
  BookOpen,
  Copy,
  Check,
  Video as VideoIcon
} from 'lucide-react';
import { soundFx } from '../../utils/audioEffects';
import { getTopicByTitle } from '../../data/javaTopicsData';
import { LOCAL_SAMPLE_VIDEOS, resolveSafeMediaUrl, getYouTubeId } from '../../utils/mediaUtils';

// Verified, Ultra-Fast Local & CORS-Safe Video Streams
const VERIFIED_BACKUP_STREAMS = [
  ...LOCAL_SAMPLE_VIDEOS,
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://media.w3.org/2010/05/bunny/trailer.mp4'
];

export default function FeedVideoPlayer({
  videoUrl,
  posterUrl,
  caption,
  onDoubleTap
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const resolveVideoUrl = (url) => {
    if (!url) return VERIFIED_BACKUP_STREAMS[0];
    if (getYouTubeId(url)) return url;
    return resolveSafeMediaUrl(url);
  };

  const [activeUrl, setActiveUrl] = useState(() => resolveVideoUrl(videoUrl));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [fallbackAttempt, setFallbackAttempt] = useState(0);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    setActiveUrl(resolveVideoUrl(videoUrl));
    setHasError(false);
    setIsBuffering(false);
    setFallbackAttempt(0);
  }, [videoUrl]);

  // Fallback high-quality poster if none provided
  const effectivePoster =
    posterUrl ||
    'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800';

  const youtubeId = getYouTubeId(activeUrl);

  // Viewport-Based Lazy Autoplay (Muted for browser compliance)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || youtubeId) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          video.muted = true;
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlaying(true);
                setIsBuffering(false);
              })
              .catch(() => {
                setIsPlaying(false);
              });
          }
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: [0.15, 0.35, 0.7] }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
      observer.disconnect();
    };
  }, [activeUrl, youtubeId]);

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

  const handleVideoError = () => {
    if (fallbackAttempt < VERIFIED_BACKUP_STREAMS.length) {
      const nextStream = VERIFIED_BACKUP_STREAMS[fallbackAttempt % VERIFIED_BACKUP_STREAMS.length];
      setFallbackAttempt(prev => prev + 1);
      setActiveUrl(nextStream);
      setIsBuffering(false);
      setHasError(false);
    } else {
      setHasError(true);
      setIsBuffering(false);
    }
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
    setIsBuffering(false);
    setFallbackAttempt(0);
    const stream = VERIFIED_BACKUP_STREAMS[0];
    setActiveUrl(stream);
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

  const [viewMode, setViewMode] = useState('video'); // 'video' | 'code' | 'output'
  const [copied, setCopied] = useState(false);

  // Look up Java topic information if available
  const javaTopic = getTopicByTitle(caption);

  const handleCopyCode = (e) => {
    e.stopPropagation();
    if (!javaTopic?.code) return;
    navigator.clipboard.writeText(javaTopic.code);
    setCopied(true);
    soundFx.playReactionBubble();
    setTimeout(() => setCopied(false), 2000);
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
      {/* HTML5 Native Video Tag / YouTube Embed */}
      {viewMode === 'video' ? (
        (youtubeId && (typeof navigator === 'undefined' || navigator.onLine)) ? (
          <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=1&loop=1&playlist=${youtubeId}&modestbranding=1&rel=0&playsinline=1`}
              title={caption || 'Pulse Video'}
              className="w-full h-full object-cover border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; compute-pressure; web-share"
              allowFullScreen
            />
          </div>
        ) : !hasError ? (
          <video
            ref={videoRef}
            src={activeUrl}
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
            onError={handleVideoError}
            className="w-full h-full object-contain"
          />
        ) : (
          /* Video Fallback UI */
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
            <img
              src={effectivePoster}
              alt="Poster"
              className="absolute inset-0 w-full h-full object-cover opacity-40 filter blur-sm"
            />
            <div className="relative z-10 space-y-2 max-w-xs bg-black/60 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
              <AlertCircle className="w-8 h-8 text-cyan-400 mx-auto animate-bounce" />
              <p className="text-xs font-bold text-white leading-tight">Switching High-Speed Video Stream...</p>
              <p className="text-[11px] text-slate-300">Click below to reconnect the player immediately.</p>
              <button
                onClick={handleRetry}
                className="px-4 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Playback</span>
              </button>
            </div>
          </div>
        )
      ) : (
        /* Interactive Java Code & Execution Console View */
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full h-full bg-slate-950/95 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto text-left font-sans cursor-default custom-scrollbar z-30 select-text"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-black uppercase tracking-wider">
                  {javaTopic?.category || 'Java Masterclass'}
                </span>
                <span className="text-[11px] font-mono text-slate-400">Java 17/21 Verified</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1 line-clamp-1">
                {javaTopic?.title || caption}
              </h4>
            </div>

            {/* Code / Output subtabs & Return button */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setViewMode('code')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                  viewMode === 'code'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code</span>
              </button>

              <button
                onClick={() => setViewMode('output')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                  viewMode === 'output'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Output</span>
              </button>

              <button
                onClick={() => setViewMode('video')}
                className="px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                title="Return to Video"
              >
                <VideoIcon className="w-3.5 h-3.5" />
                <span>Video</span>
              </button>
            </div>
          </div>

          {/* Main Content: Code or Terminal Output */}
          <div className="flex-1 my-3 overflow-hidden flex flex-col">
            {viewMode === 'code' ? (
              <div className="relative flex-1 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800/80 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="ml-1.5 text-slate-300">Solution.java</span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer text-xs font-semibold"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="flex-1 p-3.5 text-xs font-mono text-cyan-200 overflow-auto whitespace-pre leading-relaxed bg-slate-950/60 custom-scrollbar">
                  <code>{javaTopic?.code || '// Java source snippet loading...'}</code>
                </pre>
              </div>
            ) : (
              <div className="flex-1 bg-black rounded-xl border border-emerald-950/60 p-4 font-mono text-xs overflow-auto custom-scrollbar flex flex-col justify-start">
                <div className="flex items-center gap-2 text-emerald-400 pb-2 mb-2 border-b border-emerald-900/40">
                  <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="font-bold">JVM Console Execution Output (javac & java):</span>
                </div>
                <pre className="text-emerald-300/90 whitespace-pre-wrap leading-relaxed">
                  {`$ javac Solution.java\n$ java Solution\n\n` + (javaTopic?.output || 'No console output logged.')}
                </pre>
              </div>
            )}
          </div>

          {/* Key Takeaway Banner */}
          {javaTopic?.takeaway && (
            <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex items-start gap-2 text-[11px] text-cyan-200">
              <BookOpen className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-cyan-300">Key Takeaway: </span>
                <span>{javaTopic.takeaway}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Buffering Loading Spinner */}
      {viewMode === 'video' && isBuffering && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none z-10">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-lg shadow-cyan-500/30" />
        </div>
      )}

      {/* Center Play Button Overlay (when paused) */}
      {viewMode === 'video' && !isPlaying && !isBuffering && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] pointer-events-none z-10">
          <div className="w-16 h-16 rounded-full bg-cyan-500/90 text-slate-950 flex items-center justify-center shadow-2xl shadow-cyan-500/40 transform group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 fill-slate-950 ml-1" />
          </div>
        </div>
      )}

      {/* Top Controls Overlay (Mute, Fullscreen & Java Code Toggle) */}
      {viewMode === 'video' && (
        <div
          className={`absolute top-3 inset-x-3 flex items-center justify-between pointer-events-auto z-20 transition-opacity duration-300 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-black text-white border border-white/10 uppercase tracking-wider">
              Pulse HD
            </span>

            {/* Java Code & Output Toggle Button */}
            {javaTopic && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playSwipeTick();
                  setViewMode('code');
                  if (videoRef.current) videoRef.current.pause();
                  setIsPlaying(false);
                }}
                className="px-3 py-1 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-slate-950 text-[11px] font-black flex items-center gap-1.5 shadow-lg shadow-cyan-500/30 backdrop-blur-md transition-all cursor-pointer transform hover:scale-105"
                title="View verified Java code and execution output"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>💻 Java Code & Output</span>
              </button>
            )}
          </div>

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
      )}

      {/* Bottom Progress Bar & Time Strip */}
      {viewMode === 'video' && (
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
      )}
    </div>
  );
}

