import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { userService, postService } from '../services/services';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/common/Avatar';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { FollowListModal } from '../components/profile/FollowListModal';
import { PostCard } from '../components/post/PostCard';
import StoryHighlights from '../components/profile/StoryHighlights';
import CreatorAnalyticsTab from '../components/profile/CreatorAnalyticsTab';
import {
  Grid,
  Tv,
  Bookmark,
  Globe,
  Lock,
  Edit3,
  UserPlus,
  UserCheck,
  Clock,
  MessageCircle,
  BarChart3,
  MapPin,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [followModal, setFollowModal] = useState({ isOpen: false, type: 'followers' });

  useEffect(() => {
    loadProfile();
  }, [username]);

  useEffect(() => {
    if (profile && activeTab !== 'analytics') {
      loadUserPosts();
    }
  }, [profile, activeTab]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await userService.getProfile(username);
      if (res.data?.success && res.data.data) {
        setProfile(res.data.data);
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
      const res = await postService.getUserPosts(username, activeTab, 1, 20);
      if (res.data?.success && res.data.data) {
        setPosts(res.data.data.posts || []);
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
        toast.success(res.data?.message || 'Followed');
      }
    } catch (err) {
      toast.error(err.message || 'Follow action failed');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center space-y-3 border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">User not found</h3>
        <p className="text-xs text-slate-400">The account you are looking for does not exist or has been removed.</p>
        <Link to="/" className="inline-block px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-semibold">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Profile Card & Cover Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Cover Photo */}
        <div className="h-44 sm:h-52 w-full bg-gradient-to-r from-primary-600 via-indigo-600 to-pink-600 relative">
          {profile.coverUrl && (
            <img src={profile.coverUrl.startsWith('http') ? profile.coverUrl : `http://localhost:8080${profile.coverUrl}`} alt="Cover" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Profile Details Header */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-4 gap-4">
            {/* Avatar */}
            <div className="relative inline-block">
              <img
                src={profile.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
                alt={profile.username}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-xl bg-slate-800"
              />
              {profile.isOnline && (
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" title="Online now" />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2.5">
              {profile.isSelf ? (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 transition-colors flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleFollowToggle}
                    className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer ${
                      profile.followStatus === 'ACCEPTED'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600'
                        : profile.followStatus === 'PENDING'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/25'
                    }`}
                  >
                    {profile.followStatus === 'ACCEPTED' ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Following</span>
                      </>
                    ) : profile.followStatus === 'PENDING' ? (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>Requested</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => navigate('/messages')}
                    className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-sm cursor-pointer"
                    title="Direct Message"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>{profile.displayName || profile.username}</span>
                  {profile.isVerified && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] font-black" title="Verified Creator Badge">
                      ✓
                    </span>
                  )}
                </h1>
                {profile.isPrivate && <Lock className="w-4 h-4 text-amber-500" title="Private Account" />}
              </div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">@{profile.username}</p>
            </div>

            {profile.bio && (
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-xl">
                {profile.bio}
              </p>
            )}

            {/* Location & Website Meta */}
            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary-500" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <a
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
            </div>

            {/* Counts */}
            <div className="flex items-center space-x-6 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <div>
                <span className="font-black text-sm text-slate-900 dark:text-slate-100 mr-1.5">{posts.length}</span>
                <span className="text-slate-500 dark:text-slate-400">Posts</span>
              </div>
              <button
                onClick={() => setFollowModal({ isOpen: true, type: 'followers' })}
                className="hover:underline focus:outline-none cursor-pointer"
              >
                <span className="font-black text-sm text-slate-900 dark:text-slate-100 mr-1.5">{profile.followersCount || 0}</span>
                <span className="text-slate-500 dark:text-slate-400">Followers</span>
              </button>
              <button
                onClick={() => setFollowModal({ isOpen: true, type: 'following' })}
                className="hover:underline focus:outline-none cursor-pointer"
              >
                <span className="font-black text-sm text-slate-900 dark:text-slate-100 mr-1.5">{profile.followingCount || 0}</span>
                <span className="text-slate-500 dark:text-slate-400">Following</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Story Highlights Bar */}
      <StoryHighlights username={profile.username} isOwnProfile={profile.isSelf} />

      {/* Profile Navigation Tabs */}
      <div className="flex items-center justify-around bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 p-1.5 shadow-sm">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'posts'
              ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'videos'
              ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>Videos</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Creator Insights</span>
        </button>

        {profile.isSelf && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved</span>
          </button>
        )}
      </div>

      {/* Tab Content Display */}
      {activeTab === 'analytics' ? (
        <CreatorAnalyticsTab username={profile.username} />
      ) : loadingPosts ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-square rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center space-y-2 border border-slate-200/70 dark:border-slate-800">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No content here yet</p>
          <p className="text-xs text-slate-400">When posts are published, they will appear on this grid.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(p => (
            <PostCard key={p.id} post={p} onDelete={() => loadUserPosts()} />
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={profile}
          onUpdated={(u) => setProfile(prev => ({ ...prev, ...u }))}
        />
      )}

      {/* Followers / Following Modal */}
      {followModal.isOpen && (
        <FollowListModal
          isOpen={followModal.isOpen}
          onClose={() => setFollowModal({ isOpen: false, type: 'followers' })}
          userId={profile.id}
          type={followModal.type}
        />
      )}
    </div>
  );
};
