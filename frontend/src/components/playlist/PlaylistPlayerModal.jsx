import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  List,
  Heart,
  MessageCircle,
  Share2,
  Music,
  Check,
  ChevronRight,
  Sparkles,
  Code2,
  Terminal,
  Copy,
  BookOpen,
  Video as VideoIcon
} from 'lucide-react';
import { soundFx } from '../../utils/audioEffects';
import toast from 'react-hot-toast';
import { getTopicByTitle } from '../../data/javaTopicsData';


export default function PlaylistPlayerModal({
  isOpen,
  onClose,
  playlist,
  initialIndex = 0
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [progress, setProgress] = useState(0);

  const [viewMode, setViewMode] = useState('video'); // 'video' | 'code' | 'output'
  const [copied, setCopied] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const videos = playlist?.videos || [];
  const currentVideo = videos[currentIndex] || null;
  const totalCount = videos.length;

  const javaTopic = getTopicByTitle(currentVideo?.caption || playlist?.name);

  const handleCopyCode = (e) => {
    e.stopPropagation();
    if (!javaTopic?.code) return;
    navigator.clipboard.writeText(javaTopic.code);
    setCopied(true);
    soundFx.playReactionBubble();
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen && currentVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [currentIndex, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, isPlaying, totalCount]);

  const togglePlay = () => {
    soundFx.playSwipeTick();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        if (audioRef.current) audioRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        if (audioRef.current && currentVideo?.music?.audioUrl) {
          audioRef.current.play().catch(() => {});
        }
        setIsPlaying(true);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < totalCount - 1) {
      soundFx.playSwipeTick();
      setCurrentIndex(prev => prev + 1);
      setIsPlaying(true);
    } else {
      toast('You reached the end of this playlist! 🎬', { icon: '🎉' });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      soundFx.playSwipeTick();
      setCurrentIndex(prev => prev - 1);
      setIsPlaying(true);
    }
  };

  const handleVideoEnded = () => {
    if (currentIndex < totalCount - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const resolveMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    return `http://localhost:8080${url}`;
  };

  if (!isOpen || !playlist) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 px-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold text-xs">
            {currentIndex + 1} / {totalCount}
          </div>
          <div>
            <h2 className="text-white font-bold text-base line-clamp-1">{playlist.name}</h2>
            <p className="text-xs text-slate-400">{playlist.description || `${totalCount} videos in sequence`}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowQueue(!showQueue)}
            className={`p-2.5 rounded-2xl border transition-all flex items-center space-x-1.5 text-xs font-semibold ${
              showQueue
                ? 'bg-cyan-500 text-white border-cyan-400'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Playlist Queue ({totalCount})</span>
          </button>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative w-full max-w-4xl h-full max-h-[85vh] flex items-center justify-center">
        {currentVideo ? (
          <div className="relative w-full h-full max-w-[440px] max-h-[750px] bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center group">
            {viewMode === 'video' ? (
              <>
                <video
                  ref={videoRef}
                  src={resolveMediaUrl(currentVideo.videoUrl)}
                  poster={resolveMediaUrl(currentVideo.thumbnailUrl)}
                  playsInline
                  muted={isMuted}
                  autoPlay
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleVideoEnded}
                  onClick={togglePlay}
                  className="w-full h-full object-cover cursor-pointer"
                />

                {/* Tap to Play Overlay Indicator */}
                {!isPlaying && (
                  <div
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer pointer-events-auto"
                  >
                    <div className="w-16 h-16 rounded-full bg-cyan-500/90 text-white flex items-center justify-center shadow-xl shadow-cyan-500/30">
                      <Play className="w-8 h-8 fill-current translate-x-0.5" />
                    </div>
                  </div>
                )}

                {/* Video Meta Info & Sound Tag Overlay */}
                <div className="absolute bottom-16 left-4 right-4 z-20 pointer-events-none">
                  <div className="text-white">
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span className="text-sm font-bold text-cyan-400">
                        @{currentVideo.user?.username || playlist.user?.username || 'creator'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-white/90">
                        Video #{currentIndex + 1}
                      </span>
                    </div>
                    <p className="text-xs text-white/90 line-clamp-2 leading-relaxed mb-2">
                      {currentVideo.caption || playlist.name}
                    </p>

                    {currentVideo.music && (
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[11px] text-cyan-300">
                        <Music className="w-3 h-3 text-cyan-400 animate-pulse" />
                        <span className="line-clamp-1">{currentVideo.music.title} • {currentVideo.music.artist}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Java Code / Terminal Output in Playlist Modal */
              <div className="relative w-full h-full bg-slate-950 p-4 flex flex-col justify-between overflow-y-auto text-left z-30 custom-scrollbar select-text">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-black uppercase">
                      {javaTopic?.category || 'Java Masterclass'}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-1 line-clamp-1">
                      {javaTopic?.title || currentVideo.caption}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setViewMode('code')}
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        viewMode === 'code' ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      Code
                    </button>
                    <button
                      onClick={() => setViewMode('output')}
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        viewMode === 'output' ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      Output
                    </button>
                    <button
                      onClick={() => setViewMode('video')}
                      className="px-2 py-1 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/40 text-xs font-bold"
                    >
                      Video
                    </button>
                  </div>
                </div>

                <div className="flex-1 my-3 overflow-hidden flex flex-col">
                  {viewMode === 'code' ? (
                    <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400">
                        <span>Solution.java</span>
                        <button
                          onClick={handleCopyCode}
                          className="text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          {copied ? '✓ Copied' : '📋 Copy'}
                        </button>
                      </div>
                      <pre className="flex-1 p-3 text-xs font-mono text-cyan-200 overflow-auto whitespace-pre bg-slate-950/80 custom-scrollbar">
                        <code>{javaTopic?.code || '// Java code loading...'}</code>
                      </pre>
                    </div>
                  ) : (
                    <div className="flex-1 bg-black rounded-xl border border-emerald-950 p-3 font-mono text-xs overflow-auto custom-scrollbar">
                      <p className="text-emerald-400 font-bold text-[11px] pb-1 border-b border-emerald-900/40 mb-2">
                        JVM Console Output:
                      </p>
                      <pre className="text-emerald-300/90 whitespace-pre-wrap">
                        {`$ java Solution\n\n` + (javaTopic?.output || 'Execution complete.')}
                      </pre>
                    </div>
                  )}
                </div>

                {javaTopic?.takeaway && (
                  <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[10px] text-cyan-200">
                    <span className="font-bold text-cyan-300">Takeaway: </span>
                    <span>{javaTopic.takeaway}</span>
                  </div>
                )}
              </div>
            )}

            {/* Top Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-20">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Player Bottom Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between z-20">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-all"
                  title="Previous Video"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={togglePlay}
                  className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/20 transition-all"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === totalCount - 1}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-all"
                  title="Next Video"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                {javaTopic && (
                  <button
                    onClick={() => setViewMode(viewMode === 'video' ? 'code' : 'video')}
                    className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-[11px] font-bold transition-all"
                  >
                    {viewMode === 'video' ? '💻 Code' : '📺 Video'}
                  </button>
                )}

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 p-12 bg-slate-900/50 rounded-3xl border border-slate-800">
            <p className="text-base font-semibold">No videos in this playlist yet.</p>
          </div>
        )}
      </div>


      {/* Playlist Side Queue Drawer */}
      {showQueue && (
        <div className="absolute right-0 top-0 bottom-0 w-80 sm:w-96 bg-slate-900/95 border-l border-slate-800 p-5 z-40 backdrop-blur-2xl flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Playlist Queue</h3>
              <p className="text-xs text-slate-400">{totalCount} / 100 videos</p>
            </div>
            <button
              onClick={() => setShowQueue(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-2.5 custom-scrollbar">
            {videos.map((vid, idx) => (
              <div
                key={vid.id || idx}
                onClick={() => {
                  soundFx.playSwipeTick();
                  setCurrentIndex(idx);
                  setIsPlaying(true);
                }}
                className={`flex items-center space-x-3 p-2.5 rounded-2xl cursor-pointer border transition-all ${
                  idx === currentIndex
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                }`}
              >
                <span className="text-xs font-bold text-slate-500 w-5 text-center">
                  {idx + 1}
                </span>

                <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0">
                  <img
                    src={resolveMediaUrl(vid.thumbnailUrl)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {idx === currentIndex && (
                    <div className="absolute inset-0 bg-cyan-500/30 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-current animate-pulse" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white line-clamp-1">
                    {vid.caption || `Video #${idx + 1}`}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {vid.duration ? `${vid.duration}s` : 'Short video'}
                  </p>
                  {vid.music && (
                    <p className="text-[10px] text-cyan-400 line-clamp-1 flex items-center mt-0.5">
                      <Music className="w-2.5 h-2.5 mr-1 inline" />
                      {vid.music.title}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
