import React, { useState, useEffect } from 'react';
import { StoryTray } from '../components/story/StoryTray';
import { PostCard } from '../components/post/PostCard';
import { PostSkeleton } from '../components/common/ThemeToggle';
import { Avatar } from '../components/common/Avatar';
import FeedSwitcher from '../components/feed/FeedSwitcher';
import CreateTextStoryModal from '../components/story/CreateTextStoryModal';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/services';
import { feedFallbackService } from '../services/feedFallbackService';
import { useOutletContext, Link } from 'react-router-dom';
import { Image, Video, Sparkles, RefreshCw, Type } from 'lucide-react';
import toast from 'react-hot-toast';

export const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const { onOpenCreatePost } = useOutletContext() || {};
  const [currentFeed, setCurrentFeed] = useState('FOR_YOU');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showTextStoryModal, setShowTextStoryModal] = useState(false);

  useEffect(() => {
    loadFeed(currentFeed, 1);
  }, [currentFeed]);

  const loadFeed = async (feedType = currentFeed, pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await postService.getFeed(feedType, pageNum, 10);
      let newPosts = [];
      if (res.data?.success && res.data.data) {
        newPosts = res.data.data.posts || [];
      }

      // If backend has 0 posts for this category, load guaranteed HD fallback posts
      if (newPosts.length === 0 && pageNum === 1) {
        newPosts = feedFallbackService.getFallbackPosts(feedType);
      }

      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      setHasMore(newPosts.length >= 10);
      setPage(pageNum);
    } catch (err) {
      // Offline / API error fallback
      if (pageNum === 1) {
        setPosts(feedFallbackService.getFallbackPosts(feedType));
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handlePostDeleted = (deletedId) => {
    setPosts(prev => prev.filter(p => p.id !== deletedId));
  };

  return (
    <div className="space-y-6">
      {/* Instagram-style 24h Stories Tray */}
      <StoryTray onOpenTextStory={() => setShowTextStoryModal(true)} />

      {/* Feed Switcher Tabs */}
      <FeedSwitcher currentFeed={currentFeed} onSelectFeed={(type) => setCurrentFeed(type)} />

      {/* Quick Create Post Box */}
      {isAuthenticated && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 p-4 shadow-sm space-y-3">
          <div className="flex items-center space-x-3">
            <Avatar src={user?.avatarUrl} username={user?.username} size="md" />
            <button
              onClick={onOpenCreatePost}
              className="flex-1 text-left px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
            >
              Share a photo, video, or thoughts with the community...
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 px-2">
            <button
              onClick={onOpenCreatePost}
              className="flex items-center space-x-2 text-xs font-bold text-primary-600 dark:text-primary-400 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Image className="w-4 h-4" />
              <span>Photo</span>
            </button>
            <button
              onClick={onOpenCreatePost}
              className="flex items-center space-x-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Video</span>
            </button>
            <button
              onClick={() => setShowTextStoryModal(true)}
              className="flex items-center space-x-1.5 text-xs font-bold text-pink-600 dark:text-pink-400 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Type className="w-4 h-4" />
              <span>Text Story</span>
            </button>
            <button
              onClick={onOpenCreatePost}
              className="flex items-center space-x-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Post</span>
            </button>
          </div>
        </div>
      )}

      {/* Feed Stream */}
      {loading ? (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto text-2xl">
            ✨
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">No posts in this feed yet!</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Switch to 'For You' or 'Trending' to explore what creators are posting worldwide.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setCurrentFeed('FOR_YOU')}
              className="inline-block px-5 py-2.5 rounded-2xl bg-primary-600 text-white text-xs font-bold shadow-md hover:bg-primary-700 transition-colors cursor-pointer"
            >
              Discover Trending Feed
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={handlePostDeleted}
            />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => loadFeed(currentFeed, page + 1)}
                disabled={loadingMore}
                className="px-6 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm flex items-center space-x-2 mx-auto disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loadingMore ? 'animate-spin' : ''}`} />
                <span>{loadingMore ? 'Loading older posts...' : 'Load More Posts'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Text Story Modal */}
      {showTextStoryModal && (
        <CreateTextStoryModal
          onClose={() => setShowTextStoryModal(false)}
          onStoryCreated={() => {
            toast.success('Text story shared! ✨');
            setShowTextStoryModal(false);
          }}
        />
      )}
    </div>
  );
};
