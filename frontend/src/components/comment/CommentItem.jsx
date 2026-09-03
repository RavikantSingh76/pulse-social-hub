import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/services';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Reply, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const CommentItem = ({ comment, onReply, onDelete, postId }) => {
  const { user, isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);

  const isAuthor = user && user.id === comment.userId;
  const isAdmin = user && user.role === 'ADMIN';

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to like comments');
      return;
    }
    const prev = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prev);
    setLikesCount(prev ? prevCount - 1 : prevCount + 1);

    try {
      const res = await postService.toggleCommentLike(comment.id);
      setIsLiked(res.data.is_liked);
      setLikesCount(res.data.likes_count);
    } catch (err) {
      setIsLiked(prev);
      setLikesCount(prevCount);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await postService.deleteComment(comment.id);
      toast.success('Comment deleted');
      if (onDelete) onDelete(comment.id);
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const formattedTime = comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : '';

  return (
    <div className="space-y-2 py-2">
      <div className="flex items-start space-x-3 group">
        <Avatar src={comment.avatarUrl} username={comment.username} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 dark:bg-zinc-800/60 rounded-2xl px-4 py-2.5 inline-block max-w-full">
            <Link to={`/profile/${comment.username}`} className="font-bold text-xs text-gray-900 dark:text-gray-100 hover:underline mr-2">
              {comment.displayName || comment.username}
            </Link>
            <span className="text-xs text-gray-800 dark:text-zinc-200 break-words leading-relaxed">
              {comment.content}
            </span>
          </div>

          <div className="flex items-center space-x-4 mt-1 px-2 text-[11px] font-semibold text-gray-500 dark:text-zinc-400">
            <span>{formattedTime}</span>
            <button onClick={handleLike} className={`hover:text-rose-500 transition-colors ${isLiked ? 'text-rose-500 font-bold' : ''}`}>
              {likesCount > 0 ? `${likesCount} Likes` : 'Like'}
            </button>
            <button onClick={() => onReply(comment)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center space-x-1">
              <Reply className="w-3 h-3" />
              <span>Reply</span>
            </button>
            {(isAuthor || isAdmin) && (
              <button onClick={handleDelete} className="text-rose-500 hover:text-rose-700 transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-8 border-l-2 border-gray-100 dark:border-zinc-800 space-y-2">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              postId={postId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
