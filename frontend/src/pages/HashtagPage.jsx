import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postService, hashtagService } from '../services/services';
import { PostCard } from '../components/post/PostCard';
import { useAuth } from '../context/AuthContext';
import { Hash, ArrowLeft, Users, Sparkles, Check, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export const HashtagPage = () => {
  const { tag } = useParams();
  const { isAuthenticated } = useAuth();
  const [hashtagDetail, setHashtagDetail] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    loadHashtagData();
  }, [tag]);

  const loadHashtagData = async () => {
    setLoading(true);
    try {
      const [postsRes, detailRes] = await Promise.all([
        postService.getHashtagPosts(tag, 1, 30),
        hashtagService.getDetail(tag)
      ]);

      if (postsRes.data?.success && postsRes.data.data) {
        setPosts(postsRes.data.data.posts || []);
      }
      if (detailRes.data?.success && detailRes.data.data) {
        setHashtagDetail(detailRes.data.data);
        setFollowing(detailRes.data.data.isFollowed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to follow hashtags');
      return;
    }

    try {
      if (following) {
        await hashtagService.unfollowHashtag(tag);
        setFollowing(false);
        setHashtagDetail(prev => prev ? { ...prev, followersCount: Math.max(0, prev.followersCount - 1) } : prev);
        toast.success(`Unfollowed #${tag}`);
      } else {
        await hashtagService.followHashtag(tag);
        setFollowing(true);
        setHashtagDetail(prev => prev ? { ...prev, followersCount: prev.followersCount + 1 } : prev);
        toast.success(`Following #${tag}! Related posts will be boosted in your feed. ✨`);
      }
    } catch (err) {
      toast.error('Failed to update hashtag follow');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Hashtag Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary-500/20">
            <Hash className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-black text-2xl text-slate-900 dark:text-slate-100">#{tag}</h1>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span>{posts.length} posts</span>
              <span>•</span>
              <span>{hashtagDetail?.followersCount || 0} followers</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFollow}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              following
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600'
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/25'
            }`}
          >
            {following ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Following</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Follow Hashtag</span>
              </>
            )}
          </button>

          <Link
            to="/explore"
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Posts Stream */}
      {loading ? (
        <p className="text-center text-xs text-slate-400 py-12 animate-pulse">Loading posts for #{tag}...</p>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200/70 dark:border-slate-800">
          No posts found matching #{tag}. Be the first to tag a post with #{tag}!
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(p => (
            <PostCard key={p.id} post={p} onDelete={() => loadHashtagData()} />
          ))}
        </div>
      )}
    </div>
  );
};
