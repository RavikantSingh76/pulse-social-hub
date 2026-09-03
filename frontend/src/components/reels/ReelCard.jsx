import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  Music2,
  Check,
  Play,
  Pause,
  Maximize,
  Minimize,
  MoreHorizontal,
  Sparkles,
  AlertCircle,
  Loader2,
  Flame
} from 'lucide-react';
import { soundFx, REELS_AUDIO_TRACKS } from '../../utils/audioEffects';
import { postService, userService } from '../../services/services';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ReelCard({
  reel,
  index,
  isActive,
  isMuted,
  onToggleMute,
  onOpenComments,
  onOpenShare,
  onOpenAudioModal
}) {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLiked, setIsLiked] = useState(reel.isLiked || false);
  const [likesCount, setLikesCount] = useState(reel.likesCount || 0);
  const [isSaved, setIsSaved] = useState(reel.isSaved || false);
  const [isFollowing, setIsFollowing] = useState(reel.isFollowing || false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [heartPop, setHeartPop] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPlayPauseFeedback, setShowPlayPauseFeedback] = useState(null); // 'play' | 'pause'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const videoUrl = reel.media && reel.media.length > 0
    ? (reel.media[0].url.startsWith('http') ? reel.media[0].url : `http://localhost:8080${reel.media[0].url}`)
    : (reel.videoUrl || '');

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    return match ? match[1] : null;
  };

  const youtubeId = getYouTubeId(videoUrl);

  const audioTrack = REELS_AUDIO_TRACKS[index % REELS_AUDIO_TRACKS.length];
  const isOwner = user && user.id === reel.userId;

  // Handle active/inactive playback via IntersectionObserver
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
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
  }, [isActive]);

  // Sync mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Video progress tracking
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setProgress((current / duration) * 100);
    }
  };

  const handleVideoClick = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowPlayPauseFeedback('pause');
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      setShowPlayPauseFeedback('play');
    }
    setTimeout(() => setShowPlayPauseFeedback(null), 800);
  };

  const handleDoubleTap = (e) => {
    e.stopPropagation();
    soundFx.playLikePop();
    setHeartPop(true);
    if (!isLiked) {
      handleToggleLike();
    }
    setTimeout(() => setHeartPop(false), 900);
  };

  const handleToggleLike = async () => {
    soundFx.playLikePop();
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount(prev => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await postService.toggleReaction(reel.id, 'LOVE');
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSave = async () => {
    soundFx.playReactionBubble();
    const nextState = !isSaved;
    setIsSaved(nextState);
    toast.success(nextState ? 'Saved to bookmarks 🔖' : 'Removed from bookmarks');

    try {
      await postService.toggleSave(reel.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFollow = async () => {
    if (!reel.userId) return;
    soundFx.playChimeCTA();
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    toast.success(nextState ? `Following @${reel.username}! 🎉` : `Unfollowed @${reel.username}`);

    try {
      await userService.followUser(reel.userId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFullscreenToggle = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      data-reel-index={index}
      className="reel-item relative w-full h-[calc(100vh-8.5rem)] md:h-[720px] max-w-[420px] mx-auto snap-start bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800/90 select-none flex items-center justify-center my-4 group"
    >
      {/* 1. Video Player Element */}
      {youtubeId ? (
        <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=${isActive ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=1&loop=1&playlist=${youtubeId}&modestbranding=1&rel=0&playsinline=1`}
            title={reel.caption || 'Pulse Reel'}
            className="w-full h-full object-cover scale-[1.03] border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : videoUrl && !hasError ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover cursor-pointer"
          loop
          playsInline
          preload="metadata"
          muted={isMuted}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onCanPlay={() => setIsBuffering(false)}
          onError={() => setHasError(true)}
          onTimeUpdate={handleTimeUpdate}
          onClick={handleVideoClick}
          onDoubleClick={handleDoubleTap}
        />
      ) : (
        /* Video Error / Fallback UI */
        <div
          className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 text-white p-8 text-center cursor-pointer"
          onClick={handleVideoClick}
          onDoubleClick={handleDoubleTap}
        >
          <Sparkles className="w-12 h-12 text-cyan-400 mb-3 animate-pulse" />
          <p className="font-extrabold text-base leading-relaxed max-w-[280px]">
            {reel.caption || 'Building the future of social networking on Pulse 🚀'}
          </p>
          {hasError && (
            <button
              onClick={() => {
                setHasError(false);
                setIsBuffering(true);
                if (videoRef.current) videoRef.current.load();
              }}
              className="mt-4 px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 transition-all cursor-pointer"
            >
              Retry Video
            </button>
          )}
        </div>
      )}

      {/* 2. Buffering Loading Spinner */}
      {isBuffering && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none z-20">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-lg shadow-cyan-500/30" />
        </div>
      )}

      {/* 3. Dark Vignette & Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/60 pointer-events-none z-10" />

      {/* 4. Center Play/Pause Feedback Indicator */}
      {showPlayPauseFeedback && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-scale-up">
          <div className="p-4 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white shadow-2xl">
            {showPlayPauseFeedback === 'play' ? (
              <Play className="w-10 h-10 text-cyan-400 fill-cyan-400" />
            ) : (
              <Pause className="w-10 h-10 text-white fill-white" />
            )}
          </div>
        </div>
      )}

      {/* 5. Giant Animated Double-Tap Neon Heart Burst */}
      {heartPop && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 animate-scale-up">
          <div className="relative">
            <Heart className="w-28 h-28 text-rose-500 fill-rose-500 drop-shadow-[0_0_35px_rgba(244,63,94,0.95)] animate-bounce" />
            <Sparkles className="w-10 h-10 text-amber-300 absolute -top-3 -right-3 animate-spin" />
          </div>
        </div>
      )}

      {/* 6. Top Header Controls (Sound Mute + Fullscreen) */}
      <div className="absolute top-4 inset-x-4 z-30 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider text-white uppercase bg-gradient-to-r from-cyan-500 to-indigo-600 shadow-md shadow-cyan-500/20 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
            PULSE REEL
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mute/Unmute Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all border cursor-pointer shadow-lg ${
              !isMuted
                ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400/50 shadow-cyan-500/30'
                : 'bg-black/60 text-white border-white/10 hover:bg-black/80'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFullscreenToggle();
            }}
            className="p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 hover:bg-black/80 transition-colors cursor-pointer"
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 7. Right-Side Floating Action Column */}
      <div className="absolute right-3.5 bottom-16 z-30 flex flex-col items-center space-y-4 pointer-events-auto">
        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleLike();
          }}
          className="flex flex-col items-center group cursor-pointer"
          aria-label={isLiked ? 'Unlike' : 'Like'}
        >
          <div className={`p-3 rounded-full backdrop-blur-md transition-all active:scale-75 ${
            isLiked
              ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40 shadow-lg shadow-rose-500/30'
              : 'bg-black/60 text-white hover:bg-black/80 border border-white/10'
          }`}>
            <Heart className={`w-6 h-6 transition-transform ${isLiked ? 'fill-rose-500 scale-110' : 'group-hover:scale-110'}`} />
          </div>
          <span className="text-[11px] font-bold text-white mt-1 drop-shadow">
            {likesCount > 999 ? `${(likesCount / 1000).toFixed(1)}k` : likesCount}
          </span>
        </button>

        {/* Comment Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenComments(reel);
          }}
          className="flex flex-col items-center group cursor-pointer"
          aria-label="Open Comments"
        >
          <div className="p-3 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-all active:scale-75 border border-white/10 group-hover:border-cyan-400/40">
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform text-slate-100" />
          </div>
          <span className="text-[11px] font-bold text-white mt-1 drop-shadow">
            {reel.commentsCount || 0}
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenShare(reel);
          }}
          className="flex flex-col items-center group cursor-pointer"
          aria-label="Share Reel"
        >
          <div className="p-3 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-all active:scale-75 border border-white/10 group-hover:border-cyan-400/40">
            <Share2 className="w-6 h-6 group-hover:scale-110 transition-transform text-slate-100" />
          </div>
          <span className="text-[11px] font-bold text-white mt-1 drop-shadow">
            Share
          </span>
        </button>

        {/* Bookmark / Save Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleSave();
          }}
          className="flex flex-col items-center group cursor-pointer"
          aria-label={isSaved ? 'Remove Bookmark' : 'Save Reel'}
        >
          <div className={`p-3 rounded-full backdrop-blur-md transition-all active:scale-75 ${
            isSaved
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/20'
              : 'bg-black/60 text-white hover:bg-black/80 border border-white/10'
          }`}>
            <Bookmark className={`w-6 h-6 transition-transform ${isSaved ? 'fill-cyan-400 scale-110' : 'group-hover:scale-110'}`} />
          </div>
          <span className="text-[11px] font-bold text-white mt-1 drop-shadow">
            Save
          </span>
        </button>

        {/* More Options Button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMoreMenu(!showMoreMenu);
            }}
            className="p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-all border border-white/10 cursor-pointer"
            aria-label="More Options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 bottom-12 w-44 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 text-xs font-semibold text-slate-200 animate-fade-in">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Reel link copied!');
                  setShowMoreMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Copy Link
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toast('Reel hidden from feed', { icon: '👁️' });
                  setShowMoreMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Not Interested
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toast.error('Reel reported to moderators');
                  setShowMoreMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
              >
                Report Reel
              </button>
            </div>
          )}
        </div>

        {/* Rotating Vinyl Audio Disc with Equalizer */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenAudioModal(audioTrack);
          }}
          className="pt-2 flex flex-col items-center group cursor-pointer"
          title={`Audio: ${audioTrack.title}`}
        >
          <div className={`w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 via-indigo-900 to-fuchsia-600 p-0.5 border border-white/30 shadow-lg flex items-center justify-center ${isPlaying && !isMuted ? 'animate-spin-slow' : ''}`}>
            <div className="w-3 h-3 rounded-full bg-slate-950 border border-white/40" />
          </div>

          {!isMuted && isPlaying && (
            <div className="flex items-end space-x-0.5 h-3 mt-1.5">
              <span className="w-0.5 bg-cyan-400 rounded-full animate-bounce h-2" />
              <span className="w-0.5 bg-pink-400 rounded-full animate-bounce h-3 delay-75" />
              <span className="w-0.5 bg-cyan-400 rounded-full animate-bounce h-1.5 delay-150" />
            </div>
          )}
        </button>
      </div>

      {/* 8. Bottom Creator Information, Caption & Audio Marquee */}
      <div className="absolute bottom-0 inset-x-0 p-5 pr-16 bg-gradient-to-t from-black/95 via-black/60 to-transparent text-white z-20 space-y-2 pointer-events-auto">
        {/* Creator Identity Bar */}
        <div className="flex items-center justify-between">
          <Link
            to={`/profile/${reel.username}`}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="relative">
              <img
                src={reel.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${reel.username}`}
                alt={reel.displayName || reel.username}
                className="w-10 h-10 rounded-full border-2 border-cyan-400 object-cover shadow-lg group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
            </div>

            <div>
              <div className="flex items-center gap-1 font-extrabold text-sm text-white group-hover:text-cyan-400 transition-colors">
                <span>{reel.displayName || reel.username}</span>
                {reel.isVerified && <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />}
              </div>
              <span className="text-[11px] text-slate-300">@{reel.username}</span>
            </div>
          </Link>

          {/* Follow / Following Toggle Button */}
          {!isOwner && (
            <button
              onClick={handleToggleFollow}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-md ${
                isFollowing
                  ? 'bg-white/15 text-slate-200 border border-white/20 hover:bg-white/25'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black shadow-cyan-500/25 active:scale-95'
              }`}
            >
              {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
            </button>
          )}
        </div>

        {/* Caption with Smooth Expand/Collapse */}
        {reel.caption && (
          <div className="text-xs text-slate-100 font-medium leading-relaxed">
            <p className={isCaptionExpanded ? 'whitespace-pre-line' : 'line-clamp-2'}>
              {reel.caption}
            </p>
            {reel.caption.length > 75 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCaptionExpanded(!isCaptionExpanded);
                }}
                className="text-cyan-400 font-bold hover:underline ml-1 cursor-pointer"
              >
                {isCaptionExpanded ? 'less' : 'more'}
              </button>
            )}
          </div>
        )}

        {/* Audio Track Info Marquee Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenAudioModal(audioTrack);
          }}
          className="flex items-center space-x-2 text-[11px] text-cyan-300 font-semibold bg-black/60 hover:bg-black/80 px-3 py-1 rounded-full w-fit backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
        >
          <Music2 className={`w-3.5 h-3.5 text-cyan-400 ${!isMuted && isPlaying ? 'animate-pulse' : ''}`} />
          <span className="truncate max-w-[210px]">Original Audio · {reel.displayName || reel.username}</span>
        </button>
      </div>

      {/* 9. Video Progress Bottom Scrubber Bar */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-30">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
