import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { userService } from '../../services/services';
import { useAuth } from '../../context/AuthContext';
import { Camera, Lock, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export const EditProfileModal = ({ isOpen, onClose, user, onUpdated }) => {
  const { updateUserState } = useAuth();
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [bio, setBio] = useState(user.bio || '');
  const [website, setWebsite] = useState(user.website || '');
  const [isPrivate, setIsPrivate] = useState(Boolean(user.isPrivate));
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl);
  const [coverPreview, setCoverPreview] = useState(user.coverUrl);
  const [saving, setSaving] = useState(false);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleAvatarFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await userService.uploadAvatar(formData);
      setAvatarPreview(res.data.avatar_url);
      updateUserState({ avatarUrl: res.data.avatar_url });
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
      setCoverPreview(res.data.cover_url);
      updateUserState({ coverUrl: res.data.cover_url });
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
        isPrivate
      });
      toast.success('Profile updated!');
      updateUserState(res.data);
      if (onUpdated) onUpdated(res.data);
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
            <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600" />
          )}
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-semibold text-xs space-x-1"
          >
            <Camera className="w-4 h-4" />
            <span>Change Cover</span>
          </button>
        </div>

        {/* Avatar Preview & Upload */}
        <div className="flex items-center space-x-4 px-2 -mt-10 relative z-10">
          <div className="relative group">
            <img
              src={avatarPreview || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
              alt={user.username}
              className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-zinc-900 shadow-md bg-zinc-800"
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400">Profile Photo</p>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Upload new photo
            </button>
          </div>
        </div>

        <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
        <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverFile} className="hidden" />

        {/* Display Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">Bio</label>
          <textarea
            rows="3"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the community about yourself..."
            className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">Website Link</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourwebsite.com"
            className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Private Account Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700">
          <div className="flex items-center space-x-2.5">
            {isPrivate ? <Lock className="w-5 h-5 text-amber-500" /> : <Globe className="w-5 h-5 text-indigo-500" />}
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Private Account</p>
              <p className="text-[11px] text-gray-400">Only approved followers can see your content</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
