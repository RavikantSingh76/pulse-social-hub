import React, { useState, useEffect } from 'react';
import { postService, userService } from '../services/services';
import { PostCard } from '../components/post/PostCard';
import { Avatar } from '../components/common/Avatar';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, Compass, Heart, MessageCircle } from 'lucide-react';

export const ExplorePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [explorePosts, setExplorePosts] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExplore();
  }, []);

  const loadExplore = async () => {
    try {
      const res = await postService.getExplore(1, 24);
      if (res.success && res.data) {
        setExplorePosts(res.data.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      userService.searchUsers(searchQuery, 10).then(res => {
        if (res.success && res.data) setSearchResults(res.data);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Global Search Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/80 p-4 shadow-sm relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search creators, topics, or hashtags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-100 dark:bg-zinc-800 border border-transparent focus:border-indigo-500 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 transition-all"
          />
        </div>

        {/* Live Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-3 divide-y divide-gray-100 dark:divide-zinc-800">
            {searchResults.map(u => (
              <Link
                key={u.id}
                to={`/profile/${u.username}`}
                className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-colors"
              >
                <Avatar src={u.avatarUrl} username={u.username} size="md" />
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{u.displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">@{u.username} • {u.followersCount || 0} followers</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Explore Masonry / Grid */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 px-1">
          <Compass className="w-5 h-5 text-indigo-500" />
          <h2 className="font-extrabold text-lg text-gray-900 dark:text-gray-100">Explore Discoveries</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : explorePosts.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center text-gray-400">
            No public explore posts available at this time.
          </div>
        ) : (
          <div className="space-y-4">
            {explorePosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
