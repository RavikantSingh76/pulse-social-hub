import React, { useState, useEffect, useRef, useCallback } from 'react';
import { postService } from '../services/services';
import ReelCard from '../components/reels/ReelCard';
import CinematicReelPlayer from '../components/reels/CinematicReelPlayer';
import ReelCommentsPanel from '../components/reels/ReelCommentsPanel';
import ReelAudioModal from '../components/reels/ReelAudioModal';
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
  Play
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReelsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('featured'); // 'featured' | 'feed'
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeReelIdx, setActiveReelIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Active Modals state
  const [activeCommentsReel, setActiveCommentsReel] = useState(null);
  const [activeShareReel, setActiveShareReel] = useState(null);
  const [activeAudioTrack, setActiveAudioTrack] = useState(null);

  const containerRef = useRef(null);
  const observerRef = useRef(null);

  // Fetch Reels from API
  useEffect(() => {
    fetchReels(page);
  }, [page]);

  const fetchReels = async (pageNum) => {
    try {
      setLoading(true);
      const res = await postService.getReels(pageNum, 10);
      const data = res.data?.data || res.data;
      if (data) {
        const fetched = data.reels || data || [];
        if (fetched.length === 0) {
          setHasMore(false);
        } else {
          setReels(prev => (pageNum === 1 ? fetched : [...prev, ...fetched]));
        }
      }
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

  // Keyboard navigation (ArrowDown for Next Reel, ArrowUp for Prev Reel)
  const handleKeyDown = useCallback((e) => {
    if (activeCommentsReel || activeShareReel || activeAudioTrack) return; // ignore when modal open

    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      scrollToNextReel();
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      scrollToPrevReel();
    } else if (e.key === 'm' || e.key === 'M') {
      setIsMuted(prev => !prev);
      toast(isMuted ? '🔊 Audio Unmuted' : '🔇 Audio Muted', { id: 'reel-mute-kb' });
    }
  }, [activeReelIdx, reels.length, activeCommentsReel, activeShareReel, activeAudioTrack, isMuted]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const scrollToNextReel = () => {
    if (activeReelIdx < reels.length - 1) {
      const nextIdx = activeReelIdx + 1;
      const nextEl = containerRef.current?.querySelector(`[data-reel-index="${nextIdx}"]`);
      nextEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveReelIdx(nextIdx);
    }
  };

  const scrollToPrevReel = () => {
    if (activeReelIdx > 0) {
      const prevIdx = activeReelIdx - 1;
      const prevEl = containerRef.current?.querySelector(`[data-reel-index="${prevIdx}"]`);
      prevEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveReelIdx(prevIdx);
    }
  };

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
      <div className="sticky top-0 z-40 w-full max-w-md flex items-center justify-center p-2 mb-2 bg-slate-950/70 backdrop-blur-md border-b border-slate-800/60 rounded-2xl">
        <div className="flex items-center p-1 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner">
          <button
            onClick={() => {
              soundFx.playSwipeTick();
              setActiveTab('featured');
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'featured'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>Featured Masterclass</span>
          </button>

          <button
            onClick={() => {
              soundFx.playSwipeTick();
              setActiveTab('feed');
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Community Reels ({reels.length})</span>
          </button>
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
            className="w-full h-[calc(100vh-8.5rem)] md:h-[740px] overflow-y-scroll snap-y snap-mandatory scrollbar-none rounded-3xl"
          >
            {loading && reels.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full space-y-3">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Loading Reels Feed...</p>
              </div>
            ) : reels.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-900/50 rounded-3xl border border-slate-800">
                <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
                  <Play className="w-8 h-8 text-cyan-400" />
                </div>
                <h4 className="text-base font-bold text-slate-200">No Community Reels Yet</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">Be the pioneer! Create and upload the first vertical reel on Pulse Social Hub.</p>
              </div>
            ) : (
              reels.map((reel, index) => (
                <ReelCard
                  key={reel.id || index}
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
    </div>
  );
}
