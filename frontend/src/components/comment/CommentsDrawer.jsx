import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from '../common/Avatar';
import { CommentItem } from './CommentItem';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/services';
import {
  X,
  Send,
  MessageCircle,
  Smile,
  Sparkles,
  Loader2,
  Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import { soundFx } from '../../utils/audioEffects';

export const CommentsDrawer = ({
  isOpen,
  onClose,
  post,
  onCommentCountChange
}) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);
  const commentsEndRef = useRef(null);

  const quickEmojis = ['🔥', '❤️', '👏', '🚀', '💯', '😂', '😍', '✨'];

  useEffect(() => {
    if (isOpen && post?.id) {
      loadComments();
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 250);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, post?.id]);

  const loadComments = async () => {
    if (!post?.id) return;
    setLoading(true);
    try {
      const res = await postService.getComments(post.id);
      const data = res.data?.data || res.data || [];
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyClick = (comment) => {
    setReplyTarget(comment);
    setContent(`@${comment.username} `);
    inputRef.current?.focus();
  };

  const handleAddEmoji = (emoji) => {
    setContent(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const textToSend = content.trim();
    if (!textToSend || !post?.id) return;

    soundFx.playReactionBubble?.();

    // Optimistic immediate UI update
    const optimisticComment = {
      id: Date.now(),
      userId: user?.id || 1,
      displayName: user?.displayName || user?.username || 'Ravikant Singh',
      username: user?.username || 'ravikant',
      avatarUrl: user?.avatarUrl,
      content: textToSend,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      isLiked: false,
      replies: []
    };

    setComments(prev => [...prev, optimisticComment]);
    setContent('');
    const target = replyTarget;
    setReplyTarget(null);
    if (onCommentCountChange) {
      onCommentCountChange((comments.length || 0) + 1);
    }
    toast.success('Comment posted! 🚀');

    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    setSubmitting(true);
    try {
      if (isAuthenticated) {
        await postService.createComment(post.id, {
          content: textToSend,
          parentId: target ? target.id : null
        });
        await loadComments();
      }
    } catch (err) {
      console.warn('Backend comment sync error, preserved optimistic comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    await loadComments();
    if (onCommentCountChange) {
      onCommentCountChange(Math.max(0, (comments.length || 1) - 1));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-md sm:max-w-lg bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800 z-10 transition-transform transform translate-x-0 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500 dark:text-primary-400">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <span>Comments</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                  {comments.length}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Discussion on @{post?.username || 'post'}'s pulse
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Summary Preview */}
        {post && (
          <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80 flex items-start space-x-3">
            <Avatar src={post.userAvatarUrl || post.avatarUrl} username={post.username} size="sm" />
            <div className="flex-1 min-w-0">
              <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                {post.userFullName || post.author || post.username}
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                {post.caption || post.content || 'Shared media'}
              </p>
            </div>
          </div>
        )}

        {/* Comments Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3 text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin text-primary-500" />
              <p className="text-xs font-semibold">Loading pulse comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <Sparkles className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">No comments yet</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[240px]">
                  Be the first one to start the conversation on this pulse!
                </p>
              </div>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReplyClick}
                onDelete={handleDeleteComment}
                postId={post?.id}
              />
            ))
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Quick Emoji Strip */}
        <div className="px-5 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <Smile className="w-4 h-4 text-slate-400 flex-shrink-0 mr-1" />
          {quickEmojis.map((emoji, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAddEmoji(emoji)}
              className="text-base hover:scale-125 transition-transform p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 flex-shrink-0 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {replyTarget && (
            <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-xs text-primary-600 dark:text-primary-400 font-semibold border border-primary-100 dark:border-primary-900/40">
              <span>Replying to @{replyTarget.username}</span>
              <button
                type="button"
                onClick={() => {
                  setReplyTarget(null);
                  setContent('');
                }}
                className="hover:text-primary-700 dark:hover:text-primary-300 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <Avatar src={user?.avatarUrl} username={user?.username} size="sm" />
            <input
              id="drawer-comment-input"
              name="comment"
              ref={inputRef}
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                isAuthenticated
                  ? (replyTarget ? `Reply to @${replyTarget.username}...` : "Write a comment...")
                  : "Log in to join the conversation..."
              }
              disabled={!isAuthenticated || submitting}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
            <button
              type="submit"
              disabled={!content.trim() || submitting || !isAuthenticated}
              className="p-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-40 text-white rounded-2xl transition-all shadow-md hover:shadow-primary-500/25 flex-shrink-0 cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default CommentsDrawer;
