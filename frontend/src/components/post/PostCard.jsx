import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { CommentSection } from '../comment/CommentSection';
import { ReportModal } from '../common/ReportModal';
import { EditPostModal } from './EditPostModal';
import { ShareModal } from './ShareModal';
import FeedVideoPlayer from './FeedVideoPlayer';
import ReactionPicker from '../common/ReactionPicker';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/services';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  Globe,
  Users,
  Lock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Smile
} from 'lucide-react';
import toast from 'react-hot-toast';
import { soundFx } from '../../utils/audioEffects';

export const PostCard = ({ post: initialPost, onDelete }) => {
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [isLiked, setIsLiked] = useState(initialPost.isLiked);
  const [currentReaction, setCurrentReaction] = useState(initialPost.currentReaction);
  const [likesCount, setLikesCount] = useState(initialPost.likesCount || 0);
  const [isSaved, setIsSaved] = useState(initialPost.isSaved);
  const [commentsCount, setCommentsCount] = useState(initialPost.commentsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);

  const isOwner = user && user.id === post.userId;
  const isAdmin = user && user.role === 'ADMIN';

  // Multi-Reaction Handler
  const handleSelectReaction = async (reactionType) => {
    if (!isAuthenticated) {
      toast.error('Please log in to react to posts');
      return;
    }

    try {
      soundFx.playReactionBubble();
      const res = await postService.toggleReaction(post.id, reactionType);
      const data = res.data?.data || res.data;
      if (data) {
        setIsLiked(data.is_liked);
        setCurrentReaction(data.current_reaction);
        setLikesCount(data.likes_count);
        if (data.is_liked) {
          soundFx.playLikePop();
          setShowHeartPop(true);
          setTimeout(() => setShowHeartPop(false), 900);
        }
      }
    } catch (err) {
      toast.error('Failed to update reaction');
    }
  };

  // Double tap to like
  const handleDoubleTap = () => {
    soundFx.playLikePop();
    handleSelectReaction('LOVE');
    setShowHeartPop(true);
    setTimeout(() => setShowHeartPop(false), 900);
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save posts');
      return;
    }
    try {
      const res = await postService.toggleSave(post.id);
      const data = res.data?.data || res.data;
      setIsSaved(data.is_saved);
      toast.success(data.is_saved ? 'Saved to bookmarks 🔖' : 'Removed from bookmarks');
    } catch (err) {
      toast.error('Failed to bookmark post');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postService.deletePost(post.id);
      toast.success('Post deleted successfully');
      if (onDelete) onDelete(post.id);
      else window.location.reload();
    } catch (err) {
      toast.error(err.message || 'Failed to delete post');
    }
  };

  const renderFormattedCaption = (caption) => {
    if (!caption) return null;
    const parts = caption.split(/(#[a-zA-Z0-9_]+|@[a-zA-Z0-9_]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        const tag = part.slice(1);
        return (
          <Link
            key={index}
            to={`/hashtags/${tag}`}
            className="text-cyan-400 font-semibold hover:underline"
          >
            {part}
          </Link>
        );
      } else if (part.startsWith('@')) {
        const username = part.slice(1);
        return (
          <Link
            key={index}
            to={`/profile/${username}`}
            className="text-pink-400 font-semibold hover:underline"
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  const formattedTime = post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : '';
  const captionText = post.caption || '';
  const isLongCaption = captionText.length > 100;

  return (
    <article className="bg-slate-900/80 dark:bg-slate-900/90 rounded-3xl border border-slate-800/80 hover:border-slate-700/80 mb-6 shadow-xl shadow-slate-950/20 backdrop-blur-xl overflow-hidden transition-all duration-200">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4 px-5">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar src={post.avatarUrl} username={post.username} size="md" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <Link to={`/profile/${post.username}`} className="font-bold text-sm text-slate-100 hover:text-cyan-400 transition-colors flex items-center gap-1">
                <span>{post.displayName || post.username}</span>
                {post.isVerified && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-cyan-500 text-white text-[9px] font-black" title="Verified Creator">
                    ✓
                  </span>
                )}
              </Link>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">{formattedTime}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <Link to={`/profile/${post.username}`} className="hover:text-slate-300">
                @{post.username}
              </Link>
              <span>•</span>
              {post.visibility === 'PUBLIC' && <Globe className="w-3 h-3 text-slate-400" title="Public" />}
              {post.visibility === 'FOLLOWERS' && <Users className="w-3 h-3 text-slate-400" title="Followers Only" />}
              {post.visibility === 'CLOSE_FRIENDS' && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  ★ Close Friends
                </span>
              )}
              {post.visibility === 'PRIVATE' && <Lock className="w-3 h-3 text-slate-400" title="Private" />}
            </div>
          </div>
        </div>

        {/* More Options Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-20 divide-y divide-slate-800 text-slate-200">
              {isOwner && (
                <button
                  onClick={() => { setShowMenu(false); setShowEditModal(true); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  Edit Post
                </button>
              )}
              {!isOwner && (
                <button
                  onClick={async () => {
                    setShowMenu(false);
                    try {
                      await postService.markNotInterested(post.id);
                      toast.success("Got it. We'll show fewer posts like this. 👍");
                      if (onDelete) onDelete(post.id);
                    } catch (err) {
                      toast.error('Failed to update preference');
                    }
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-slate-800 cursor-pointer text-slate-300"
                >
                  Not Interested
                </button>
              )}
              <button
                onClick={() => { setShowMenu(false); setShowShareModal(true); }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Share / Send DM
              </button>
              {(isOwner || isAdmin) && (
                <button
                  onClick={() => { setShowMenu(false); handleDelete(); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                >
                  Delete Post
                </button>
              )}
              {!isOwner && (
                <button
                  onClick={() => { setShowMenu(false); setShowReportModal(true); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                >
                  Report Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Media Carousel / Double Tap Heart */}
      {post.media && post.media.length > 0 && (
        <div
          className="relative bg-slate-950 flex items-center justify-center max-h-[620px] overflow-hidden select-none cursor-pointer"
          onDoubleClick={handleDoubleTap}
        >
          {post.media[currentMediaIndex].type === 'VIDEO' ? (
            <FeedVideoPlayer
              videoUrl={
                post.media[currentMediaIndex].url.startsWith('http')
                  ? post.media[currentMediaIndex].url
                  : `http://localhost:8080${post.media[currentMediaIndex].url}`
              }
              posterUrl={
                post.media[currentMediaIndex].thumbnailUrl ||
                post.thumbnailUrl ||
                (post.media[1] && post.media[1].type === 'IMAGE' ? post.media[1].url : null)
              }
              caption={post.caption}
              onDoubleTap={handleDoubleTap}
            />
          ) : (
            <img
              src={
                post.media[currentMediaIndex].url.startsWith('http')
                  ? post.media[currentMediaIndex].url
                  : `http://localhost:8080${post.media[currentMediaIndex].url}`
              }
              alt="Post content"
              className="w-full max-h-[580px] object-contain"
            />
          )}

          {/* Animated Neon Heart Pop */}
          {showHeartPop && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 animate-scale-up">
              <div className="relative">
                <Heart className="w-28 h-28 text-rose-500 fill-rose-500 drop-shadow-[0_0_25px_rgba(244,63,94,0.9)] animate-bounce" />
                <Sparkles className="w-8 h-8 text-amber-300 absolute -top-2 -right-2 animate-spin" />
              </div>
            </div>
          )}

          {/* Carousel Arrows */}
          {post.media.length > 1 && (
            <>
              {currentMediaIndex > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex(prev => prev - 1); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-900 transition-colors backdrop-blur-md border border-slate-800 shadow-lg cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {currentMediaIndex < post.media.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex(prev => prev + 1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-900 transition-colors backdrop-blur-md border border-slate-800 shadow-lg cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {/* Pagination Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 bg-slate-950/60 px-2.5 py-1 rounded-full backdrop-blur-md border border-slate-800/80">
                {post.media.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentMediaIndex ? 'bg-cyan-400 w-4 shadow-sm shadow-cyan-400' : 'bg-slate-600 w-1.5'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Actions Strip */}
      <div className="p-4 px-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ReactionPicker
              currentReaction={currentReaction}
              onSelectReaction={handleSelectReaction}
              onToggleLike={() => handleSelectReaction('LIKE')}
              likesCount={likesCount}
            />

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 text-slate-400" />
              <span>Comment</span>
              {commentsCount > 0 && <span className="text-xs text-slate-400">({commentsCount})</span>}
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
              title="Share / Send"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleSave}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isSaved ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
            title="Bookmark Post"
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-cyan-400 stroke-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : ''}`} />
          </button>
        </div>

        {/* Video Title */}
        {post.title && (
          <h3 className="font-bold text-sm text-slate-100">{post.title}</h3>
        )}

        {/* Caption with collapsible '...more' */}
        {captionText && (
          <div className="text-sm text-slate-200 leading-relaxed break-words">
            <Link to={`/profile/${post.username}`} className="font-bold text-white mr-2 hover:underline">
              {post.username}
            </Link>
            {isLongCaption && !isCaptionExpanded ? (
              <>
                {renderFormattedCaption(captionText.slice(0, 95))}
                <span>... </span>
                <button
                  onClick={() => setIsCaptionExpanded(true)}
                  className="text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  more
                </button>
              </>
            ) : (
              <>
                {renderFormattedCaption(captionText)}
                {isLongCaption && (
                  <button
                    onClick={() => setIsCaptionExpanded(false)}
                    className="ml-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    show less
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Comments Toggle */}
        {commentsCount > 0 && !showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            View all {commentsCount} comments
          </button>
        )}

        {/* Expanded Comments Section */}
        {showComments && (
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <CommentSection
              postId={post.id}
              onCommentAdded={() => setCommentsCount(c => c + 1)}
              onCommentDeleted={() => setCommentsCount(c => Math.max(0, c - 1))}
            />
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={post}
      />

      {/* Edit Modal */}
      {showEditModal && (
        <EditPostModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          post={post}
          onUpdated={(updated) => setPost(updated)}
        />
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          postId={post.id}
        />
      )}
    </article>
  );
};
