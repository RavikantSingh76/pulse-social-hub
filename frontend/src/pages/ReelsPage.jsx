import React, { useState, useEffect, useRef } from 'react';
import { postService, userService } from '../services/services';
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
  X,
  Sparkles,
  Plus
} from 'lucide-react';
import ReactionPicker from '../components/common/ReactionPicker';
import { CommentSection } from '../components/comment/CommentSection';
import { ShareModal } from '../components/post/ShareModal';
import { useAuth } from '../context/AuthContext';
import { soundFx, REELS_AUDIO_TRACKS } from '../utils/audioEffects';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ReelsPage() {
  const { user } = useAuth();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(false);
  const [soundFeedback, setSoundFeedback] = useState(null); // { isMuted: bool, id: number }
  const [activeCommentsPost, setActiveCommentsPost] = useState(null);
  const [activeSharePost, setActiveSharePost] = useState(null);
  const [followingMap, setFollowingMap] = useState({});
  const [heartPopMap, setHeartPopMap] = useState({});
  const [page, setPage] = useState(1);
  const audioRef = useRef(null);
  const videoRefs = useRef({});

  useEffect(() => {
    fetchReels();
  }, [page]);

  const fetchReels = async () => {
    try {
      setLoading(true);
      const res = await postService.getReels(page, 12);
      const data = res.data?.data || res.data;
      if (data) {
        const fetched = data.reels || data || [];
        setReels((prev) => (page === 1 ? fetched : [...prev, ...fetched]));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSound = (reelIdx = 0, reelId = null) => {
    const nextMuted = !muted;
    setMuted(nextMuted);

    // Show center speaker flash feedback
    setSoundFeedback({ isMuted: nextMuted, reelId });
    setTimeout(() => setSoundFeedback(null), 900);

    // Audio stream handling
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }

    if (!nextMuted) {
      const track = REELS_AUDIO_TRACKS[reelIdx % REELS_AUDIO_TRACKS.length];
      audioRef.current.src = track.audioUrl;
      audioRef.current.volume = 0.85;
      audioRef.current.play().catch(() => {});
      toast.success(`Playing: ${track.title} 🎵`, { id: 'reel-audio-toast' });
    } else {
      audioRef.current.pause();
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleReaction = async (reelId, reactionType = 'LOVE') => {
    try {
      soundFx.playReactionBubble();
      const res = await postService.toggleReaction(reelId, reactionType);
      const data = res.data?.data || res.data;
      if (data) {
        setReels((prev) =>
          prev.map((r) =>
            r.id === reelId
              ? {
                  ...r,
                  isLiked: data.is_liked,
                  currentReaction: data.current_reaction,
                  likesCount: data.likes_count,
                }
              : r
          )
        );
        if (data.is_liked) {
          soundFx.playLikePop();
          triggerHeartPop(reelId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerHeartPop = (reelId) => {
    soundFx.playLikePop();
    setHeartPopMap(prev => ({ ...prev, [reelId]: true }));
    setTimeout(() => {
      setHeartPopMap(prev => ({ ...prev, [reelId]: false }));
    }, 900);
  };

  const handleSave = async (reelId) => {
    try {
      const res = await postService.toggleSave(reelId);
      const data = res.data?.data || res.data;
      if (data) {
        setReels((prev) =>
          prev.map((r) => (r.id === reelId ? { ...r, isSaved: data.is_saved } : r))
        );
        toast.success(data.is_saved ? 'Saved to bookmarks 🔖' : 'Removed from bookmarks');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await userService.followUser(userId);
      setFollowingMap(prev => ({ ...prev, [userId]: true }));
      toast.success('Followed creator! 🎉');
    } catch (err) {
      toast.error('Could not follow user');
    }
  };

  if (loading && reels.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-5rem)] space-y-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Loading Crystal Clear Reels...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-[calc(100vh-4.5rem)] overflow-y-scroll snap-y snap-mandatory scrollbar-none relative pb-12">
      {reels.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
            <Play className="w-8 h-8 text-cyan-400" />
          </div>
          <p className="text-base font-bold text-slate-200">No Reels Available</p>
          <p className="text-xs text-slate-500 mt-1">Be the first to share a video reel on Pulse!</p>
        </div>
      ) : (
        reels.map((reel, index) => {
          const videoUrl = reel.media && reel.media.length > 0 ? reel.media[0].url : '';
          const isLiked = reel.isLiked;
          const isSaved = reel.isSaved;
          const isFollowed = followingMap[reel.userId];
          const isOwner = user && user.id === reel.userId;
          const track = REELS_AUDIO_TRACKS[index % REELS_AUDIO_TRACKS.length];

          return (
            <div
              key={reel.id}
              className="relative w-full h-[calc(100vh-5.5rem)] snap-start bg-slate-950 rounded-3xl overflow-hidden shadow-2xl mb-6 border border-slate-800 flex items-center justify-center select-none"
            >
              {/* Video Player */}
              {videoUrl ? (
                <video
                  ref={(el) => (videoRefs.current[reel.id] = el)}
                  src={videoUrl.startsWith('http') ? videoUrl : `http://localhost:8080${videoUrl}`}
                  className="w-full h-full object-cover cursor-pointer"
                  autoPlay
                  loop
                  muted={muted}
                  playsInline
                  preload="auto"
                  onClick={() => toggleSound(index, reel.id)}
                  onDoubleClick={() => handleReaction(reel.id, 'LOVE')}
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 text-white p-8 text-center cursor-pointer"
                  onDoubleClick={() => handleReaction(reel.id, 'LOVE')}
                  onClick={() => toggleSound(index, reel.id)}
                >
                  <Sparkles className="w-10 h-10 text-cyan-400 mb-3 animate-pulse" />
                  <p className="font-extrabold text-lg leading-relaxed">{reel.caption}</p>
                </div>
              )}

              {/* Instagram-style Center Floating Speaker Flash */}
              {soundFeedback && soundFeedback.reelId === reel.id && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-scale-up">
                  <div className="p-4 rounded-3xl bg-black/75 backdrop-blur-md border border-white/20 text-white flex flex-col items-center space-y-1 shadow-2xl">
                    {soundFeedback.isMuted ? (
                      <>
                        <VolumeX className="w-10 h-10 text-rose-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-300">Audio Muted</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-10 h-10 text-cyan-400 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">Sound ON 🔊</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Heart Pop Animation on Double Tap */}
              {heartPopMap[reel.id] && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-scale-up">
                  <div className="relative">
                    <Heart className="w-28 h-28 text-rose-500 fill-rose-500 drop-shadow-[0_0_30px_rgba(244,63,94,0.9)] animate-bounce" />
                    <Sparkles className="w-8 h-8 text-amber-300 absolute -top-2 -right-2 animate-spin" />
                  </div>
                </div>
              )}

              {/* Top Controls Overlay */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                <button
                  onClick={() => toggleSound(index, reel.id)}
                  className={`p-2.5 rounded-full backdrop-blur-md transition-all border cursor-pointer shadow-lg ${
                    !muted
                      ? 'bg-cyan-500/30 text-cyan-400 border-cyan-400/50 shadow-cyan-500/40'
                      : 'bg-black/60 text-white border-white/10 hover:bg-black/80'
                  }`}
                  title={muted ? 'Click to play Sound' : 'Mute'}
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />}
                </button>
              </div>

              {/* Right Floating Actions Strip */}
              <div className="absolute right-3.5 bottom-16 z-20 flex flex-col items-center space-y-4">
                {/* Like Button */}
                <button
                  onClick={() => handleReaction(reel.id, isLiked ? 'LIKE' : 'LOVE')}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className={`p-3 rounded-full backdrop-blur-md transition-all active:scale-90 ${
                    isLiked
                      ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40 shadow-lg shadow-rose-500/20'
                      : 'bg-black/50 text-white hover:bg-black/70 border border-white/10'
                  }`}>
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-rose-500' : ''}`} />
                  </div>
                  <span className="text-[11px] font-bold text-white mt-1 drop-shadow">
                    {reel.likesCount || 0}
                  </span>
                </button>

                {/* Comment Button */}
                <button
                  onClick={() => setActiveCommentsPost(reel)}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all active:scale-90 border border-white/10">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-white mt-1 drop-shadow">
                    {reel.commentsCount || 0}
                  </span>
                </button>

                {/* Share Button */}
                <button
                  onClick={() => setActiveSharePost(reel)}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all active:scale-90 border border-white/10">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-white mt-1 drop-shadow">
                    Share
                  </span>
                </button>

                {/* Bookmark Button */}
                <button
                  onClick={() => handleSave(reel.id)}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className={`p-3 rounded-full backdrop-blur-md transition-all active:scale-90 ${
                    isSaved
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/20'
                      : 'bg-black/50 text-white hover:bg-black/70 border border-white/10'
                  }`}>
                    <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-cyan-400' : ''}`} />
                  </div>
                  <span className="text-[11px] font-bold text-white mt-1 drop-shadow">
                    Save
                  </span>
                </button>

                {/* Animated Rotating Vinyl Disc with Equalizer Bars */}
                <div className="pt-2 flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-tr from-slate-900 via-indigo-900 to-cyan-600 p-0.5 border border-white/30 shadow-lg flex items-center justify-center ${!muted ? 'animate-spin-slow' : ''}`}>
                    <div className="w-3 h-3 rounded-full bg-slate-950 border border-white/40" />
                  </div>

                  {/* Equalizer Visualizer */}
                  {!muted && (
                    <div className="flex items-end space-x-0.5 h-3 mt-1.5">
                      <span className="w-0.5 bg-cyan-400 rounded-full animate-bounce h-2" />
                      <span className="w-0.5 bg-pink-400 rounded-full animate-bounce h-3 delay-75" />
                      <span className="w-0.5 bg-cyan-400 rounded-full animate-bounce h-1.5 delay-150" />
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Creator Details & Audio Track */}
              <div className="absolute bottom-0 inset-x-0 p-5 pr-16 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white z-20 space-y-2">
                {/* Creator Header */}
                <div className="flex items-center gap-2.5">
                  <Link to={`/profile/${reel.username}`} className="flex items-center gap-2">
                    <img
                      src={reel.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${reel.username}`}
                      alt={reel.displayName}
                      className="w-9 h-9 rounded-full border border-cyan-400 object-cover shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-1 font-bold text-sm text-white hover:text-cyan-400 transition-colors">
                        <span>{reel.displayName || reel.username}</span>
                        {reel.isVerified && <span className="text-cyan-400 text-xs font-black">✓</span>}
                      </div>
                      <span className="text-[11px] text-slate-300">@{reel.username}</span>
                    </div>
                  </Link>

                  {/* Quick Follow Button */}
                  {!isOwner && user && (
                    <button
                      onClick={() => handleFollow(reel.userId)}
                      className={`ml-2 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isFollowed
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/25'
                      }`}
                    >
                      {isFollowed ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>

                {/* Caption */}
                {reel.caption && (
                  <p className="text-xs font-medium text-slate-100 line-clamp-2 leading-relaxed">
                    {reel.caption}
                  </p>
                )}

                {/* Audio Track Info with Click to Play */}
                <button
                  onClick={() => toggleSound(index, reel.id)}
                  className="flex items-center space-x-2 text-[11px] text-cyan-300 font-semibold bg-black/40 hover:bg-black/60 px-3 py-1 rounded-full w-fit backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
                >
                  <Music2 className={`w-3.5 h-3.5 text-cyan-400 ${!muted ? 'animate-pulse' : ''}`} />
                  <span className="truncate max-w-[210px]">{track.title}</span>
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* Slide-up Comments Drawer */}
      {activeCommentsPost && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 shadow-2xl h-[70vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Comments</h3>
              <button
                onClick={() => setActiveCommentsPost(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-3">
              <CommentSection
                postId={activeCommentsPost.id}
                onCommentAdded={() => {
                  setReels(prev => prev.map(r => r.id === activeCommentsPost.id ? { ...r, commentsCount: (r.commentsCount || 0) + 1 } : r));
                }}
                onCommentDeleted={() => {
                  setReels(prev => prev.map(r => r.id === activeCommentsPost.id ? { ...r, commentsCount: Math.max(0, (r.commentsCount || 1) - 1) } : r));
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {activeSharePost && (
        <ShareModal
          isOpen={Boolean(activeSharePost)}
          onClose={() => setActiveSharePost(null)}
          post={activeSharePost}
        />
      )}
    </div>
  );
}
