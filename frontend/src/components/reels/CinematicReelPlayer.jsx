import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Mic,
  MicOff,
  Music,
  UserCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { soundFx } from '../../utils/audioEffects';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SCENES = [
  {
    id: 1,
    title: 'THE HOOK',
    duration: 3.5, // seconds
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-city-traffic-at-night-42261-large.mp4',
    badge: '🔥 STOP BUILDING SLOW',
    badgeColor: 'from-amber-500 to-rose-600',
    narration: 'Stop building social apps the old way.',
    captionText: 'Stop building social apps the OLD WAY.',
    highlightWords: ['OLD WAY', 'Stop building'],
    sfx: 'impact'
  },
  {
    id: 2,
    title: 'THE ARCHITECTURE',
    duration: 5.5,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-coding-on-a-laptop-in-a-dark-room-41885-large.mp4',
    badge: '⚡ SUB-10MS MICROSERVICES',
    badgeColor: 'from-cyan-500 to-indigo-600',
    narration: 'Meet Pulse. Sub-10ms microservices powered by Spring Boot 3 and React 18.',
    captionText: 'Meet Pulse. Sub-10ms microservices with Spring Boot 3 & React 18.',
    highlightWords: ['Pulse.', 'Sub-10ms', 'Spring Boot 3', 'React 18.'],
    sfx: 'whoosh'
  },
  {
    id: 3,
    title: 'REAL-TIME VIDEO & DMs',
    duration: 6.0,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-woman-recording-a-dance-with-her-phone-41489-large.mp4',
    badge: '📹 WEBRTC & 9:16 REELS',
    badgeColor: 'from-fuchsia-500 to-pink-600',
    narration: 'Instant WebRTC video calls, interactive ephemeral stories, and vertical reels.',
    captionText: 'Instant WebRTC Video Calls, Ephemeral Stories & 9:16 Reels.',
    highlightWords: ['WebRTC', 'Video Calls,', 'Ephemeral Stories', '9:16 Reels.'],
    sfx: 'shutter'
  },
  {
    id: 4,
    title: 'SCALE & PERFORMANCE',
    duration: 5.5,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-modern-buildings-in-a-financial-district-42469-large.mp4',
    badge: '🇮🇳 200+ TECH LEADERS',
    badgeColor: 'from-emerald-500 to-teal-600',
    narration: 'Engineered for over 200 top technology leaders across Bengaluru and global hubs.',
    captionText: 'Engineered for 200+ Tech Leaders in Bengaluru & Global Hubs.',
    highlightWords: ['200+ Tech Leaders', 'Bengaluru', 'Global Hubs.'],
    sfx: 'whoosh'
  },
  {
    id: 5,
    title: 'CALL TO ACTION',
    duration: 5.5,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-sun-setting-over-the-ocean-horizon-41571-large.mp4',
    badge: '👑 JOIN THE NETWORK',
    badgeColor: 'from-indigo-500 via-purple-600 to-cyan-500',
    narration: 'Experience the future of social networking. Follow @ravikant and Try Pulse now.',
    captionText: 'Experience The Future. Follow @ravikant & Try Pulse Now.',
    highlightWords: ['Experience The Future.', 'Follow @ravikant', 'Try Pulse Now.'],
    sfx: 'chime'
  }
];

export default function CinematicReelPlayer({ onOpenComments, onOpenShare }) {
  const { user } = useAuth();
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceOverEnabled, setVoiceOverEnabled] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 100 within current scene
  const [likesCount, setLikesCount] = useState(15840);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowingAdmin, setIsFollowingAdmin] = useState(false);
  const [heartPop, setHeartPop] = useState(false);

  const videoRef = useRef(null);
  const bgMusicRef = useRef(null);
  const sceneTimerRef = useRef(null);
  const sceneStartTimeRef = useRef(Date.now());

  const currentScene = SCENES[currentSceneIdx];

  // Initialize Background Music
  useEffect(() => {
    bgMusicRef.current = new Audio('https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3');
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = voiceOverEnabled ? 0.35 : 0.65; // Auto-duck volume when narrator is on

    if (isPlaying && !isMuted) {
      bgMusicRef.current.play().catch(() => {});
    }

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
      soundFx.stopNarrator();
    };
  }, []);

  // Handle Scene Transitions & Voice-Over
  useEffect(() => {
    if (!isPlaying) return;

    // Trigger Scene SFX
    if (!isMuted) {
      if (currentScene.sfx === 'impact') soundFx.playImpactDrop();
      else if (currentScene.sfx === 'whoosh') soundFx.playWhoosh();
      else if (currentScene.sfx === 'shutter') soundFx.playCameraShutter();
      else if (currentScene.sfx === 'chime') soundFx.playChimeCTA();
    }

    // Trigger Voice-Over Narrator
    if (voiceOverEnabled && !isMuted) {
      // Auto-duck music
      if (bgMusicRef.current) bgMusicRef.current.volume = 0.2;
      soundFx.speakNarrator(currentScene.narration, () => {
        // Restore music volume on speech end
        if (bgMusicRef.current && !isMuted) {
          bgMusicRef.current.volume = 0.6;
        }
      });
    }

    // Reset video to start
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }

    // Scene Progress Interval
    setProgress(0);
    sceneStartTimeRef.current = Date.now();
    const intervalMs = 40;
    const sceneDurationMs = currentScene.duration * 1000;

    sceneTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - sceneStartTimeRef.current;
      const pct = Math.min(100, (elapsed / sceneDurationMs) * 100);
      setProgress(pct);

      if (elapsed >= sceneDurationMs) {
        clearInterval(sceneTimerRef.current);
        handleNextScene();
      }
    }, intervalMs);

    return () => {
      clearInterval(sceneTimerRef.current);
    };
  }, [currentSceneIdx, isPlaying, voiceOverEnabled]);

  const handleNextScene = () => {
    if (currentSceneIdx < SCENES.length - 1) {
      setCurrentSceneIdx(prev => prev + 1);
    } else {
      // Loop back to start smoothly
      setCurrentSceneIdx(0);
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIdx > 0) {
      setCurrentSceneIdx(prev => prev - 1);
    }
  };

  const togglePlayPause = () => {
    const nextPlay = !isPlaying;
    setIsPlaying(nextPlay);

    if (videoRef.current) {
      if (nextPlay) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
    }

    if (bgMusicRef.current) {
      if (nextPlay && !isMuted) bgMusicRef.current.play().catch(() => {});
      else bgMusicRef.current.pause();
    }

    if (!nextPlay) soundFx.stopNarrator();
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (bgMusicRef.current) {
      if (nextMuted) bgMusicRef.current.pause();
      else if (isPlaying) bgMusicRef.current.play().catch(() => {});
    }

    if (nextMuted) soundFx.stopNarrator();
    else if (voiceOverEnabled && isPlaying) {
      soundFx.speakNarrator(currentScene.narration);
    }

    toast(nextMuted ? '🔇 Audio Muted' : '🔊 Audio ON (Voice-Over + Music)', { id: 'cinematic-sound' });
  };

  const toggleVoiceOver = () => {
    const nextVoice = !voiceOverEnabled;
    setVoiceOverEnabled(nextVoice);
    if (!nextVoice) {
      soundFx.stopNarrator();
      if (bgMusicRef.current && !isMuted) bgMusicRef.current.volume = 0.65;
      toast('🎙️ Voice-Over Off (Music Only)', { id: 'voice-toggle' });
    } else {
      soundFx.speakNarrator(currentScene.narration);
      toast.success('🎙️ Natural Voice-Over ON', { id: 'voice-toggle' });
    }
  };

  const handleDoubleTap = () => {
    soundFx.playLikePop();
    setHeartPop(true);
    if (!isLiked) {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
    }
    setTimeout(() => setHeartPop(false), 900);
  };

  const handleFollowAdmin = () => {
    soundFx.playChimeCTA();
    setIsFollowingAdmin(prev => !prev);
    toast.success(isFollowingAdmin ? 'Unfollowed' : '👑 Following Chief Admin @ravikant!');
  };

  return (
    <div className="relative w-full h-[calc(100vh-5.5rem)] snap-start bg-slate-950 rounded-3xl overflow-hidden shadow-2xl mb-6 border border-cyan-500/40 select-none flex items-center justify-center group">
      {/* Background Video with Smooth Ken Burns Zoom Animation */}
      <video
        ref={videoRef}
        src={currentScene.videoUrl}
        className="w-full h-full object-cover scale-105 transition-transform duration-700 ease-out cursor-pointer"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onClick={togglePlayPause}
        onDoubleClick={handleDoubleTap}
      />

      {/* Cinematic Dark Vignette & Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/60 pointer-events-none" />

      {/* Top Segmented Story/Reel Progress Bars */}
      <div className="absolute top-3 inset-x-4 z-30 flex items-center space-x-1.5">
        {SCENES.map((scene, idx) => {
          const isActive = idx === currentSceneIdx;
          const isPassed = idx < currentSceneIdx;

          return (
            <button
              key={scene.id}
              onClick={() => setCurrentSceneIdx(idx)}
              className="flex-1 h-1.5 rounded-full bg-white/25 overflow-hidden transition-all relative cursor-pointer"
            >
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  isPassed
                    ? 'w-full bg-cyan-400'
                    : isActive
                    ? 'bg-gradient-to-r from-cyan-400 to-fuchsia-400'
                    : 'w-0'
                }`}
                style={{ width: isActive ? `${progress}%` : isPassed ? '100%' : '0%' }}
              />
            </button>
          );
        })}
      </div>

      {/* Top Bar Header & Controls */}
      <div className="absolute top-7 inset-x-4 z-30 flex items-center justify-between">
        {/* Live Scene Badge */}
        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider text-white uppercase bg-gradient-to-r ${currentScene.badgeColor} shadow-lg shadow-cyan-500/20 flex items-center gap-1 animate-pulse`}>
            <Sparkles className="w-3 h-3" />
            {currentScene.badge}
          </span>
          <span className="text-[11px] font-bold text-slate-300 bg-black/50 px-2 py-0.5 rounded-md border border-white/10">
            {currentSceneIdx + 1}/{SCENES.length}
          </span>
        </div>

        {/* Action Controls (Voice Toggle, Sound, Play/Pause) */}
        <div className="flex items-center space-x-2">
          {/* Voice-Over Toggle Button */}
          <button
            onClick={toggleVoiceOver}
            className={`p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
              voiceOverEnabled
                ? 'bg-fuchsia-500/30 text-fuchsia-300 border-fuchsia-400/50 shadow-lg shadow-fuchsia-500/20'
                : 'bg-black/60 text-slate-400 border-white/10'
            }`}
            title={voiceOverEnabled ? 'Voice-Over Narrator ON' : 'Voice-Over OFF'}
          >
            {voiceOverEnabled ? <Mic className="w-4 h-4 text-fuchsia-400 animate-pulse" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Sound / Music Mute Button */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
              !isMuted
                ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400/50 shadow-lg shadow-cyan-500/30'
                : 'bg-black/60 text-slate-400 border-white/10'
            }`}
            title={isMuted ? 'Click to Play Audio' : 'Mute Sound'}
          >
            {!isMuted ? <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Play / Pause Toggle */}
          <button
            onClick={togglePlayPause}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 hover:bg-black/80 transition-colors cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Double Tap Neon Heart Animation */}
      {heartPop && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 animate-scale-up">
          <div className="relative">
            <Heart className="w-28 h-28 text-rose-500 fill-rose-500 drop-shadow-[0_0_35px_rgba(244,63,94,0.95)] animate-bounce" />
            <Sparkles className="w-10 h-10 text-amber-300 absolute -top-3 -right-3 animate-spin" />
          </div>
        </div>
      )}

      {/* Screen Tap Navigation Zones */}
      <button
        onClick={handlePrevScene}
        className="absolute left-0 inset-y-24 w-1/4 z-10 opacity-0 hover:opacity-10 transition-opacity flex items-center justify-start pl-2 cursor-pointer"
        title="Previous Scene"
      >
        <ChevronLeft className="w-8 h-8 text-white" />
      </button>
      <button
        onClick={handleNextScene}
        className="absolute right-0 inset-y-24 w-1/4 z-10 opacity-0 hover:opacity-10 transition-opacity flex items-center justify-end pr-2 cursor-pointer"
        title="Next Scene"
      >
        <ChevronRight className="w-8 h-8 text-white" />
      </button>

      {/* Center Cinematic Captions with Synchronized Word Highlighting */}
      <div className="absolute inset-x-5 bottom-28 z-20 pointer-events-none flex flex-col items-center text-center space-y-2">
        <div className="p-3.5 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/15 shadow-2xl max-w-[340px] animate-fade-in">
          <p className="text-sm font-extrabold tracking-wide text-white leading-relaxed">
            {currentScene.captionText.split(' ').map((word, i) => {
              const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
              const isHighlighted = currentScene.highlightWords.some(hw => hw.includes(cleanWord));

              return (
                <span
                  key={i}
                  className={`inline-block mx-0.5 transition-colors ${
                    isHighlighted
                      ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] font-black scale-105'
                      : 'text-slate-100'
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </p>
        </div>
      </div>

      {/* Right Floating Actions Strip */}
      <div className="absolute right-3.5 bottom-16 z-30 flex flex-col items-center space-y-4">
        {/* Like Button */}
        <button
          onClick={() => {
            soundFx.playLikePop();
            setIsLiked(!isLiked);
            setLikesCount(prev => (isLiked ? prev - 1 : prev + 1));
          }}
          className="flex flex-col items-center group cursor-pointer"
        >
          <div className={`p-3 rounded-full backdrop-blur-md transition-all active:scale-90 ${
            isLiked
              ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40 shadow-lg shadow-rose-500/30'
              : 'bg-black/60 text-white hover:bg-black/80 border border-white/10'
          }`}>
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-rose-500 animate-bounce' : ''}`} />
          </div>
          <span className="text-[11px] font-bold text-white mt-1 drop-shadow">
            {(likesCount / 1000).toFixed(1)}k
          </span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => onOpenComments && onOpenComments({ id: 1, caption: currentScene.narration })}
          className="flex flex-col items-center group cursor-pointer"
        >
          <div className="p-3 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-all active:scale-90 border border-white/10">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-white mt-1 drop-shadow">
            1.2k
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => onOpenShare && onOpenShare({ id: 1, caption: currentScene.narration })}
          className="flex flex-col items-center group cursor-pointer"
        >
          <div className="p-3 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-all active:scale-90 border border-white/10">
            <Share2 className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-white mt-1 drop-shadow">
            Share
          </span>
        </button>

        {/* Bookmark Button */}
        <button
          onClick={() => {
            soundFx.playReactionBubble();
            setIsSaved(!isSaved);
            toast.success(isSaved ? 'Removed from bookmarks' : 'Saved Masterclass Reel! 🔖');
          }}
          className="flex flex-col items-center group cursor-pointer"
        >
          <div className={`p-3 rounded-full backdrop-blur-md transition-all active:scale-90 ${
            isSaved
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/20'
              : 'bg-black/60 text-white hover:bg-black/80 border border-white/10'
          }`}>
            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-cyan-400' : ''}`} />
          </div>
          <span className="text-[11px] font-bold text-white mt-1 drop-shadow">
            Save
          </span>
        </button>

        {/* Animated Rotating Vinyl Disc with Equalizer Bars */}
        <div className="pt-2 flex flex-col items-center">
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
        </div>
      </div>

      {/* Bottom Creator Card & Call-To-Action */}
      <div className="absolute bottom-0 inset-x-0 p-5 pr-16 bg-gradient-to-t from-black/95 via-black/60 to-transparent text-white z-20 space-y-2">
        {/* Creator Info Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/uploads/ravikant_avatar.jpg"
              alt="Ravikant Singh"
              className="w-10 h-10 rounded-full border-2 border-cyan-400 object-cover shadow-lg"
            />
            <div>
              <div className="flex items-center gap-1 font-extrabold text-sm text-white">
                <span>Ravikant Singh</span>
                <span className="text-cyan-400 text-xs font-black">✓</span>
              </div>
              <span className="text-[11px] text-cyan-300 font-medium">@ravikant • Chief Admin</span>
            </div>
          </div>

          {/* In-Reel Follow Button */}
          <button
            onClick={handleFollowAdmin}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-lg ${
              isFollowingAdmin
                ? 'bg-white/20 text-white border border-white/30'
                : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black shadow-cyan-500/30 active:scale-95'
            }`}
          >
            {isFollowingAdmin ? 'Following' : 'Follow +'}
          </button>
        </div>

        {/* Audio Track Marquee Pill */}
        <button
          onClick={toggleMute}
          className="flex items-center space-x-2 text-[11px] text-cyan-300 font-semibold bg-black/60 hover:bg-black/80 px-3 py-1 rounded-full w-fit backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
        >
          <Music className={`w-3.5 h-3.5 text-cyan-400 ${!isMuted && isPlaying ? 'animate-pulse' : ''}`} />
          <span className="truncate max-w-[220px]">Neon Cyber Lofi • Pulse Original Master</span>
        </button>
      </div>
    </div>
  );
}
