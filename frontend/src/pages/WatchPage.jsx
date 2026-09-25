import React, { useState, useEffect } from 'react';
import { postService } from '../services/services';
import { Avatar } from '../components/common/Avatar';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Tv, Play, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getYouTubeId, getYouTubeThumbnail, resolveSafeMediaUrl } from '../utils/mediaUtils';

export const WatchPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const res = await postService.getVideos(1, 20);
      if (res.success && res.data) {
        const vids = res.data.videos || [];
        setVideos(vids);
        if (vids.length > 0 && !activeVideo) {
          setActiveVideo(vids[0]);
          postService.recordVideoView(vids[0].id).catch(() => {});
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVideo = (video) => {
    setActiveVideo(video);
    postService.recordVideoView(video.id).catch(() => {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to like videos');
      return;
    }
    if (!activeVideo) return;
    try {
      const res = await postService.toggleLike(activeVideo.id);
      setActiveVideo(prev => ({
        ...prev,
        isLiked: res.data.is_liked,
        likesCount: res.data.likes_count
      }));
    } catch (err) {
      toast.error('Failed to like video');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-96 bg-gray-200 dark:bg-zinc-800 rounded-3xl" />
        <div className="h-20 bg-gray-200 dark:bg-zinc-800 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Featured Video Player */}
      {activeVideo && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/80 overflow-hidden shadow-sm space-y-4">
          {/* Player Container */}
          <div className="relative bg-black aspect-video flex items-center justify-center">
            {(() => {
              const rawUrl = activeVideo.media?.[0]?.url;
              const ytId = getYouTubeId(rawUrl);
              if (ytId) {
                return (
                  <iframe
                    key={activeVideo.id}
                    src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&controls=1&rel=0&playsinline=1`}
                    title={activeVideo.title || 'Pulse Video'}
                    className="w-full h-full object-contain border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; compute-pressure; web-share"
                    allowFullScreen
                  />
                );
              }
              return (
                <video
                  key={activeVideo.id}
                  src={resolveSafeMediaUrl(rawUrl)}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              );
            })()}
          </div>

          {/* Video Metadata & Creator */}
          <div className="p-6 pt-2 space-y-4">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100">
                {activeVideo.title || 'Studio Video Presentation'}
              </h1>
              <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-zinc-400">
                <span>{activeVideo.viewCount || 0} views</span>
                <span>•</span>
                <span>{activeVideo.createdAt ? formatDistanceToNow(new Date(activeVideo.createdAt), { addSuffix: true }) : ''}</span>
              </div>
            </div>

            {/* Creator Row & Engagement */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800/80">
              <div className="flex items-center space-x-3">
                <Avatar src={activeVideo.avatarUrl} username={activeVideo.username} size="md" />
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{activeVideo.displayName}</h4>
                  <p className="text-xs text-gray-400">@{activeVideo.username}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-2xl border text-xs font-bold transition-all ${
                    activeVideo.isLiked
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600'
                      : 'border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${activeVideo.isLiked ? 'fill-rose-500' : ''}`} />
                  <span>{activeVideo.likesCount || 0}</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/post/${activeVideo.id}`);
                    toast.success('Video link copied!');
                  }}
                  className="p-2.5 rounded-2xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Caption */}
            {activeVideo.caption && (
              <p className="text-xs sm:text-sm text-gray-700 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-2xl leading-relaxed">
                {activeVideo.caption}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Up Next / Video Queue */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 px-1">
          <Tv className="w-5 h-5 text-purple-500" />
          <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">Trending Videos</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {videos.map(v => (
            <div
              key={v.id}
              onClick={() => handleSelectVideo(v)}
              className={`cursor-pointer rounded-2xl border bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-md transition-all group ${
                activeVideo?.id === v.id ? 'ring-2 ring-purple-500 border-transparent' : 'border-gray-100 dark:border-zinc-800/80'
              }`}
            >
              <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
                <img
                  src={getYouTubeThumbnail(v.media?.[0]?.url) || v.media?.[0]?.thumbnailUrl || v.avatarUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80'}
                  alt={v.title || 'Video preview'}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white group-hover:scale-110 shadow-lg transition-transform">
                    <Play className="w-5 h-5 fill-white" />
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 line-clamp-1">
                  {v.title || v.caption || 'Video Session'}
                </h4>
                <div className="flex items-center space-x-2">
                  <Avatar src={v.avatarUrl} username={v.username} size="xs" />
                  <span className="text-xs text-gray-600 dark:text-zinc-400">{v.displayName}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-400">{v.viewCount || 0} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
