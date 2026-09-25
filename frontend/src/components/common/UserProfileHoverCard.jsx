import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from './Avatar';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/services';
import { CheckCircle2, UserPlus, UserCheck, ExternalLink, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const UserProfileHoverCard = ({
  username,
  children,
  className = '',
  initialData = null
}) => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialData?.isFollowing || false);
  const [followersCount, setFollowersCount] = useState(initialData?.followersCount || 0);
  const [actionLoading, setActionLoading] = useState(false);

  const timeoutRef = useRef(null);
  const isMe = currentUser?.username === username;

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
      if (!profile || profile.username !== username) {
        fetchProfile();
      }
    }, 350);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  const fetchProfile = async () => {
    if (!username) return;
    setLoading(true);
    try {
      const res = await userService.getProfile(username);
      const data = res.data?.data || res.data;
      if (data) {
        setProfile(data);
        setIsFollowing(Boolean(data.isFollowing));
        setFollowersCount(data.followersCount || data.followerCount || 0);
      }
    } catch (err) {
      // Fallback display if API errors
      if (!profile) {
        setProfile({
          username: username,
          fullName: username,
          bio: 'Community member on Pulse Social Hub.',
          postsCount: 1,
          followersCount: 0,
          followingCount: 0
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please log in to follow users');
      return;
    }
    if (!profile?.id) return;

    setActionLoading(true);
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setFollowersCount(prev => nextState ? prev + 1 : Math.max(0, prev - 1));

    try {
      if (nextState) {
        await userService.followUser(profile.id);
        toast.success(`Following @${username} 🎉`);
      } else {
        await userService.unfollowUser(profile.id);
        toast.success(`Unfollowed @${username}`);
      }
    } catch (err) {
      // Revert on error
      setIsFollowing(!nextState);
      setFollowersCount(prev => !nextState ? prev + 1 : Math.max(0, prev - 1));
      toast.error('Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isOpen && (
        <div
          className="absolute left-0 bottom-full mb-2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95 duration-200"
          onMouseEnter={() => clearTimeout(timeoutRef.current)}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {loading && !profile ? (
            <div className="flex items-center justify-center py-8 space-x-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
              <span className="text-xs font-semibold">Loading profile...</span>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Header: Avatar, Names & Follow Button */}
              <div className="flex items-start justify-between">
                <Avatar
                  src={profile?.avatarUrl}
                  username={username}
                  size="lg"
                  className="ring-2 ring-primary-500/20"
                />

                {!isMe && isAuthenticated && (
                  <button
                    onClick={handleToggleFollow}
                    disabled={actionLoading}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer ${
                      isFollowing
                        ? 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:text-slate-300 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700'
                        : 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-500/20'
                    }`}
                  >
                    {actionLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Names & Handle */}
              <div>
                <Link
                  to={`/profile/${username}`}
                  className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:underline flex items-center space-x-1"
                >
                  <span>{profile?.fullName || username}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-500 fill-primary-500/20" />
                </Link>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                  @{username}
                </p>
              </div>

              {/* Bio */}
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                {profile?.bio || 'Building and exploring the next generation of social web experiences.'}
              </p>

              {/* Stats Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="text-center">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 block text-sm">
                    {profile?.postsCount || profile?.postCount || 0}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Posts</span>
                </div>
                <div className="text-center">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 block text-sm">
                    {followersCount}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Followers</span>
                </div>
                <div className="text-center">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 block text-sm">
                    {profile?.followingCount || 0}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Following</span>
                </div>
              </div>

              {/* Full Profile Link */}
              <Link
                to={`/profile/${username}`}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>View Full Profile</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfileHoverCard;
