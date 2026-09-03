import React, { useState, useEffect, useRef } from 'react';
import { CommentItem } from './CommentItem';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/services';
import { Send, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const CommentSection = ({ postId, onCommentAdded, onCommentDeleted }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const res = await postService.getComments(postId);
      if (res.success && res.data) {
        setComments(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyClick = (comment) => {
    setReplyTarget(comment);
    setContent(`@${comment.username} `);
    inputRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!isAuthenticated) {
      toast.error('Please log in to comment');
      return;
    }

    setSubmitting(true);
    try {
      const res = await postService.createComment(postId, {
        content: content.trim(),
        parentId: replyTarget ? replyTarget.id : null
      });

      if (res.success && res.data) {
        setContent('');
        setReplyTarget(null);
        await loadComments();
        if (onCommentAdded) onCommentAdded();
        toast.success('Comment posted!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    await loadComments();
    if (onCommentDeleted) onCommentDeleted();
  };

  return (
    <div className="space-y-4">
      {/* Comments List */}
      <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
        {loading ? (
          <p className="text-xs text-center text-gray-400 py-4">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-center text-gray-400 dark:text-zinc-500 py-3">No comments yet. Start the conversation!</p>
        ) : (
          comments.map(c => (
            <CommentItem
              key={c.id}
              comment={c}
              onReply={handleReplyClick}
              onDelete={handleDeleteComment}
              postId={postId}
            />
          ))
        )}
      </div>

      {/* Reply target indicator */}
      {replyTarget && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
          <span>Replying to @{replyTarget.username}</span>
          <button onClick={() => { setReplyTarget(null); setContent(''); }} className="hover:text-indigo-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input Box */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <Avatar src={user?.avatarUrl} username={user?.username} size="sm" />
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Add a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-gray-100 dark:bg-zinc-800 border border-transparent focus:border-indigo-500 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 transition-all"
            />
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-indigo-600 hover:text-indigo-800 disabled:opacity-30 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <p className="text-xs text-center text-gray-400 py-2">
          Please <a href="/login" className="text-indigo-600 underline font-semibold">log in</a> to leave a comment.
        </p>
      )}
    </div>
  );
};
