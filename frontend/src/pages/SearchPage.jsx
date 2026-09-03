import React, { useState, useEffect } from 'react';
import { searchService, userService } from '../services/services';
import { Search, Users, FileText, Video, Hash, Trash2, TrendingUp, Clock } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { PostCard } from '../components/post/PostCard';
import { Avatar } from '../components/common/Avatar';

const TABS = [
  { id: 'all', label: 'Top Results', icon: TrendingUp },
  { id: 'people', label: 'People', icon: Users },
  { id: 'posts', label: 'Posts', icon: FileText },
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'hashtags', label: 'Tags', icon: Hash },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const tabParam = searchParams.get('tab') || 'all';

  const [query, setQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState(tabParam);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    fetchSuggested();
  }, []);

  useEffect(() => {
    executeSearch();
  }, [queryParam, tabParam]);

  const fetchSuggested = async () => {
    try {
      const res = await searchService.getSuggestedUsers(5);
      if (res.data?.success) {
        setSuggestedUsers(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const executeSearch = async () => {
    try {
      setLoading(true);
      const res = await searchService.search(queryParam, tabParam, 1, 20);
      if (res.data?.success) {
        setResults(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: query.trim(), tab: activeTab });
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ q: query, tab: tabId });
  };

  const handleClearHistory = async () => {
    try {
      await searchService.clearHistory();
      setResults((prev) => (prev ? { ...prev, recentSearches: [] } : prev));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people, hashtags, videos, and posts..."
          className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-primary-500 shadow-sm transition-all"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-primary-600 text-white font-semibold text-xs hover:bg-primary-700 transition-colors cursor-pointer shadow-md shadow-primary-500/25"
        >
          Search
        </button>
      </form>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Results View */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-600"></div>
        </div>
      ) : !queryParam && results ? (
        /* Empty Query State: Recent Searches & Trending */
        <div className="space-y-6">
          {results.recentSearches && results.recentSearches.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" /> Recent Searches
                </h3>
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3 h-3" /> Clear History
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {results.recentSearches.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(s);
                      setSearchParams({ q: s, tab: activeTab });
                    }}
                    className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggested People to Follow */}
          {suggestedUsers.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-500" /> People You May Know
              </h3>
              <div className="space-y-3">
                {suggestedUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between">
                    <Link to={`/profile/${u.username}`} className="flex items-center gap-3">
                      <Avatar src={u.avatarUrl} username={u.username} size="md" />
                      <div>
                        <div className="flex items-center gap-1 font-bold text-sm text-slate-900 dark:text-white">
                          <span>{u.displayName || u.username}</span>
                          {u.isVerified && <span className="text-primary-600 text-xs">✓</span>}
                        </div>
                        <p className="text-xs text-slate-400">@{u.username}</p>
                      </div>
                    </Link>
                    <Link
                      to={`/profile/${u.username}`}
                      className="px-3.5 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 text-xs font-semibold hover:bg-primary-100 transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : results ? (
        /* Populated Search Results */
        <div className="space-y-6">
          {/* People Section */}
          {(activeTab === 'all' || activeTab === 'people') && results.users && results.users.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">People ({results.users.length})</h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {results.users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-3">
                    <Link to={`/profile/${u.username}`} className="flex items-center gap-3">
                      <Avatar src={u.avatarUrl} username={u.username} size="md" />
                      <div>
                        <div className="flex items-center gap-1 font-bold text-sm text-slate-900 dark:text-white">
                          <span>{u.displayName || u.username}</span>
                          {u.isVerified && <span className="text-primary-600 text-xs">✓</span>}
                        </div>
                        <p className="text-xs text-slate-400">@{u.username}</p>
                      </div>
                    </Link>
                    <Link
                      to={`/profile/${u.username}`}
                      className="px-4 py-1.5 rounded-xl bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors shadow-sm"
                    >
                      View Profile
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hashtags Section */}
          {(activeTab === 'all' || activeTab === 'hashtags') && results.hashtags && results.hashtags.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Hashtags</h3>
              <div className="flex flex-wrap gap-2">
                {results.hashtags.map((tag, idx) => (
                  <Link
                    key={idx}
                    to={`/hashtags/${tag}`}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-50 transition-colors flex items-center gap-1"
                  >
                    <Hash className="w-3.5 h-3.5" />
                    <span>{tag}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Posts Section */}
          {(activeTab === 'all' || activeTab === 'posts') && results.posts && results.posts.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white px-1">Posts ({results.posts.length})</h3>
              {results.posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )}

          {/* Videos Section */}
          {(activeTab === 'all' || activeTab === 'videos') && results.videos && results.videos.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white px-1">Videos ({results.videos.length})</h3>
              {results.videos.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
