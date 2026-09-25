import React, { useState, useEffect, useRef } from 'react';
import { StoryTray } from '../components/story/StoryTray';
import { PostCard } from '../components/post/PostCard';
import { PostSkeleton } from '../components/common/ThemeToggle';
import { Avatar } from '../components/common/Avatar';
import FeedSwitcher from '../components/feed/FeedSwitcher';
import CreateTextStoryModal from '../components/story/CreateTextStoryModal';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/services';
import { feedFallbackService } from '../services/feedFallbackService';
import { useOutletContext, Link, useSearchParams } from 'react-router-dom';
import { Image, Video, Sparkles, RefreshCw, Type, Send, X, Hash } from 'lucide-react';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTag = searchParams.get('tag');

  // Inline Quick Post Creation State
  const [newPostText, setNewPostText] = useState('');
  const [inlineMediaFiles, setInlineMediaFiles] = useState([]);
  const [inlinePreviews, setInlinePreviews] = useState([]);
  const [inlineVisibility, setInlineVisibility] = useState('PUBLIC');
  const [isPublishing, setIsPublishing] = useState(false);
  const inlineFileInputRef = useRef(null);

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

  const handleInlineMediaSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setInlineMediaFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(f => ({
      url: URL.createObjectURL(f),
      type: f.type.startsWith('video') ? 'VIDEO' : 'IMAGE',
      name: f.name
    }));
    setInlinePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeInlineMedia = (index) => {
    setInlineMediaFiles(prev => prev.filter((_, i) => i !== index));
    setInlinePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleInlinePublish = async (e) => {
    e.preventDefault();
    if (!newPostText.trim() && inlineMediaFiles.length === 0) {
      toast.error('Please enter some text or select media.');
      return;
    }

    setIsPublishing(true);
    try {
      const formData = new FormData();
      formData.append('caption', newPostText.trim());
      formData.append('visibility', inlineVisibility);
      formData.append('post_type', inlineMediaFiles.some(f => f.type.startsWith('video')) ? 'VIDEO' : 'POST');

      inlineMediaFiles.forEach(file => {
        formData.append('media', file);
      });

      const res = await postService.createPost(formData);
      const createdData = res.data?.data || res.data;

      const newPostObj = {
        id: createdData?.id || Date.now(),
        userId: user?.id,
        author: user?.displayName || user?.username,
        username: user?.username,
        avatarUrl: user?.avatarUrl,
        displayName: user?.displayName,
        caption: newPostText.trim(),
        visibility: inlineVisibility,
        likesCount: 0,
        commentsCount: 0,
        isLiked: false,
        isSaved: false,
        createdAt: new Date().toISOString(),
        media: inlinePreviews.map(p => ({
          id: Date.now() + Math.random(),
          url: p.url,
          type: p.type
        }))
      };

      setPosts(prev => [newPostObj, ...prev]);
      setNewPostText('');
      setInlineMediaFiles([]);
      setInlinePreviews([]);
      toast.success('Pulse published live to the feed! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to publish pulse');
    } finally {
      setIsPublishing(false);
    }
  };

  const addHashtag = (tag) => {
    setNewPostText(prev => (prev.trim() ? `${prev.trim()} ${tag} ` : `${tag} `));
  };

  return (
    <div className="space-y-6">
      {/* Instagram-style 24h Stories Tray */}
      <StoryTray onOpenTextStory={() => setShowTextStoryModal(true)} />

      {/* Feed Switcher Tabs */}
      <FeedSwitcher currentFeed={currentFeed} onSelectFeed={(type) => setCurrentFeed(type)} />

      {/* Interactive Create Post Box */}
      {isAuthenticated && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-lg shadow-slate-950/5 transition-all">
          <form onSubmit={handleInlinePublish} className="space-y-3.5">
            <div className="flex items-start space-x-3">
              <Avatar src={user?.avatarUrl} username={user?.username} size="md" />
              <div className="flex-1 min-w-0">
                <textarea
                  id="home-post-content"
                  name="content"
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="What's happening in tech & code? Share your pulse..."
                  className="w-full bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 placeholder-slate-400 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm h-24 transition-all"
                />
              </div>
            </div>

            {/* Media Previews */}
            {inlinePreviews.length > 0 && (
              <div className="flex gap-2 overflow-x-auto py-1 pl-12">
                {inlinePreviews.map((preview, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 flex-shrink-0 group">
                    {preview.type === 'VIDEO' ? (
                      <video src={preview.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={preview.url} alt="preview" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeInlineMedia(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-full text-xs transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Tools & Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 pl-2 sm:pl-12">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                {/* Hidden File Input */}
                <input
                  ref={inlineFileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleInlineMediaSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => inlineFileInputRef.current?.click()}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                  title="Attach Photo or Video"
                >
                  <Image className="w-4 h-4 text-emerald-500" />
                  <span className="hidden sm:inline">Media</span>
                </button>

                {/* Quick Tags */}
                <button
                  type="button"
                  onClick={() => addHashtag('#tech')}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  #tech
                </button>
                <button
                  type="button"
                  onClick={() => addHashtag('#code')}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  #code
                </button>
                <button
                  type="button"
                  onClick={() => addHashtag('#ai')}
                  className="hidden sm:inline-block px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  #ai
                </button>

                {/* Visibility selector */}
                <select
                  id="home-post-visibility"
                  name="visibility"
                  value={inlineVisibility}
                  onChange={(e) => setInlineVisibility(e.target.value)}
                  className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg px-2 py-1 border border-transparent focus:outline-none focus:ring-1 focus:ring-primary-500 font-semibold cursor-pointer"
                >
                  <option value="PUBLIC">🌐 Public</option>
                  <option value="FOLLOWERS">👥 Followers</option>
                  <option value="PRIVATE">🔒 Only Me</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onOpenCreatePost}
                  className="text-xs text-slate-400 hover:text-slate-200 font-medium px-2 py-1 transition-colors cursor-pointer"
                  title="Open Full Post / Reel Creator with Music and Trimming"
                >
                  More options
                </button>
                <button
                  type="submit"
                  disabled={isPublishing || (!newPostText.trim() && inlineMediaFiles.length === 0)}
                  className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-bold px-4 sm:px-5 py-2 rounded-2xl text-xs sm:text-sm transition-all shadow-md shadow-primary-500/20 cursor-pointer flex items-center space-x-1.5"
                >
                  {isPublishing ? (
                    <span>Publishing...</span>
                  ) : (
                    <>
                      <span>Publish Pulse</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Active Hashtag Filter Banner */}
      {selectedTag && (
        <div className="flex items-center justify-between px-5 py-3.5 bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-3xl text-emerald-600 dark:text-emerald-400 backdrop-blur-md shadow-sm">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-500">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm">
                Showing posts tagged #{selectedTag.replace('#', '')}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {posts.filter(p => (p.caption || p.content || '').toLowerCase().includes(selectedTag.toLowerCase().replace('#', ''))).length} matching pulses found
              </p>
            </div>
          </div>
          <button
            onClick={() => setSearchParams({})}
            className="text-xs font-bold bg-white dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-slate-700 dark:text-slate-200 px-3.5 py-1.5 rounded-xl transition-all shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center space-x-1"
          >
            <span>Clear Filter</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Feed Stream */}
      {loading ? (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : (selectedTag ? posts.filter(p => (p.caption || p.content || '').toLowerCase().includes(selectedTag.toLowerCase().replace('#', ''))) : posts).length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto text-2xl">
            ✨
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
            {selectedTag ? `No posts found for #${selectedTag.replace('#', '')}` : 'No posts in this feed yet!'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {selectedTag
              ? 'Try clearing the filter to explore all creator pulses.'
              : "Switch to 'For You' or 'Trending' to explore what creators are posting worldwide."}
          </p>
          <div className="pt-2">
            {selectedTag ? (
              <button
                onClick={() => setSearchParams({})}
                className="inline-block px-5 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Clear Filter & View All Posts
              </button>
            ) : (
              <button
                onClick={() => setCurrentFeed('FOR_YOU')}
                className="inline-block px-5 py-2.5 rounded-2xl bg-primary-600 text-white text-xs font-bold shadow-md hover:bg-primary-700 transition-colors cursor-pointer"
              >
                Discover Trending Feed
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {(selectedTag ? posts.filter(p => (p.caption || p.content || '').toLowerCase().includes(selectedTag.toLowerCase().replace('#', ''))) : posts).map(post => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={handlePostDeleted}
            />
          ))}

          {/* Load More Button */}
          {hasMore && !selectedTag && (
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
