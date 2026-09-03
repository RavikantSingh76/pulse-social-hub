import React, { useState, useEffect, useRef } from 'react';
import { postService } from '../services/services';
import { Heart, MessageCircle, Bookmark, Share2, Volume2, VolumeX, Music2, Check, Play, X } from 'lucide-react';
import ReactionPicker from '../components/common/ReactionPicker';
import { CommentSection } from '../components/comment/CommentSection';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function ReelsPage() {
  const { user } = useAuth();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const [activeCommentsPost, setActiveCommentsPost] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchReels();
  }, [page]);

  const fetchReels = async () => {
    try {
      setLoading(true);
      const res = await postService.getReels(page, 8);
      if (res.data?.success) {
        const fetched = res.data.data.reels || [];
        setReels((prev) => (page === 1 ? fetched : [...prev, ...fetched]));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (reelId, reactionType) => {
    try {
      const res = await postService.toggleReaction(reelId, reactionType);
      if (res.data?.success) {
        setReels((prev) =>
          prev.map((r) =>
            r.id === reelId
              ? {
                  ...r,
                  isLiked: res.data.data.is_liked,
                  currentReaction: res.data.data.current_reaction,
                  likesCount: res.data.data.likes_count,
                }
              : r
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (reelId) => {
    try {
      const res = await postService.toggleSave(reelId);
      if (res.data?.success) {
        setReels((prev) =>
          prev.map((r) => (r.id === reelId ? { ...r, isSaved: res.data.data.is_saved } : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && reels.length === 0) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-5rem)]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-[calc(100vh-4rem)] overflow-y-scroll snap-y snap-mandatory scrollbar-none relative pb-10">
      {reels.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
          <p className="text-lg font-semibold">No Reels available right now</p>
          <p className="text-sm mt-1">Be the first to post a video reel!</p>
        </div>
      ) : (
        reels.map((reel) => {
          const videoUrl = reel.media && reel.media.length > 0 ? reel.media[0].url : '';
          return (
            <div
              key={reel.id}
              className="relative w-full h-[calc(100vh-5rem)] snap-start bg-black rounded-3xl overflow-hidden shadow-2xl mb-4 border border-slate-800 flex items-center justify-center"
            >
              {/* Video Component */}
              {videoUrl ? (
                <video
                  src={videoUrl.startsWith('http') ? videoUrl : `http://localhost:8080${videoUrl}`}
                  className="w-full h-full object-cover cursor-pointer"
                  autoPlay
                  loop
                  muted={muted}
                  playsInline
                  onClick={() => setMuted(!muted)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6 text-center font-bold text-xl">
                  {reel.caption}
                </div>
              )}

              {/* Top Controls Overlay */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
                <button
                  onClick={() => setMuted(!muted)}
                  className="p-2.5 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors cursor-pointer"
                >
                  {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>

              {/* Bottom Details Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white z-20">
                <div className="flex items-center gap-3 mb-3">
                  <Link to={`/profile/${reel.username}`} className="flex items-center gap-2">
                    <img
                      src={reel.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${reel.username}`}
                      alt={reel.displayName}
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1 font-semibold text-sm">
                        <span>{reel.displayName || reel.username}</span>
                        {reel.isVerified && <span className="text-primary-400 text-xs">✓</span>}
                      </div>
                      <span className="text-xs text-slate-300">@{reel.username}</span>
                    </div>
                  </Link>
                </div>

                <p className="text-sm font-normal mb-3 line-clamp-2">{reel.caption}</p>

                {/* Audio track tag */}
                <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full w-fit">
                  <Music2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Original Audio — @{reel.username}</span>
                </div>
              </div>

              {/* Right Side Action Bar */}
              <div className="absolute right-3 bottom-20 flex flex-col items-center gap-5 z-20">
                {/* Like / Reaction */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleReaction(reel.id, reel.currentReaction ? reel.currentReaction : 'LOVE')}
                    className="p-3 bg-black/40 backdrop-blur-md rounded-full hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  >
                    <Heart
                      className={`w-7 h-7 ${
                        reel.isLiked
                          ? 'text-rose-500 fill-rose-500 animate-pulse'
                          : 'text-white hover:text-rose-400'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-semibold text-white mt-1 shadow-sm">
                    {reel.likesCount || 0}
                  </span>
                </div>

                {/* Comments */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setActiveCommentsPost(reel)}
                    className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:scale-110 transition-transform cursor-pointer"
                  >
                    <MessageCircle className="w-7 h-7" />
                  </button>
                  <span className="text-xs font-semibold text-white mt-1 shadow-sm">
                    {reel.commentsCount || 0}
                  </span>
                </div>

                {/* Save */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleSave(reel.id)}
                    className="p-3 bg-black/40 backdrop-blur-md rounded-full hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Bookmark
                      className={`w-7 h-7 ${
                        reel.isSaved ? 'text-amber-400 fill-amber-400' : 'text-white'
                      }`}
                    />
                  </button>
                </div>

                {/* Share */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + `/posts/${reel.id}`);
                    alert('Reel link copied to clipboard!');
                  }}
                  className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:scale-110 transition-transform cursor-pointer"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* Comments Drawer */}
      {activeCommentsPost && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl w-full max-w-md max-h-[75vh] flex flex-col p-5 border-t border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Comments</h3>
              <button onClick={() => setActiveCommentsPost(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pt-2">
              <CommentSection postId={activeCommentsPost.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
