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
  ChevronLeft,
  Flame,
  Zap,
  Activity,
  Sliders,
  Scissors
} from 'lucide-react';
import { soundFx } from '../../utils/audioEffects';
import { useAuth } from '../../context/AuthContext';
import MusicPickerModal, { CURATED_MUSIC_LIBRARY } from './MusicPickerModal';
import toast from 'react-hot-toast';

const CINEMATIC_SCENES = [
  {
    id: 1,
    title: 'THE HOOK',
    duration: 3.5,
    videoUrl: '/sample-videos/sample1.mp4',
    badge: '⚡ PARADIGM SHIFT',
    badgeColor: 'from-amber-500 via-rose-600 to-red-600',
    narration: 'Stop building social apps the old way.',
    captionWords: [
      { text: 'Stop', highlight: false },
      { text: 'building', highlight: false },
      { text: 'social', highlight: false },
      { text: 'apps', highlight: false },
      { text: 'the', highlight: false },
      { text: 'OLD', highlight: true, color: 'text-amber-300' },
      { text: 'WAY.', highlight: true, color: 'text-rose-400' }
    ],
    sfx: 'impact',
    zoomDirection: 'zoom-in',
    speedRamp: 'fast-to-normal'
  },
  {
    id: 2,
    title: 'CORE ARCHITECTURE',
    duration: 5.5,
    videoUrl: '/sample-videos/sample2.mp4',
    badge: '🚀 SUB-10MS LATENCY',
    badgeColor: 'from-cyan-500 via-blue-600 to-indigo-600',
    narration: 'Meet Pulse. Sub-10ms microservices engineered with Spring Boot 3 and React 18.',
    captionWords: [
      { text: 'Meet', highlight: false },
      { text: 'Pulse.', highlight: true, color: 'text-cyan-400' },
      { text: 'Sub-10ms', highlight: true, color: 'text-emerald-300' },
      { text: 'microservices', highlight: false },
      { text: 'with', highlight: false },
      { text: 'Spring', highlight: true, color: 'text-green-400' },
      { text: 'Boot', highlight: true, color: 'text-green-400' },
      { text: '3', highlight: true, color: 'text-green-400' },
      { text: '&', highlight: false },
      { text: 'React.', highlight: true, color: 'text-cyan-300' }
    ],
    sfx: 'typing',
    zoomDirection: 'zoom-out',
    speedRamp: 'normal'
  },
  {
    id: 3,
    title: 'LIVE INTERACTION',
    duration: 6.0,
    videoUrl: '/sample-videos/sample3.mp4',
    badge: '📹 WEBRTC & 9:16 REELS',
    badgeColor: 'from-fuchsia-500 via-pink-600 to-rose-500',
    narration: 'Instant WebRTC video calls, interactive ephemeral stories, and vertical reels.',
    captionWords: [
      { text: 'Instant', highlight: false },
      { text: 'WebRTC', highlight: true, color: 'text-fuchsia-400' },
      { text: 'Video', highlight: true, color: 'text-fuchsia-300' },
      { text: 'Calls,', highlight: true, color: 'text-fuchsia-300' },
      { text: 'Ephemeral', highlight: true, color: 'text-purple-300' },
      { text: 'Stories', highlight: true, color: 'text-purple-300' },
      { text: '&', highlight: false },
      { text: '9:16', highlight: true, color: 'text-pink-400' },
      { text: 'Reels.', highlight: true, color: 'text-pink-400' }
    ],
    sfx: 'shutter',
    zoomDirection: 'zoom-in',
    speedRamp: 'speed-snap'
  },
  {
    id: 4,
    title: 'SCALE & COMMUNITY',
    duration: 5.5,
    videoUrl: '/sample-videos/sample1.mp4',
    badge: '🇮🇳 200+ VERIFIED LEADERS',
    badgeColor: 'from-emerald-500 via-teal-600 to-cyan-600',
    narration: 'Engineered for over 200 top technology leaders across Bengaluru and Silicon Valley.',
    captionWords: [
      { text: 'Engineered', highlight: false },
      { text: 'for', highlight: false },
      { text: '200+', highlight: true, color: 'text-emerald-400' },
      { text: 'Tech', highlight: true, color: 'text-emerald-300' },
      { text: 'Leaders', highlight: true, color: 'text-emerald-300' },
      { text: 'in', highlight: false },
      { text: 'Bengaluru', highlight: true, color: 'text-amber-300' },
      { text: '&', highlight: false },
      { text: 'Global', highlight: false },
      { text: 'Hubs.', highlight: false }
    ],
    sfx: 'whoosh',
    zoomDirection: 'pan-up',
    speedRamp: 'smooth-glide'
  },
  {
    id: 5,
    title: 'THE CALL TO ACTION',
    duration: 5.5,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    badge: '👑 JOIN PULSE SOCIAL HUB',
    badgeColor: 'from-cyan-500 via-indigo-600 to-fuchsia-500',
    narration: 'Experience the future of social networking. Follow @ravikant and Try Pulse now.',
    captionWords: [
      { text: 'Experience', highlight: true, color: 'text-white' },
      { text: 'The', highlight: false },
      { text: 'Future.', highlight: true, color: 'text-cyan-400' },
      { text: 'Follow', highlight: true, color: 'text-amber-300' },
      { text: '@ravikant', highlight: true, color: 'text-cyan-300' },
      { text: '&', highlight: false },
      { text: 'Try', highlight: true, color: 'text-fuchsia-400' },
      { text: 'Pulse', highlight: true, color: 'text-fuchsia-300' },
      { text: 'Now.', highlight: true, color: 'text-fuchsia-300' }
    ],
    sfx: 'chime',
    zoomDirection: 'zoom-out',
    speedRamp: 'fade-out'
  }
];

export default function CinematicReelPlayer({ onOpenComments, onOpenShare }) {
  const { user } = useAuth();
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceOverEnabled, setVoiceOverEnabled] = useState(true);
  const [progress, setProgress] = useState(0);
  const [likesCount, setLikesCount] = useState(16420);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowingAdmin, setIsFollowingAdmin] = useState(false);
  const [heartPop, setHeartPop] = useState(false);
  const [cameraShake, setCameraShake] = useState(false);

  // User-Controlled Music State
  const [selectedMusic, setSelectedMusic] = useState({
    ...CURATED_MUSIC_LIBRARY[0],
    volume: 75,
    startTime: 0,
    autoDucking: true
  });
  const [showMusicPicker, setShowMusicPicker] = useState(false);

  const videoRef = useRef(null);
  const bgMusicRef = useRef(null);
  const sceneTimerRef = useRef(null);
  const sceneStartTimeRef = useRef(Date.now());

  const currentScene = CINEMATIC_SCENES[currentSceneIdx];

  // Initialize and update Background Music Stream when selectedMusic changes
  useEffect(() => {
    if (!selectedMusic) {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
      return;
    }

    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
    }

    const audio = new Audio(selectedMusic.audioUrl);
    audio.loop = true;
    audio.currentTime = selectedMusic.startTime || 0;
    const initialVol = (selectedMusic.volume || 75) / 100;
    audio.volume = voiceOverEnabled && selectedMusic.autoDucking ? initialVol * 0.25 : initialVol;
    bgMusicRef.current = audio;

    if (isPlaying && !isMuted) {
      audio.play().catch(() => {});
    }

    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [selectedMusic?.id, selectedMusic?.audioUrl, selectedMusic?.startTime]);

  // Update volume dynamically
  useEffect(() => {
    if (bgMusicRef.current && selectedMusic) {
      const baseVol = (selectedMusic.volume || 75) / 100;
      bgMusicRef.current.volume = isMuted
        ? 0
        : voiceOverEnabled && selectedMusic.autoDucking
        ? baseVol * 0.25
        : baseVol;
    }
  }, [selectedMusic?.volume, selectedMusic?.autoDucking, voiceOverEnabled, isMuted]);

  // Handle Scene Transitions, Precise Sound Design & Voice-Over Narration
  useEffect(() => {
    if (!isPlaying) return;

    // Trigger Camera Shake on Impact moments
    if (currentScene.sfx === 'impact') {
      setCameraShake(true);
      setTimeout(() => setCameraShake(false), 500);
    }

    // Precise Sound Effects Trigger
    if (!isMuted) {
      if (currentScene.sfx === 'impact') {
        soundFx.playImpactDrop();
        setTimeout(() => soundFx.playWhoosh(), 250);
      } else if (currentScene.sfx === 'typing') {
        soundFx.playCinematicRiser();
        setTimeout(() => soundFx.playKeyboardTyping(), 600);
      } else if (currentScene.sfx === 'shutter') {
        soundFx.playCameraShutter();
        setTimeout(() => soundFx.playNotificationDing(), 700);
      } else if (currentScene.sfx === 'whoosh') {
        soundFx.playWhoosh();
      } else if (currentScene.sfx === 'chime') {
        soundFx.playChimeCTA();
      }
    }

    // Natural Voice-Over Narrator with Auto-Ducking
    if (voiceOverEnabled && !isMuted) {
      if (bgMusicRef.current && selectedMusic) {
        const ducked = ((selectedMusic.volume || 75) / 100) * 0.25;
        bgMusicRef.current.volume = ducked; // Duck music down
      }
      soundFx.speakNarrator(currentScene.narration, () => {
        // Smoothly restore music level after speech finishes
        if (bgMusicRef.current && !isMuted && selectedMusic) {
          bgMusicRef.current.volume = (selectedMusic.volume || 75) / 100;
        }
      });
    }

    // Video Playback synchronization
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }

    // Pacing Timer & Progress
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
  }, [currentSceneIdx, isPlaying, voiceOverEnabled, selectedMusic, isMuted]);

  const handleNextScene = () => {
    if (currentSceneIdx < CINEMATIC_SCENES.length - 1) {
      setCurrentSceneIdx(prev => prev + 1);
    } else {
      setCurrentSceneIdx(0); // Seamless loop
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
      if (bgMusicRef.current && !isMuted && selectedMusic) {
        bgMusicRef.current.volume = (selectedMusic.volume || 75) / 100;
      }
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
    <div className={`relative w-full h-[calc(100vh-8.5rem)] snap-start bg-slate-950 rounded-3xl overflow-hidden shadow-2xl mb-6 border border-cyan-500/40 select-none flex items-center justify-center group ${
      cameraShake ? 'animate-bounce' : ''
    }`}>
      {/* High-Definition Video Clip with Dynamic Ken-Burns Scale */}
      <video
        ref={videoRef}
        src={currentScene.videoUrl}
        className={`w-full h-full object-cover transition-transform duration-1000 ease-out cursor-pointer ${
          currentScene.zoomDirection === 'zoom-in'
            ? 'scale-110'
            : currentScene.zoomDirection === 'zoom-out'
            ? 'scale-100'
            : 'scale-105'
        }`}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onClick={togglePlayPause}
        onDoubleClick={handleDoubleTap}
      />

      {/* Subtle Top Gradient for Status Contrast while keeping Video Bright */}
      <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

      {/* Top Segmented Story / Reel Progress Timeline */}
      <div className="absolute top-3 inset-x-4 z-30 flex items-center space-x-1.5">
        {CINEMATIC_SCENES.map((scene, idx) => {
          const isActive = idx === currentSceneIdx;
          const isPassed = idx < currentSceneIdx;

          return (
            <button
              key={scene.id}
              onClick={() => {
                soundFx.playSwipeTick();
                setCurrentSceneIdx(idx);
              }}
              className="flex-1 h-1.5 rounded-full bg-white/25 overflow-hidden transition-all relative cursor-pointer hover:bg-white/40"
              title={`Jump to Scene ${idx + 1}: ${scene.title}`}
            >
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  isPassed
                    ? 'w-full bg-cyan-400'
                    : isActive
                    ? 'bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400'
                    : 'w-0'
                }`}
                style={{ width: isActive ? `${progress}%` : isPassed ? '100%' : '0%' }}
              />
            </button>
          );
        })}
      </div>

      {/* Top Header Controls Strip */}
      <div className="absolute top-7 inset-x-4 z-30 flex items-center justify-between">
        {/* Active Scene Badge */}
        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider text-white uppercase bg-gradient-to-r ${currentScene.badgeColor} shadow-lg shadow-cyan-500/20 flex items-center gap-1 animate-pulse`}>
            <Sparkles className="w-3 h-3" />
            {currentScene.badge}
          </span>
          <span className="text-[11px] font-bold text-slate-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
            {currentSceneIdx + 1}/{CINEMATIC_SCENES.length}
          </span>
        </div>

        {/* Audio & Playback Controls */}
        <div className="flex items-center space-x-2">
          {/* Add / Change Music Button */}
          <button
            onClick={() => {
              soundFx.playSwipeTick();
              setShowMusicPicker(true);
            }}
            className="p-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-400/40 backdrop-blur-md transition-all cursor-pointer flex items-center gap-1"
            title="Choose / Change Music Track"
          >
            <Music className="w-4 h-4 text-cyan-400" />
          </button>

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

          {/* Play / Pause Button */}
          <button
            onClick={togglePlayPause}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 hover:bg-black/80 transition-colors cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Double Tap Neon Heart Burst */}
      {heartPop && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 animate-scale-up">
          <div className="relative">
            <Heart className="w-28 h-28 text-rose-500 fill-rose-500 drop-shadow-[0_0_35px_rgba(244,63,94,0.95)] animate-bounce" />
            <Sparkles className="w-10 h-10 text-amber-300 absolute -top-3 -right-3 animate-spin" />
          </div>
        </div>
      )}

      {/* Tap Left / Right Zones to Jump Scenes */}
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

      {/* Viral Animated Word-By-Word Captions */}
      <div className="absolute inset-x-5 bottom-28 z-20 pointer-events-none flex flex-col items-center text-center space-y-2">
        <div className="p-3.5 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/15 shadow-2xl max-w-[340px] animate-fade-in">
          <p className="text-sm font-extrabold tracking-wide leading-relaxed">
            {currentScene.captionWords.map((cw, i) => (
              <span
                key={i}
                className={`inline-block mx-0.5 transition-all ${
                  cw.highlight
                    ? `${cw.color || 'text-cyan-400'} drop-shadow-[0_0_12px_rgba(6,182,212,0.9)] font-black scale-105`
                    : 'text-slate-100'
                }`}
              >
                {cw.text}
              </span>
            ))}
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
            1.4k
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

        {/* Animated Rotating Vinyl Disc with Equalizer Bars (Click opens Music Picker!) */}
        <div
          onClick={() => {
            soundFx.playSwipeTick();
            setShowMusicPicker(true);
          }}
          className="pt-2 flex flex-col items-center cursor-pointer group"
          title="Click to Choose / Trim Music"
        >
          <div className={`w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 via-indigo-900 to-fuchsia-600 p-0.5 border border-white/30 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform ${isPlaying && !isMuted ? 'animate-spin-slow' : ''}`}>
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

      {/* Bottom Creator Card & User-Controlled Music Pill */}
      <div className="absolute bottom-0 inset-x-0 p-5 pr-16 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white z-20 space-y-2">
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

          {/* Glowing Follow Trigger Button */}
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

        {/* Audio Track Info & Custom Music Trigger */}
        <button
          onClick={() => {
            soundFx.playSwipeTick();
            setShowMusicPicker(true);
          }}
          className="flex items-center space-x-2 text-[11px] text-cyan-300 font-semibold bg-black/60 hover:bg-black/80 px-3 py-1 rounded-full w-fit backdrop-blur-md border border-white/10 transition-colors cursor-pointer group"
          title="Click to Choose or Trim Music"
        >
          <Music className={`w-3.5 h-3.5 text-cyan-400 ${!isMuted && isPlaying ? 'animate-pulse' : ''}`} />
          <span className="truncate max-w-[200px]">
            {selectedMusic ? `${selectedMusic.title} • ${selectedMusic.artist}` : 'No Music Selected (Click to Add)'}
          </span>
          <span className="text-[10px] text-slate-400 group-hover:text-cyan-300 ml-1">✏️</span>
        </button>
      </div>

      {/* Music Selection, Trimming & Mixing Modal */}
      <MusicPickerModal
        isOpen={showMusicPicker}
        onClose={() => setShowMusicPicker(false)}
        selectedMusic={selectedMusic}
        onSelectMusic={(music) => {
          setSelectedMusic(music);
          if (music) {
            toast.success(`Music applied: "${music.title}" 🎶`);
          } else {
            toast('Music removed');
          }
        }}
      />
    </div>
  );
}
