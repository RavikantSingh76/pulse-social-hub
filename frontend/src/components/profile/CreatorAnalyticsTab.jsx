import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/services';
import { BarChart3, TrendingUp, Eye, ThumbsUp, MessageSquare, Users } from 'lucide-react';

export default function CreatorAnalyticsTab({ username }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) fetchAnalytics();
  }, [username]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getCreatorAnalytics(username);
      if (res.data?.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-600"></div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6 pt-4">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Reach</span>
            <Eye className="w-4 h-4 text-primary-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {analytics.totalProfileViews.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +14.2% this week
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Post Impressions</span>
            <BarChart3 className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {analytics.totalPostViews.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +8.5%
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Engagement</span>
            <ThumbsUp className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {analytics.totalLikes.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +19.1%
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Follower Growth</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {analytics.totalFollowers.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> Organic Growth
          </span>
        </div>
      </div>

      {/* Weekly Activity Reach Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white mb-1">Weekly Audience Activity</h3>
        <p className="text-xs text-slate-500 mb-6">Audience impression distribution over past 7 days</p>

        <div className="flex items-end justify-between gap-3 h-44 pt-6 px-2">
          {analytics.weeklyActivity?.map((item) => {
            const heightPercent = Math.min(100, Math.max(15, (item.reach / 700) * 100));
            return (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full flex items-end justify-center h-32">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[2.5rem] bg-gradient-to-t from-primary-600 to-indigo-500 rounded-t-xl transition-all duration-500 group-hover:from-primary-500 group-hover:to-pink-500 shadow-md group-hover:scale-105"
                  />
                  {/* Tooltip */}
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-7 text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded transition-opacity font-semibold whitespace-nowrap">
                    {item.reach} reach
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-500">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
