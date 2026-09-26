import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { userService, postService } from '../services/services';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/common/Avatar';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { FollowListModal } from '../components/profile/FollowListModal';
import ShareProfileModal from '../components/profile/ShareProfileModal';
import PostViewerModal from '../components/profile/PostViewerModal';
import StoryHighlights from '../components/profile/StoryHighlights';
import CreatorAnalyticsTab from '../components/profile/CreatorAnalyticsTab';
import { soundFx } from '../utils/audioEffects';
import { getYouTubeId, getYouTubeThumbnail, resolveSafeMediaUrl, API_BASE_ORIGIN } from '../utils/mediaUtils';
import {
  Grid,
  Film,
  Tv,
  Tag,
  Bookmark,
  Globe,
  Lock,
  Edit3,
  UserPlus,
  UserCheck,
  Calendar,
  MessageCircle,
  BarChart3,
  MapPin,
  Sparkles,
  Share2,
  Check,
  Play,
  Heart,
  Layers,
  FolderPlus,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'reels' | 'videos' | 'tagged' | 'saved' | 'analytics'
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [followModal, setFollowModal] = useState({ isOpen: false, type: 'followers' });
  const [viewerModal, setViewerModal] = useState({ isOpen: false, initialIndex: 0 });
  const [savedCollection, setSavedCollection] = useState('all'); // 'all' | 'Projects' | 'Inspiration' | 'Coding' | 'Travel'

  useEffect(() => {
    loadProfile();
  }, [username]);

  useEffect(() => {
    if (profile && activeTab !== 'analytics') {
      loadUserPosts();
    }
  }, [profile, activeTab, savedCollection]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await userService.getProfile(username);
      const data = res.data?.data || res.data || (res.success ? res.data : null);
      if (data) {
        setProfile(data);
      }
    } catch (err) {
      toast.error('User not found');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async () => {
    setLoadingPosts(true);
    try {
      const apiTab = activeTab === 'reels' ? 'videos' : activeTab;
      const res = await postService.getUserPosts(username, apiTab, 1, 30);
      const data = res.data?.data || res.data || (res.success ? res.data : null);
      if (data) {
        const list = data.posts || data || [];
        setPosts(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to follow users');
      return;
    }
    soundFx.playChimeCTA();
    try {
      if (profile.followStatus === 'ACCEPTED' || profile.followStatus === 'PENDING') {
        await userService.unfollowUser(profile.id);
        setProfile(prev => ({
          ...prev,
          followStatus: 'NONE',
          followersCount: Math.max(0, prev.followersCount - 1)
        }));
        toast.success('Unfollowed');
      } else {
        const res = await userService.followUser(profile.id);
        const newStatus = res.data?.status || 'ACCEPTED';
        setProfile(prev => ({
          ...prev,
          followStatus: newStatus,
          followersCount: newStatus === 'ACCEPTED' ? prev.followersCount + 1 : prev.followersCount
        }));
        toast.success(res.data?.message || 'Followed creator! 🎉');
      }
    } catch (err) {
      toast.error(err.message || 'Follow action failed');
    }
  };

  const handleOpenViewer = (index) => {
    soundFx.playSwipeTick();
    setViewerModal({ isOpen: true, initialIndex: index });
  };

  const handlePostUpdate = (postId, updates) => {
    setPosts(prev => prev.map(p => (p.id === postId ? { ...p, ...updates } : p)));
  };

  const handlePostDelete = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setViewerModal({ isOpen: false, initialIndex: 0 });
    setProfile(prev => prev ? { ...prev, postsCount: Math.max(0, (prev.postsCount || 1) - 1) } : prev);
  };

  const handleDirectDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
    try {
      await postService.deletePost(postId);
      toast.success('Post deleted successfully');
      handlePostDelete(postId);
    } catch (err) {
      toast.error(err.message || 'Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse max-w-4xl mx-auto">
        <div className="h-48 bg-slate-200 dark:bg-slate-900 rounded-3xl" />
        <div className="h-32 bg-slate-200 dark:bg-slate-900 rounded-3xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center space-y-3 border border-slate-200 dark:border-slate-800 max-w-xl mx-auto">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">User not found</h3>
        <p className="text-xs text-slate-400">The account you are looking for does not exist or has been removed.</p>
        <Link to="/" className="inline-block px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* 1. PROFESSIONAL PROFILE HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
          {/* Avatar with Gradient Story Ring */}
          <div className="relative group shrink-0">
            <div className="p-1 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-500 shadow-xl shadow-cyan-500/20">
              <img
                src={profile.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
                alt={profile.displayName || profile.username}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-slate-900 object-cover"
              />
            </div>
          </div>

          {/* User Details & Action Controls */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            {/* Username & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {profile.username}
                </h1>
                {profile.isVerified && (
                  <span className="p-1 rounded-full bg-cyan-500 text-slate-950 shadow-sm" title="Verified Creator">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2">
                {profile.isSelf ? (
                  <>
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Share Profile
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleFollowToggle}
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                        profile.followStatus === 'ACCEPTED'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700'
                          : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black shadow-cyan-500/25 active:scale-95'
                      }`}
                    >
                      {profile.followStatus === 'ACCEPTED' ? 'Following' : 'Follow'}
                    </button>
                    <button
                      onClick={() => navigate(`/messages?user=${profile.username}`)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Message
                    </button>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Counts / Statistics */}
            <div className="flex items-center justify-center md:justify-start space-x-8 pt-1 text-sm">
              <div>
                <span className="font-black text-slate-900 dark:text-white mr-1.5">{profile.postsCount || posts.length}</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Posts</span>
              </div>
              <button
                onClick={() => setFollowModal({ isOpen: true, type: 'followers' })}
                className="hover:underline focus:outline-none cursor-pointer"
              >
                <span className="font-black text-slate-900 dark:text-white mr-1.5">{profile.followersCount || 0}</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Followers</span>
              </button>
              <button
                onClick={() => setFollowModal({ isOpen: true, type: 'following' })}
                className="hover:underline focus:outline-none cursor-pointer"
              >
                <span className="font-black text-slate-900 dark:text-white mr-1.5">{profile.followingCount || 0}</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Following</span>
              </button>
            </div>

            {/* Name & Bio Description */}
            <div className="space-y-1.5 pt-1">
              <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {profile.displayName || profile.username}
              </h2>

              {profile.bio && (
                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed max-w-lg">
                  {profile.bio}
                </p>
              )}

              {/* Website, Location & Metadata Links */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                {profile.website && (
                  <a
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-cyan-500 hover:underline font-semibold"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined Pulse</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STORY HIGHLIGHTS */}
      <StoryHighlights username={profile.username} isOwnProfile={profile.isSelf} />

      {/* 3. PROFILE NAVIGATION TABS */}
      <div className="flex items-center justify-around bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 p-1.5 shadow-sm">
        <button
          onClick={() => {
            soundFx.playSwipeTick();
            setActiveTab('posts');
          }}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'posts'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>POSTS</span>
        </button>

        <button
          onClick={() => {
            soundFx.playSwipeTick();
            setActiveTab('reels');
          }}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'reels'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>REELS</span>
        </button>

        <button
          onClick={() => {
            soundFx.playSwipeTick();
            setActiveTab('videos');
          }}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'videos'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>VIDEOS</span>
        </button>

        <button
          onClick={() => {
            soundFx.playSwipeTick();
            setActiveTab('tagged');
          }}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'tagged'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>TAGGED</span>
        </button>

        {profile.isSelf && (
          <button
            onClick={() => {
              soundFx.playSwipeTick();
              setActiveTab('saved');
            }}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>SAVED</span>
          </button>
        )}
      </div>

      {/* 4. SAVED COLLECTIONS SUB-FILTER (When Saved Tab Active) */}
      {activeTab === 'saved' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['all', 'Projects', 'Inspiration', 'Coding', 'Travel'].map(col => (
            <button
              key={col}
              onClick={() => setSavedCollection(col)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                savedCollection === col
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {col === 'all' ? 'All Saved' : col}
            </button>
          ))}
        </div>
      )}

      {/* 5. 3-COLUMN MEDIA GRID & TAB CONTENT */}
      {loadingPosts ? (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
            <div key={i} className="aspect-square rounded-2xl bg-slate-200 dark:bg-slate-800/80 animate-pulse" />
          ))}
        </div>
      ) : activeTab === 'tagged' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center space-y-3 border border-slate-200/70 dark:border-slate-800">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center">
            <Tag className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Photos and Videos of You</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            When people tag you in photos or reels, they will appear here on your profile.
          </p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center space-y-3 border border-slate-200/70 dark:border-slate-800">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center">
            <Grid className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">No Content Yet</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {profile.isSelf ? 'Share your first photo or video reel with the Pulse community!' : `@${profile.username} hasn't posted any media yet.`}
          </p>
        </div>
      ) : (
        /* 3-Column Instagram-Grade Media Grid */
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
          {posts.map((post, index) => {
            const mediaList = post.media || post.mediaList || [];
            const primaryMedia = mediaList.length > 0 ? mediaList[0] : null;
            const isVideo = post.postType === 'VIDEO' || (primaryMedia && primaryMedia.mediaType === 'VIDEO') || post.videoUrl;
            const isCarousel = mediaList.length > 1;

            const mediaUrl = primaryMedia?.url
              ? (primaryMedia.url.startsWith('http') ? primaryMedia.url : `${API_BASE_ORIGIN}${primaryMedia.url}`)
              : (post.videoUrl || post.imageUrl || '');

            return (
              <div
                key={post.id || index}
                onClick={() => handleOpenViewer(index)}
                className="group relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 cursor-pointer shadow-sm hover:shadow-xl transition-all"
              >
                {/* Media Image / Video Poster */}
                {isVideo && mediaUrl ? (
                  getYouTubeId(mediaUrl) ? (
                    <img
                      src={getYouTubeThumbnail(mediaUrl)}
                      alt={post.caption || 'YouTube Video'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <video
                      src={resolveSafeMediaUrl(mediaUrl)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  )
                ) : mediaUrl ? (
                  <img
                    src={mediaUrl}
                    alt={post.caption || 'Post thumbnail'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white text-center">
                    <Sparkles className="w-6 h-6 text-cyan-400 mb-1 animate-pulse" />
                    <p className="text-[10px] font-bold line-clamp-2">{post.caption}</p>
                  </div>
                )}

                {/* Video / Carousel Badges */}
                <div className="absolute top-2 right-2 z-10 pointer-events-none">
                  {isVideo ? (
                    <span className="p-1 rounded-md bg-black/60 backdrop-blur-md text-white">
                      <Play className="w-3.5 h-3.5 fill-white" />
                    </span>
                  ) : isCarousel ? (
                    <span className="p-1 rounded-md bg-black/60 backdrop-blur-md text-white">
                      <Layers className="w-3.5 h-3.5" />
                    </span>
                  ) : null}
                </div>

                {/* Direct Delete button on hover for own profile */}
                {Boolean(profile?.isSelf || (currentUser && currentUser.username === username)) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDirectDeletePost(post.id);
                    }}
                    className="absolute top-2 left-2 z-30 p-1.5 rounded-xl bg-black/70 hover:bg-rose-600 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-lg hover:scale-110"
                    title="Delete Post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Dark Hover Overlay with Likes and Comments */}
                <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white z-20 pointer-events-none">
                  <div className="flex items-center gap-1.5 font-extrabold text-xs">
                    <Heart className="w-4 h-4 fill-white text-white" />
                    <span>{post.likesCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-extrabold text-xs">
                    <MessageCircle className="w-4 h-4 fill-white text-white" />
                    <span>{post.commentsCount || 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Viewer Modal */}
      <PostViewerModal
        isOpen={viewerModal.isOpen}
        onClose={() => setViewerModal({ isOpen: false, initialIndex: 0 })}
        posts={posts}
        initialIndex={viewerModal.initialIndex}
        onPostUpdate={handlePostUpdate}
        onPostDelete={handlePostDelete}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onProfileUpdated={loadProfile}
      />

      {/* Share Profile Modal */}
      <ShareProfileModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        profile={profile}
      />

      {/* Follow List Modal (Followers / Following) */}
      <FollowListModal
        isOpen={followModal.isOpen}
        onClose={() => setFollowModal({ ...followModal, isOpen: false })}
        userId={profile.id}
        type={followModal.type}
      />
    </div>
  );
};
