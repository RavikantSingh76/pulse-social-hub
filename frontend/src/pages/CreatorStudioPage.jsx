import React, { useState, useEffect } from 'react';
import { creatorStudioService, postService } from '../services/services';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Video,
  FileText,
  Film,
  Sparkles,
  Layers,
  ArrowUpRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CreatorStudioPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [tabContent, setTabContent] = useState([]);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingTabContent, setLoadingTabContent] = useState(false);

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (user?.username) {
      fetchTabContent();
    }
  }, [activeTab, user?.username]);

  const fetchOverview = async () => {
    try {
      setLoadingOverview(true);
      const res = await creatorStudioService.getOverview();
      if (res.data?.success) {
        setOverview(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load Creator Studio analytics');
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchTabContent = async () => {
    try {
      setLoadingTabContent(true);
      const res = await postService.getUserPosts(user.username, activeTab, 1, 30);
      if (res.data?.success) {
        setTabContent(res.data.data.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTabContent(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Studio Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-400" />
              <span className="text-xs font-black uppercase tracking-widest text-primary-400">Creator Studio & Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, {user?.displayName || user?.username}!
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Track your audience reach, video impressions, engagement performance, and manage your published catalog.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/profile/${user?.username}`}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-xs transition-colors border border-white/15"
            >
              Public Profile
            </Link>
            <Link
              to="/"
              className="px-5 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs transition-colors shadow-lg shadow-primary-600/30"
            >
              Create Content
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Overview Metrics Grid */}
      {loadingOverview ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-28 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : overview && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Total Followers */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <Users className="w-5 h-5 text-primary-500" />
                <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +{overview.followersGrowthThisMonth} mo
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{overview.totalFollowers}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Followers</p>
            </div>

            {/* Total Views */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <Eye className="w-5 h-5 text-indigo-500" />
                <span className="text-[11px] text-primary-500 font-semibold">Impressions</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{overview.totalViews}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Content Views</p>
            </div>

            {/* Engagement Rate */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <TrendingUp className="w-5 h-5 text-pink-500" />
                <span className="text-[11px] text-pink-500 font-bold">Top 5%</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{overview.engagementRate}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Engagement Rate</p>
            </div>

            {/* Total Likes */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <Heart className="w-5 h-5 text-rose-500" />
                <span className="text-[11px] text-rose-500 font-semibold">Reactions</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{overview.totalLikes}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Likes Received</p>
            </div>

            {/* Total Comments */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <MessageCircle className="w-5 h-5 text-purple-500" />
                <span className="text-[11px] text-purple-500 font-semibold">Community</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{overview.totalComments}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Comments</p>
            </div>

            {/* Total Shares */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <Share2 className="w-5 h-5 text-amber-500" />
                <span className="text-[11px] text-amber-500 font-semibold">Amplification</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{overview.totalShares}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Organic Shares</p>
            </div>

            {/* Total Saves */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <Bookmark className="w-5 h-5 text-emerald-500" />
                <span className="text-[11px] text-emerald-500 font-semibold">Bookmarks</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{overview.totalSaves}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Saved by Users</p>
            </div>

            {/* Content Count */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <Layers className="w-5 h-5 text-blue-500" />
                <span className="text-[11px] text-blue-500 font-semibold">Catalog</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{overview.totalPosts + overview.totalVideos}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Published Items</p>
            </div>
          </div>

          {/* 7-Day Audience Reach Bar Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary-500" />
                  Weekly Audience Reach & Impressions
                </h3>
                <p className="text-xs text-slate-400">Daily profile exposure and feed views over the past 7 days.</p>
              </div>
            </div>

            <div className="flex items-end justify-between h-44 pt-6 px-4 gap-2">
              {overview.reachChart && overview.reachChart.map((point, idx) => {
                const maxReach = Math.max(...overview.reachChart.map(p => p.reach), 1);
                const heightPercent = Math.max(15, Math.round((point.reach / maxReach) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {point.reach}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-primary-600 to-indigo-500 group-hover:from-primary-500 group-hover:to-pink-500 transition-all shadow-sm"
                    />
                    <span className="text-xs font-semibold text-slate-500">{point.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Content Management Workstation */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Content Management</h3>
            <p className="text-xs text-slate-400">Review metrics per post, video, and short reel.</p>
          </div>

          {/* Tab Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            {[
              { id: 'posts', label: 'Posts', icon: FileText },
              { id: 'videos', label: 'Videos', icon: Video },
              { id: 'reels', label: 'Reels', icon: Film }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Table */}
        {loadingTabContent ? (
          <div className="py-12 text-center text-slate-400 text-xs animate-pulse">Loading content performance...</div>
        ) : tabContent.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs space-y-2">
            <p>No content published in this category yet.</p>
            <p className="text-[11px]">Publish your first {activeTab.slice(0, -1)} to see analytics here!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tabContent.map(item => (
              <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-2xl px-3 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  {item.media && item.media.length > 0 ? (
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0">
                      {item.media[0].type === 'VIDEO' || item.media[0].url.endsWith('.mp4') ? (
                        <video src={item.media[0].url.startsWith('http') ? item.media[0].url : `http://localhost:8080${item.media[0].url}`} className="w-full h-full object-cover" />
                      ) : (
                        <img src={item.media[0].url.startsWith('http') ? item.media[0].url : `http://localhost:8080${item.media[0].url}`} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      TXT
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-sm">
                      {item.caption || item.title || 'Untitled Post'}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(item.createdAt).toLocaleDateString()}</span>
                      <span className="capitalize px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold">{item.visibility.toLowerCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5" title="Views">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <span className="font-bold">{item.viewCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5" title="Likes">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span className="font-bold">{item.likesCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5" title="Comments">
                    <MessageCircle className="w-4 h-4 text-primary-500" />
                    <span className="font-bold">{item.commentsCount || 0}</span>
                  </div>
                  <Link
                    to={`/posts/${item.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 font-bold hover:bg-primary-100 text-xs transition-colors"
                  >
                    View Post
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
