import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { userService } from '../../services/services';
import { useAuth } from '../../context/AuthContext';
import { Camera, Lock, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export const EditProfileModal = ({ isOpen, onClose, user, profile, onUpdated, onProfileUpdated }) => {
  const { user: authUser, updateUserState } = useAuth();
  const currentUser = profile || user || authUser || {};

  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [website, setWebsite] = useState(currentUser.website || '');
  const [location, setLocation] = useState(currentUser.location || '');
  const [isPrivate, setIsPrivate] = useState(Boolean(currentUser.isPrivate));
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatarUrl);
  const [coverPreview, setCoverPreview] = useState(currentUser.coverUrl);
  const [saving, setSaving] = useState(false);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(currentUser.displayName || '');
      setBio(currentUser.bio || '');
      setWebsite(currentUser.website || '');
      setLocation(currentUser.location || '');
      setIsPrivate(Boolean(currentUser.isPrivate));
      setAvatarPreview(currentUser.avatarUrl);
      setCoverPreview(currentUser.coverUrl);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleAvatarFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await userService.uploadAvatar(formData);
      const url = res.data?.avatar_url || res.data;
      setAvatarPreview(url);
      updateUserState({ avatarUrl: url });
      toast.success('Avatar updated!');
    } catch (err) {
      toast.error('Failed to upload avatar');
    }
  };

  const handleCoverFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('cover', file);
      const res = await userService.uploadCover(formData);
      const url = res.data?.cover_url || res.data;
      setCoverPreview(url);
      updateUserState({ coverUrl: url });
      toast.success('Cover photo updated!');
    } catch (err) {
      toast.error('Failed to upload cover');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userService.updateProfile({
        displayName,
        bio,
        website,
        location,
        isPrivate
      });
      toast.success('Profile updated successfully!');
      const updatedData = res.data?.data || res.data || {};
      updateUserState(updatedData);
      if (onUpdated) onUpdated(updatedData);
      if (onProfileUpdated) onProfileUpdated(updatedData);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cover Photo Preview & Upload */}
        <div className="relative h-28 bg-zinc-800 rounded-2xl overflow-hidden group">
          {coverPreview ? (
            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600" />
          )}
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-semibold text-xs space-x-1 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Change Cover</span>
          </button>
        </div>
        <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverFile} className="hidden" />

        {/* Avatar Preview & Upload */}
        <div className="flex items-center space-x-4 px-2">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-zinc-800 border-2 border-cyan-400 group shrink-0">
            <img
              src={avatarPreview || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username || 'user'}`}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{currentUser.displayName || currentUser.username}</h4>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="text-xs font-semibold text-cyan-500 hover:underline cursor-pointer"
            >
              Change profile photo
            </button>
          </div>
        </div>
        <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />

        {/* Display Name Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-cyan-500"
            placeholder="Your name"
          />
        </div>

        {/* Bio Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-cyan-500 resize-none"
            placeholder="Tell your story..."
          />
        </div>

        {/* Website Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Website</label>
          <div className="relative">
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-cyan-500"
              placeholder="https://yourportfolio.com"
            />
          </div>
        </div>

        {/* Location Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-cyan-500"
            placeholder="Bengaluru, India"
          />
        </div>

        {/* Private Account Switch */}
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Private Account</p>
              <p className="text-[10px] text-slate-400">Only approved followers can see your posts</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 cursor-pointer"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-md shadow-cyan-500/25 hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
