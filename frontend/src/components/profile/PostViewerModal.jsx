import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Send,
  Sparkles,
  Check,
  Film
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { CommentSection } from '../comment/CommentSection';
import { ShareModal } from '../post/ShareModal';
import { postService } from '../../services/services';
import { soundFx } from '../../utils/audioEffects';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function PostViewerModal({
  isOpen,
  onClose,
  posts = [],
  initialIndex = 0,
  onPostUpdate
}) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [heartPop, setHeartPop] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const currentPost = posts[currentIndex];

  useEffect(() => {
    if (currentPost) {
      setIsLiked(currentPost.isLiked || false);
      setLikesCount(currentPost.likesCount || 0);
      setIsSaved(currentPost.isSaved || false);
    }
  }, [currentPost]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, posts.length]);

  if (!isOpen || !currentPost) return null;

  const handlePrev = () => {
    if (currentIndex > 0) {
      soundFx.playSwipeTick();
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < posts.length - 1) {
      soundFx.playSwipeTick();
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleToggleLike = async () => {
    soundFx.playLikePop();
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount(prev => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    if (nextState) {
      setHeartPop(true);
      setTimeout(() => setHeartPop(false), 800);
    }

    try {
      await postService.toggleReaction(currentPost.id, 'LOVE');
      if (onPostUpdate) onPostUpdate(currentPost.id, { isLiked: nextState, likesCount: nextState ? likesCount + 1 : likesCount - 1 });
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
      await postService.toggleSave(currentPost.id);
      if (onPostUpdate) onPostUpdate(currentPost.id, { isSaved: nextState });
    } catch (err) {
      console.error(err);
    }
  };

  const mediaList = currentPost.media || currentPost.mediaList || [];
  const primaryMedia = mediaList.length > 0 ? mediaList[0] : null;
  const isVideo = currentPost.postType === 'VIDEO' || (primaryMedia && primaryMedia.mediaType === 'VIDEO') || currentPost.videoUrl;

  const mediaUrl = primaryMedia?.url
    ? (primaryMedia.url.startsWith('http') ? primaryMedia.url : `http://localhost:8080${primaryMedia.url}`)
    : (currentPost.videoUrl || currentPost.imageUrl || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/10 transition-colors cursor-pointer"
        aria-label="Close post viewer"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev Navigation Arrow */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/10 transition-all hover:scale-110 cursor-pointer"
          aria-label="Previous post"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next Navigation Arrow */}
      {currentIndex < posts.length - 1 && (
        <button
          onClick={handleNext}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/10 transition-all hover:scale-110 cursor-pointer"
          aria-label="Next post"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main Split Modal Container */}
      <div className="relative w-full max-w-5xl h-full md:h-[85vh] max-h-[820px] bg-slate-950 border md:border border-slate-800 md:rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* LEFT COLUMN: Media Container */}
        <div
          className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] md:min-h-full cursor-pointer"
          onDoubleClick={handleToggleLike}
        >
          {isVideo ? (
            <video
              src={mediaUrl}
              className="w-full h-full max-h-[50vh] md:max-h-full object-contain"
              autoPlay
              loop
              controls
              playsInline
            />
          ) : mediaUrl ? (
            <img
              src={mediaUrl}
              alt={currentPost.caption || 'Post media'}
              className="w-full h-full max-h-[50vh] md:max-h-full object-contain"
            />
          ) : (
            <div className="p-8 text-center text-slate-300 max-w-sm">
              <Sparkles className="w-10 h-10 text-cyan-400 mx-auto mb-3 animate-pulse" />
              <p className="font-bold text-sm leading-relaxed">{currentPost.caption}</p>
            </div>
          )}

          {/* Double Tap Heart Pop */}
          {heartPop && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-scale-up">
              <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-[0_0_30px_rgba(244,63,94,0.9)] animate-bounce" />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Creator Info, Caption & Comments Stream */}
        <div className="w-full md:w-[400px] flex flex-col bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800">
          {/* Header Bar */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/40">
            <Link
              to={`/profile/${currentPost.username || currentPost.user?.username}`}
              onClick={onClose}
              className="flex items-center gap-2.5 group"
            >
              <img
                src={currentPost.avatarUrl || currentPost.user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentPost.username || 'user'}`}
                alt={currentPost.displayName || currentPost.username}
                className="w-9 h-9 rounded-full border border-cyan-400 object-cover"
              />
              <div>
                <div className="flex items-center gap-1 font-extrabold text-xs text-white group-hover:text-cyan-400 transition-colors">
                  <span>{currentPost.displayName || currentPost.user?.displayName || currentPost.username}</span>
                  {currentPost.isVerified && <Check className="w-3 h-3 text-cyan-400 stroke-[3]" />}
                </div>
                <span className="text-[10px] text-slate-400">@{currentPost.username || currentPost.user?.username}</span>
              </div>
            </Link>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Post link copied!');
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Caption & Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
            {/* Post Caption */}
            {currentPost.caption && (
              <div className="flex items-start gap-3 pb-3 border-b border-slate-800/80">
                <img
                  src={currentPost.avatarUrl || currentPost.user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentPost.username || 'user'}`}
                  alt=""
                  className="w-8 h-8 rounded-full border border-slate-700 object-cover mt-0.5 shrink-0"
                />
                <div className="text-xs text-slate-200 leading-relaxed">
                  <span className="font-extrabold text-white mr-1.5">{currentPost.username || currentPost.user?.username}</span>
                  <span className="whitespace-pre-line">{currentPost.caption}</span>
                </div>
              </div>
            )}

            {/* Live Comments */}
            <CommentSection
              postId={currentPost.id}
              onCommentAdded={() => {
                if (onPostUpdate) onPostUpdate(currentPost.id, { commentsCount: (currentPost.commentsCount || 0) + 1 });
              }}
              onCommentDeleted={() => {
                if (onPostUpdate) onPostUpdate(currentPost.id, { commentsCount: Math.max(0, (currentPost.commentsCount || 1) - 1) });
              }}
            />
          </div>

          {/* Bottom Actions & Engagement Strip */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Like Button */}
                <button
                  onClick={handleToggleLike}
                  className={`p-2 rounded-full transition-all active:scale-75 cursor-pointer ${
                    isLiked ? 'text-rose-500 bg-rose-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  aria-label="Like post"
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500' : ''}`} />
                </button>

                {/* Comment Button */}
                <button
                  className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Comment"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>

                {/* Share Button */}
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Share post"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Bookmark / Save Button */}
              <button
                onClick={handleToggleSave}
                className={`p-2 rounded-full transition-all active:scale-75 cursor-pointer ${
                  isSaved ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                aria-label="Save post"
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-cyan-400' : ''}`} />
              </button>
            </div>

            {/* Like Count */}
            <p className="text-xs font-bold text-white px-1">
              {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
            </p>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        post={currentPost}
      />
    </div>
  );
}
