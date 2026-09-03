import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { storyService } from '../../services/services';
import { Image, Video, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const CreateStoryModal = ({ isOpen, onClose, onSuccess }) => {
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreview({
      url: URL.createObjectURL(selected),
      type: selected.type.startsWith('video') ? 'VIDEO' : 'IMAGE'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select an image or video for your story.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('media', file);
      if (caption) formData.append('caption', caption);

      await storyService.createStory(formData);
      toast.success('Story published for 24 hours! 🌟');
      setFile(null);
      setPreview(null);
      setCaption('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to publish story');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to Story">
      <form onSubmit={handleSubmit} className="space-y-4">
        {preview ? (
          <div className="relative aspect-[9/16] max-h-96 mx-auto rounded-2xl overflow-hidden bg-black flex items-center justify-center">
            {preview.type === 'VIDEO' ? (
              <video src={preview.url} controls className="w-full h-full object-contain" />
            ) : (
              <img src={preview.url} alt="Story preview" className="w-full h-full object-contain" />
            )}
            <button
              type="button"
              onClick={() => { setFile(null); setPreview(null); }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer p-8 rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-700 hover:border-indigo-500 bg-gray-50/50 dark:bg-zinc-800/40 text-center space-y-2"
          >
            <div className="flex justify-center space-x-2 text-indigo-500">
              <Image className="w-8 h-8" />
              <Video className="w-8 h-8 text-pink-500" />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
              Select story photo or video
            </p>
            <p className="text-xs text-gray-400">Expires automatically after 24 hours</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <input
          type="text"
          placeholder="Add a caption to your story..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

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
            disabled={submitting || !file}
            className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {submitting ? 'Publishing...' : 'Share Story'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
