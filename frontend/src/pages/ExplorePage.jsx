import React, { useState, useEffect } from 'react';
import { postService, userService } from '../services/services';
import { Avatar } from '../components/common/Avatar';
import { PostCard } from '../components/post/PostCard';
import { Link } from 'react-router-dom';
import {
  Search,
  TrendingUp,
  Compass,
  Heart,
  MessageCircle,
  Play,
  Sparkles,
  Layers,
  X,
  UserPlus,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getYouTubeId, getYouTubeThumbnail, resolveSafeMediaUrl } from '../utils/mediaUtils';

const CATEGORIES = [
  { id: 'ALL', label: '🔥 All' },
  { id: 'TRENDING', label: '⚡ Trending' },
  { id: 'TECH', label: '💻 Tech & Coding' },
  { id: 'DESIGN', label: '🎨 UI/UX & Design' },
  { id: 'AI', label: '🤖 AI & Future' },
  { id: 'TRAVEL', label: '✈️ Travel & India' },
  { id: 'STARTUP', label: '🚀 Startups' }
];

export const ExplorePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [explorePosts, setExplorePosts] = useState([]);
  const [creators, setCreators] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPost, setSelectedPost] = useState(null);
  const [followingMap, setFollowingMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExplore();
    loadCreators();
  }, []);

  const loadExplore = async () => {
    try {
      setLoading(true);
      const res = await postService.getExplore(1, 30);
      const data = res.data?.data || res.data;
      if (data) {
        setExplorePosts(data.posts || data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCreators = async () => {
    try {
      const res = await userService.getSuggestions(8);
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) setCreators(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await userService.followUser(userId);
      setFollowingMap(prev => ({ ...prev, [userId]: true }));
      toast.success('Followed creator!');
    } catch (err) {
      toast.error('Could not follow user');
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      userService.searchUsers(searchQuery, 10).then(res => {
        const data = res.data?.data || res.data;
        if (Array.isArray(data)) setSearchResults(data);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredPosts = explorePosts.filter(p => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'TRENDING') return (p.likesCount || 0) > 0 || (p.commentsCount || 0) > 0;
    if (selectedCategory === 'TECH') return p.caption?.toLowerCase().includes('tech') || p.caption?.toLowerCase().includes('code') || p.caption?.toLowerCase().includes('java');
    if (selectedCategory === 'DESIGN') return p.caption?.toLowerCase().includes('design') || p.caption?.toLowerCase().includes('ui');
    if (selectedCategory === 'AI') return p.caption?.toLowerCase().includes('ai') || p.caption?.toLowerCase().includes('data');
    if (selectedCategory === 'TRAVEL') return p.caption?.toLowerCase().includes('travel') || p.caption?.toLowerCase().includes('india') || p.caption?.toLowerCase().includes('photo');
    if (selectedCategory === 'STARTUP') return p.caption?.toLowerCase().includes('startup') || p.caption?.toLowerCase().includes('build');
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-3 shadow-xl backdrop-blur-xl relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search creators, hashtags, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
          />
        </div>

        {/* Live Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="mt-3 divide-y divide-slate-800/80 max-h-64 overflow-y-auto">
            {searchResults.map(u => (
              <Link
                key={u.id}
                to={`/profile/${u.username}`}
                className="flex items-center space-x-3 p-2.5 rounded-2xl hover:bg-slate-800/60 transition-colors"
              >
                <Avatar src={u.avatarUrl} username={u.username} size="sm" disableLink={true} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-white truncate flex items-center gap-1">
                    <span>{u.displayName}</span>
                    {u.isVerified && <span className="text-cyan-400 text-[10px]">✓</span>}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">@{u.username}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Category Pills Horizontal Scroller */}
      <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20 scale-[1.02]'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800/80 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Featured Creators Spotlight */}
      {creators.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-4 shadow-xl backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Featured Creators</h3>
            </div>
            <Link to="/search" className="text-[11px] font-bold text-cyan-400 hover:underline">
              See All
            </Link>
          </div>

          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
            {creators.map(c => {
              const isFollowed = followingMap[c.id];
              return (
                <div
                  key={c.id}
                  className="flex flex-col items-center p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl min-w-[120px] max-w-[130px] flex-shrink-0 text-center space-y-2 hover:border-slate-700 transition-colors"
                >
                  <Avatar src={c.avatarUrl} username={c.username} size="md" />
                  <div className="w-full">
                    <p className="font-bold text-xs text-white truncate">{c.displayName}</p>
                    <p className="text-[10px] text-slate-400 truncate">@{c.username}</p>
                  </div>
                  <button
                    onClick={() => handleFollow(c.id)}
                    className={`w-full py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      isFollowed
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm'
                    }`}
                  >
                    {isFollowed ? 'Following' : 'Follow'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Explore Masonry / 3-Column Grid Layout */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 px-1">
          <Compass className="w-5 h-5 text-cyan-400" />
          <h2 className="font-extrabold text-base text-white tracking-tight">Explore Feed</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
              <div key={i} className="aspect-square bg-slate-800/60 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-2">
            <Compass className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="font-bold text-sm text-slate-300">No posts in this category yet</p>
            <p className="text-xs text-slate-500">Explore other topics or share your own thoughts!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredPosts.map((post, idx) => {
              const media = post.media && post.media.length > 0 ? post.media[0] : null;
              const isVideo = media?.type === 'VIDEO';
              const mediaUrl = media?.url
                ? (media.url.startsWith('http') ? media.url : `http://localhost:8080${media.url}`)
                : null;

              return (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="relative aspect-square bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 group cursor-pointer shadow-md hover:border-slate-700 transition-all duration-200"
                >
                  {mediaUrl ? (
                    isVideo ? (
                      getYouTubeId(mediaUrl) ? (
                        <img
                          src={getYouTubeThumbnail(mediaUrl)}
                          alt="Explore YouTube Video"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <video
                          src={resolveSafeMediaUrl(mediaUrl)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          muted
                          playsInline
                        />
                      )
                    ) : (
                      <img
                        src={mediaUrl}
                        alt="Explore"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )
                  ) : (
                    <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br from-slate-900 to-indigo-950/60 text-slate-200 text-xs">
                      <p className="line-clamp-4 font-medium">{post.caption}</p>
                      <span className="text-[10px] text-cyan-400 font-bold">@{post.username}</span>
                    </div>
                  )}

                  {/* Media Type Icon Badge */}
                  {isVideo && (
                    <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 text-white backdrop-blur-md">
                      <Play className="w-3.5 h-3.5 fill-white" />
                    </div>
                  )}
                  {post.media && post.media.length > 1 && (
                    <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 text-white backdrop-blur-md">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                  )}

                  {/* Hover Stat Overlay */}
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4 text-white font-bold text-xs">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4 fill-white text-white" />
                      <span>{post.likesCount || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4 fill-white text-white" />
                      <span>{post.commentsCount || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Post Lightbox Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-2">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <PostCard post={selectedPost} />
          </div>
        </div>
      )}
    </div>
  );
};
