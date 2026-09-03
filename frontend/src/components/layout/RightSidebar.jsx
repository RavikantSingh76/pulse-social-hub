import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../services/services';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { Search, TrendingUp, Sparkles, Check, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export const RightSidebar = () => {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [followingMap, setFollowingMap] = useState({});
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      setLoadingSuggestions(true);
      userService.getSuggestions(4)
        .then(res => {
          if (res.success && res.data) {
            setSuggestions(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingSuggestions(false));
    }
  }, [currentUser]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      userService.searchUsers(searchQuery, 5)
        .then(res => {
          if (res.success && res.data) {
            setSearchResults(res.data);
          }
        })
        .catch(() => {});
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFollow = async (userId) => {
    try {
      const res = await userService.followUser(userId);
      setFollowingMap(prev => ({ ...prev, [userId]: true }));
      toast.success(res.data?.message || 'Followed user');
    } catch (err) {
      toast.error(err.message || 'Could not follow user');
    }
  };

  const trendingTags = [
    { tag: 'photography', count: '1.2k' },
    { tag: 'technology', count: '980' },
    { tag: 'coding', count: '850' },
    { tag: 'reactjs', count: '620' },
    { tag: 'design', count: '540' },
    { tag: 'travel', count: '430' },
  ];

  return (
    <aside className="hidden lg:block w-80 h-screen sticky top-0 px-6 py-6 border-l border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-y-auto z-10 space-y-6">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Pulse users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-zinc-900 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-950 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none transition-all"
          />
        </div>

        {/* Live Search Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 overflow-hidden z-30 divide-y divide-gray-100 dark:divide-zinc-800">
            {searchResults.map((u) => (
              <Link
                key={u.id}
                to={`/profile/${u.username}`}
                onClick={() => setSearchQuery('')}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <Avatar src={u.avatarUrl} username={u.username} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{u.displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">@{u.username}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Users */}
      {suggestions.length > 0 && (
        <div className="bg-gray-50/80 dark:bg-zinc-900/60 rounded-3xl p-5 border border-gray-100 dark:border-zinc-800/60 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Suggested for you</span>
            </h4>
          </div>

          <div className="space-y-3.5">
            {suggestions.map((u) => {
              const isFollowing = followingMap[u.id];
              return (
                <div key={u.id} className="flex items-center justify-between">
                  <Link to={`/profile/${u.username}`} className="flex items-center space-x-3 min-w-0 pr-2">
                    <Avatar src={u.avatarUrl} username={u.username} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{u.displayName}</p>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">@{u.username}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleFollow(u.id)}
                    disabled={isFollowing}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all ${
                      isFollowing
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Done</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3 h-3" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trending Hashtags */}
      <div className="bg-gray-50/80 dark:bg-zinc-900/60 rounded-3xl p-5 border border-gray-100 dark:border-zinc-800/60 space-y-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-pink-500" />
          <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">Trending Topics</h4>
        </div>

        <div className="space-y-2.5">
          {trendingTags.map((t) => (
            <Link
              key={t.tag}
              to={`/hashtags/${t.tag}`}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-zinc-800/60 transition-colors"
            >
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-zinc-200">#{t.tag}</p>
                <p className="text-[11px] text-gray-400 dark:text-zinc-500">Trending across Pulse</p>
              </div>
              <span className="text-[11px] font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">
                {t.count} posts
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Legal & Meta footer */}
      <div className="text-[11px] text-gray-400 dark:text-zinc-500 space-y-2 px-1">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Help</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">API</a>
        </div>
        <p>© 2026 Pulse Social Platform • All rights reserved.</p>
      </div>
    </aside>
  );
};
