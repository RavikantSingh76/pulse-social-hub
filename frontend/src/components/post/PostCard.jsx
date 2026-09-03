import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { CommentSection } from '../comment/CommentSection';
import { ReportModal } from '../common/ReportModal';
import { EditPostModal } from './EditPostModal';
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
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [likeAnimation, setLikeAnimation] = useState(false);

  const isOwner = user && user.id === post.userId;
  const isAdmin = user && user.role === 'ADMIN';

  // Multi-Reaction Handler
  const handleSelectReaction = async (reactionType) => {
    if (!isAuthenticated) {
      toast.error('Please log in to react to posts');
      return;
    }

    try {
      const res = await postService.toggleReaction(post.id, reactionType);
      if (res.data?.success) {
        setIsLiked(res.data.data.is_liked);
        setCurrentReaction(res.data.data.current_reaction);
        setLikesCount(res.data.data.likes_count);
        if (res.data.data.is_liked) setLikeAnimation(true);
      }
    } catch (err) {
      toast.error('Failed to update reaction');
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save posts');
      return;
    }
    try {
      const res = await postService.toggleSave(post.id);
      setIsSaved(res.data.data.is_saved);
      toast.success(res.data.data.is_saved ? 'Post saved to bookmarks 🔖' : 'Post removed from bookmarks');
    } catch (err) {
      toast.error('Failed to bookmark post');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast.success('Post link copied to clipboard! 📋');
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
            className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
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
            className="text-pink-600 dark:text-pink-400 font-semibold hover:underline"
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  const formattedTime = post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : '';

  return (
    <article className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 mb-6 shadow-sm overflow-hidden transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 px-5">
        <div className="flex items-center space-x-3">
          <Avatar src={post.avatarUrl} username={post.username} size="md" />
          <div>
            <div className="flex items-center space-x-1.5">
              <Link to={`/profile/${post.username}`} className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:underline flex items-center gap-1">
                <span>{post.displayName || post.username}</span>
                {post.isVerified && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary-600 text-white text-[9px] font-black" title="Verified Creator">
                    ✓
                  </span>
                )}
              </Link>
              <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{formattedTime}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-slate-400 dark:text-slate-500">
              <Link to={`/profile/${post.username}`} className="hover:text-slate-600 dark:hover:text-slate-300">
                @{post.username}
              </Link>
              <span>•</span>
              {post.visibility === 'PUBLIC' && <Globe className="w-3 h-3" title="Public" />}
              {post.visibility === 'FOLLOWERS' && <Users className="w-3 h-3" title="Followers Only" />}
              {post.visibility === 'CLOSE_FRIENDS' && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.2 rounded-full">
                  ★ Close Friends
                </span>
              )}
              {post.visibility === 'PRIVATE' && <Lock className="w-3 h-3" title="Private" />}
            </div>
          </div>
        </div>

        {/* More Options Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-20 divide-y divide-slate-100 dark:divide-slate-800">
              {isOwner && (
                <button
                  onClick={() => { setShowMenu(false); setShowEditModal(true); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
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
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Not Interested
                </button>
              )}
              {(isOwner || isAdmin) && (
                <button
                  onClick={() => { setShowMenu(false); handleDelete(); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                >
                  Delete Post
                </button>
              )}
              <button
                onClick={() => { setShowMenu(false); handleShare(); }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Copy Link
              </button>
              {!isOwner && (
                <button
                  onClick={() => { setShowMenu(false); setShowReportModal(true); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                >
                  Report Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Media Carousel / Single Media / Video */}
      {post.media && post.media.length > 0 && (
        <div className="relative bg-black flex items-center justify-center max-h-[600px] overflow-hidden select-none">
          {post.media[currentMediaIndex].type === 'VIDEO' ? (
            <video
              src={post.media[currentMediaIndex].url.startsWith('http') ? post.media[currentMediaIndex].url : `http://localhost:8080${post.media[currentMediaIndex].url}`}
              controls
              playsInline
              className="w-full max-h-[550px] object-contain"
            />
          ) : (
            <img
              src={post.media[currentMediaIndex].url.startsWith('http') ? post.media[currentMediaIndex].url : `http://localhost:8080${post.media[currentMediaIndex].url}`}
              alt="Post content"
              className="w-full max-h-[550px] object-contain cursor-pointer"
              onDoubleClick={() => handleSelectReaction('LOVE')}
            />
          )}

          {/* Double tap like heart animation */}
          {likeAnimation && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping">
              <Heart className="w-24 h-24 text-rose-500 fill-rose-500 opacity-90 drop-shadow-lg" />
            </div>
          )}

          {/* Multi-image carousel navigation */}
          {post.media.length > 1 && (
            <>
              {currentMediaIndex > 0 && (
                <button
                  onClick={() => setCurrentMediaIndex(prev => prev - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {currentMediaIndex < post.media.length - 1 && (
                <button
                  onClick={() => setCurrentMediaIndex(prev => prev + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
              {/* Pagination Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
                {post.media.map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${i === currentMediaIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Actions Bar */}
      <div className="p-4 px-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Reaction Picker with hover menu */}
            <ReactionPicker
              currentReaction={currentReaction}
              onSelectReaction={handleSelectReaction}
              onToggleLike={() => handleSelectReaction('LIKE')}
              likesCount={likesCount}
            />

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Comment</span>
              {commentsCount > 0 && <span className="text-xs">({commentsCount})</span>}
            </button>

            <button
              onClick={handleShare}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Share Link"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleSave}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isSaved ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Bookmark Post"
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-primary-600 stroke-primary-600' : ''}`} />
          </button>
        </div>

        {/* Video Title if applicable */}
        {post.title && (
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{post.title}</h3>
        )}

        {/* Caption */}
        {post.caption && (
          <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed break-words">
            <Link to={`/profile/${post.username}`} className="font-bold text-slate-900 dark:text-slate-100 mr-2 hover:underline">
              {post.username}
            </Link>
            {renderFormattedCaption(post.caption)}
          </div>
        )}

        {/* Comments Toggle */}
        {commentsCount > 0 && !showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            View all {commentsCount} comments
          </button>
        )}

        {/* Expanded Comments Section */}
        {showComments && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <CommentSection
              postId={post.id}
              onCommentAdded={() => setCommentsCount(c => c + 1)}
              onCommentDeleted={() => setCommentsCount(c => Math.max(0, c - 1))}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditPostModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          post={post}
          onUpdated={(updated) => setPost(updated)}
        />
      )}

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
