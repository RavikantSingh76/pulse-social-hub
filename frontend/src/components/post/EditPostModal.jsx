import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { postService } from '../../services/services';
import toast from 'react-hot-toast';

export const EditPostModal = ({ isOpen, onClose, post, onUpdated }) => {
  const [caption, setCaption] = useState(post.caption || '');
  const [visibility, setVisibility] = useState(post.visibility || 'PUBLIC');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await postService.updatePost(post.id, { caption, visibility });
      toast.success('Post updated successfully!');
      if (onUpdated) onUpdated(res.data);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Post">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="edit-post-visibility" className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
            Audience Visibility
          </label>
          <select
            id="edit-post-visibility"
            name="visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="PUBLIC">🌍 Public</option>
            <option value="FOLLOWERS">👥 Followers Only</option>
            <option value="PRIVATE">🔒 Only Me</option>
          </select>
        </div>

        <div>
          <label htmlFor="edit-post-caption" className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
            Caption & Hashtags
          </label>
          <textarea
            id="edit-post-caption"
            name="caption"
            rows="5"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Edit your post caption..."
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
