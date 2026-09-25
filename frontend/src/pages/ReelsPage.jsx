import React, { useState, useEffect, useRef, useCallback } from 'react';
import { postService, reelService } from '../services/services';
import { pexelsReelsService } from '../services/pexelsReelsService';
import ReelCard from '../components/reels/ReelCard';
import CinematicReelPlayer from '../components/reels/CinematicReelPlayer';
import ReelCommentsPanel from '../components/reels/ReelCommentsPanel';
import ReelAudioModal from '../components/reels/ReelAudioModal';
import CreateReelModal from '../components/reels/CreateReelModal';
import { ShareModal } from '../components/post/ShareModal';
import { useAuth } from '../context/AuthContext';
import { soundFx } from '../utils/audioEffects';
import {
  Flame,
  Film,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  Volume2,
  VolumeX,
  Play,
  ExternalLink,
  PlusCircle,
  Video
} from 'lucide-react';
import toast from 'react-hot-toast';

// Standardized Reel normalizer across all backend entities and stock providers
export function normalizeReelItem(item, index = 0) {
  if (!item) return null;

  const isPost = Boolean(item.postType || item.media);
  const isPexels = Boolean(item.creatorUsername || item.creatorName || (typeof item.id === 'string' && String(item.id).startsWith('yt_')));
  const isDedicatedReel = Boolean(item.music || item.originalAudioVolume !== undefined || (!isPost && !isPexels));

  const id = item.id;
  let videoUrl = item.videoUrl || '';
  if (item.media && item.media.length > 0 && item.media[0]?.url) {
    videoUrl = item.media[0].url;
  }
  const thumbnailUrl = item.thumbnailUrl || item.thumbnail || '';
  const caption = item.caption || item.title || '';
  const duration = item.duration || 20.0;

  // Author information resolution
  let authorId = null;
  let username = 'creator';
  let displayName = 'Pulse Creator';
  let avatarUrl = '';
  let isVerified = false;

  if (item.user && typeof item.user === 'object') {
    authorId = item.user.id;
    username = item.user.username || username;
    displayName = item.user.displayName || username;
    avatarUrl = item.user.avatarUrl || '';
    isVerified = Boolean(item.user.isVerified);
  } else if (item.creatorUsername) {
    username = item.creatorUsername;
    displayName = item.creatorName || username;
    avatarUrl = item.creatorAvatar || '';
    isVerified = true;
  } else {
    authorId = item.userId;
    username = item.username || username;
    displayName = item.displayName || username;
    avatarUrl = item.avatarUrl || '';
    isVerified = Boolean(item.isVerified);
  }

  if (!avatarUrl) {
    avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
  }

  const likesCount = item.likesCount ?? item.likes ?? 0;
  const commentsCount = item.commentsCount ?? item.comments ?? 0;
  const sharesCount = item.sharesCount ?? item.shares ?? 0;
  const viewsCount = item.views ?? item.viewCount ?? 0;
  const isLiked = Boolean(item.isLiked || item.liked);
  const isSaved = Boolean(item.isSaved || item.saved);
  const isFollowing = Boolean(item.isFollowing);

  const musicObj = item.music || item.audioTrack || null;
  const audioTitle = musicObj?.title || item.audioName || `Original Audio · ${displayName}`;
  const audioArtist = musicObj?.artist || displayName;
  const audioUrl = musicObj?.audioUrl || '';
  const audioStartTime = item.audioStartTime || 0;
  const audioEndTime = item.audioEndTime || (audioStartTime + duration);
  const originalAudioVolume = item.originalAudioVolume !== undefined ? item.originalAudioVolume : 100;
  const musicVolume = item.musicVolume !== undefined ? item.musicVolume : 80;

  return {
    id,
    uniqueKey: `${isDedicatedReel ? 'reel' : isPost ? 'post' : 'px'}-${id}-${index}`,
    videoUrl,
    thumbnailUrl,
    caption,
    duration,
    authorId,
    username,
    displayName,
    avatarUrl,
    isVerified,
    likesCount,
    commentsCount,
    sharesCount,
    viewsCount,
    isLiked,
    isSaved,
    isFollowing,
    audioTrack: musicObj || { title: audioTitle, artist: audioArtist, audioUrl },
    audioTitle,
    audioArtist,
    audioUrl,
    audioStartTime,
    audioEndTime,
    originalAudioVolume,
    musicVolume,
    sourceType: isDedicatedReel ? 'DEDICATED_REEL' : isPost ? 'POST_VIDEO' : 'STOCK_HD',
    raw: item
  };
}

export default function ReelsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('feed'); // Default to full interactive feed!
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeReelIdx, setActiveReelIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Active Modals state
  const [activeCommentsReel, setActiveCommentsReel] = useState(null);
  const [activeShareReel, setActiveShareReel] = useState(null);
  const [activeAudioTrack, setActiveAudioTrack] = useState(null);

  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const wheelLockRef = useRef(false);

  // Fetch Reels from Backend + Pexels HD Service
  useEffect(() => {
    fetchReels(page);
  }, [page]);

  const fetchReels = async (pageNum) => {
    try {
      setLoading(true);

      // 1. Fetch Backend Dedicated 20s Reels first
      let fetched = [];
      try {
        const res = await reelService.getReels(pageNum, 15);
        const data = res.data?.data || res.data;
        if (data) {
          fetched = data.reels || (Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.warn('Dedicated reel service fetch notice:', e);
      }

      // 2. Also fetch video posts from postService to enrich the feed with user videos
      let postReels = [];
      if (pageNum === 1) {
        try {
          const postRes = await postService.getReels(1, 10);
          const pData = postRes.data?.data || postRes.data;
          if (pData) {
            postReels = pData.reels || (Array.isArray(pData) ? pData : []);
          }
        } catch (err2) {}
      }

      // 3. Fetch Pexels 100+ HD Vertical Videos to ensure complete 100+ feed
      const pexelsRes = await pexelsReelsService.fetchReels(pageNum, 12);
      const pexelsList = pexelsRes.reels || [];

      // Combine & standard normalize all items
      const combined = [...fetched, ...postReels, ...pexelsList];
      const normalized = combined
        .map((r, idx) => normalizeReelItem(r, idx))
        .filter(Boolean);

      // Deduplicate by unique key or videoUrl
      const seen = new Set();
      const deduplicated = [];
      for (const r of normalized) {
        const dedupeKey = `${r.sourceType}-${r.id}-${r.videoUrl}`;
        if (!seen.has(dedupeKey)) {
          seen.add(dedupeKey);
          deduplicated.push(r);
        }
      }

      setReels(prev => (pageNum === 1 ? deduplicated : [...prev, ...deduplicated]));
      setHasMore(deduplicated.length > 0);
    } catch (err) {
      console.error('Error fetching reels:', err);
      toast.error('Failed to load reels');
    } finally {
      setLoading(false);
    }
  };

  // Setup IntersectionObserver for auto-playing active Reel
  useEffect(() => {
    if (activeTab !== 'feed') return;

    const options = {
      root: containerRef.current,
      rootMargin: '0px',
      threshold: 0.65 // 65% of reel in viewport
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-reel-index'), 10);
          if (!isNaN(index)) {
            setActiveReelIdx(index);
          }
        }
      });
    }, options);

    const reelElements = containerRef.current?.querySelectorAll('.reel-item');
    reelElements?.forEach(el => observerRef.current.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [reels, activeTab]);

  // Infinite Scroll Trigger when reaching near bottom
  const handleScroll = () => {
    if (!containerRef.current || loading || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 600) {
      setPage(prev => prev + 1);
    }
  };

  const scrollToNextReel = useCallback(() => {
    if (activeReelIdx < reels.length - 1) {
      const nextIdx = activeReelIdx + 1;
      const nextEl = containerRef.current?.querySelector(`[data-reel-index="${nextIdx}"]`);
      nextEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveReelIdx(nextIdx);
    }
  }, [activeReelIdx, reels.length]);

  const scrollToPrevReel = useCallback(() => {
    if (activeReelIdx > 0) {
      const prevIdx = activeReelIdx - 1;
      const prevEl = containerRef.current?.querySelector(`[data-reel-index="${prevIdx}"]`);
      prevEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveReelIdx(prevIdx);
    }
  }, [activeReelIdx]);

  // Mouse Wheel smooth snapping handler
  const handleWheel = useCallback((e) => {
    if (activeTab !== 'feed' || activeCommentsReel || activeShareReel || activeAudioTrack || isCreateModalOpen) return;
    if (wheelLockRef.current) return;

    if (Math.abs(e.deltaY) > 35) {
      wheelLockRef.current = true;
      if (e.deltaY > 0) {
        scrollToNextReel();
      } else {
        scrollToPrevReel();
      }
      setTimeout(() => {
        wheelLockRef.current = false;
      }, 500);
    }
  }, [activeTab, activeCommentsReel, activeShareReel, activeAudioTrack, isCreateModalOpen, scrollToNextReel, scrollToPrevReel]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: true });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (activeCommentsReel || activeShareReel || activeAudioTrack || isCreateModalOpen) return;

    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'j') {
      e.preventDefault();
      scrollToNextReel();
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'k') {
      e.preventDefault();
      scrollToPrevReel();
    } else if (e.key === 'Home') {
      e.preventDefault();
      const firstEl = containerRef.current?.querySelector(`[data-reel-index="0"]`);
      firstEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveReelIdx(0);
    } else if (e.key === 'm' || e.key === 'M') {
      setIsMuted(prev => !prev);
      toast(isMuted ? '🔊 Audio Unmuted' : '🔇 Audio Muted', { id: 'reel-mute-kb' });
    }
  }, [activeReelIdx, reels.length, activeCommentsReel, activeShareReel, activeAudioTrack, isCreateModalOpen, isMuted, scrollToNextReel, scrollToPrevReel]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleCommentCountChange = (reelId, delta) => {
    setReels(prev =>
      prev.map(r =>
        r.id === reelId
          ? { ...r, commentsCount: Math.max(0, (r.commentsCount || 0) + delta) }
          : r
      )
    );
  };

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] flex flex-col items-center relative">
      {/* Top Segmented Mode Header */}
      <div className="sticky top-0 z-40 w-full max-w-md flex items-center justify-between p-2 mb-2 bg-slate-950/70 backdrop-blur-md border-b border-slate-800/60 rounded-2xl">
        <div className="flex items-center p-1 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner">
          <button
            onClick={() => {
              soundFx.playSwipeTick();
              setActiveTab('featured');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'featured'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>Masterclass</span>
          </button>

          <button
            onClick={() => {
              soundFx.playSwipeTick();
              setActiveTab('feed');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>100+ Reels ({reels.length})</span>
          </button>
        </div>

        {/* Create Reel Button & Pexels Badge */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              soundFx.playChimeCTA();
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            title="Create a new 20-second Reel with Music & Trim"
          >
            <Video className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create</span>
          </button>

          <a
            href="https://www.pexels.com"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 bg-slate-900/60 px-2 py-1 rounded-xl border border-slate-800 transition-colors"
            title="Stock videos provided by Pexels"
          >
            <span>HD</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* Main Reels Viewport */}
      {activeTab === 'featured' ? (
        <div className="w-full max-w-md mx-auto">
          <CinematicReelPlayer
            onOpenComments={(r) => setActiveCommentsReel(r)}
            onOpenShare={(r) => setActiveShareReel(r)}
          />
        </div>
      ) : (
        <div className="relative w-full max-w-md mx-auto flex flex-col items-center">
          {/* Snap-Scrolling Vertical Reel Container */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="w-full h-[calc(100vh-8.5rem)] md:h-[740px] overflow-y-scroll snap-y snap-mandatory scrollbar-none rounded-3xl"
          >
            {loading && reels.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full space-y-3">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Loading 100+ HD Reels...</p>
              </div>
            ) : reels.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-900/50 rounded-3xl border border-slate-800">
                <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
                  <Play className="w-8 h-8 text-cyan-400" />
                </div>
                <h4 className="text-base font-bold text-slate-200">No Reels Available</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">Be the first to create and share a reel on Pulse!</p>
              </div>
            ) : (
              reels.map((reel, index) => (
                <ReelCard
                  key={reel.uniqueKey || `reel-${reel.id}-${index}`}
                  reel={reel}
                  index={index}
                  isActive={index === activeReelIdx}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted(prev => !prev)}
                  onOpenComments={(r) => setActiveCommentsReel(r)}
                  onOpenShare={(r) => setActiveShareReel(r)}
                  onOpenAudioModal={(track) => setActiveAudioTrack(track)}
                />
              ))
            )}

            {/* Bottom Loader for Infinite Scroll */}
            {loading && reels.length > 0 && (
              <div className="py-6 flex justify-center items-center">
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
              </div>
            )}
          </div>

          {/* Desktop Floating Navigation Arrows */}
          <div className="hidden lg:flex flex-col items-center gap-2 absolute -right-16 top-1/2 -translate-y-1/2 z-30">
            <button
              onClick={scrollToPrevReel}
              disabled={activeReelIdx === 0}
              className="p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 disabled:opacity-30 border border-slate-800 shadow-xl transition-all hover:scale-110 cursor-pointer"
              title="Previous Reel (Arrow Up)"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-800">
              {activeReelIdx + 1}/{reels.length}
            </span>
            <button
              onClick={scrollToNextReel}
              disabled={activeReelIdx >= reels.length - 1}
              className="p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 disabled:opacity-30 border border-slate-800 shadow-xl transition-all hover:scale-110 cursor-pointer"
              title="Next Reel (Arrow Down)"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Slide-over Comments Panel */}
      <ReelCommentsPanel
        reel={activeCommentsReel}
        isOpen={Boolean(activeCommentsReel)}
        onClose={() => setActiveCommentsReel(null)}
        onCommentCountChange={handleCommentCountChange}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={Boolean(activeShareReel)}
        onClose={() => setActiveShareReel(null)}
        post={activeShareReel}
      />

      {/* Audio Track Info Modal */}
      <ReelAudioModal
        audioTrack={activeAudioTrack}
        isOpen={Boolean(activeAudioTrack)}
        onClose={() => setActiveAudioTrack(null)}
      />

      {/* 20-Second Reel Creator Modal */}
      <CreateReelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newReel) => {
          if (newReel) {
            const normalized = normalizeReelItem(newReel, 0);
            setReels(prev => [normalized, ...prev]);
            setActiveTab('feed');
            setActiveReelIdx(0);
          }
        }}
        onReelCreated={(newReel) => {
          if (newReel) {
            const normalized = normalizeReelItem(newReel, 0);
            setReels(prev => [normalized, ...prev]);
            setActiveTab('feed');
            setActiveReelIdx(0);
          }
        }}
      />
    </div>
  );
}
