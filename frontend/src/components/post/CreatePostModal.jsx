import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/services';
import MusicPickerModal from '../reels/MusicPickerModal';
import { soundFx } from '../../utils/audioEffects';
import { Image, Video, Globe, Users, Lock, X, Plus, Sparkles, Music, Trash2, Scissors } from 'lucide-react';
import toast from 'react-hot-toast';

export const CreatePostModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [postType, setPostType] = useState('POST');
  const [title, setTitle] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [showMusicModal, setShowMusicModal] = useState(false);

  const fileInputRef = useRef(null);

  const handleFilesSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newMedia = [...mediaFiles, ...files];
    setMediaFiles(newMedia);

    const newPreviews = files.map(f => ({
      url: URL.createObjectURL(f),
      type: f.type.startsWith('video') ? 'VIDEO' : 'IMAGE'
    }));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeFile = (index) => {
    const updatedFiles = mediaFiles.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setMediaFiles(updatedFiles);
    setPreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption.trim() && mediaFiles.length === 0) {
      toast.error('Please write something or upload media.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('caption', caption);
      formData.append('visibility', visibility);
      formData.append('post_type', postType);
      if (title) formData.append('title', title);

      if (selectedMusic) {
        formData.append('audio_title', selectedMusic.title);
        formData.append('audio_artist', selectedMusic.artist);
        formData.append('audio_url', selectedMusic.audioUrl);
      }

      mediaFiles.forEach(file => {
        formData.append('media', file);
      });

      await postService.createPost(formData);
      toast.success('Post published successfully! 🎉');
      setCaption('');
      setTitle('');
      setMediaFiles([]);
      setPreviews([]);
      setSelectedMusic(null);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to publish post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Create New Post / Reel" maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Info Header & Visibility Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar src={user?.avatarUrl} username={user?.username} size="md" />
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{user?.displayName}</p>
                <select
                  id="modal-post-visibility"
                  name="visibility"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 rounded-lg px-2 py-1 border border-transparent focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold cursor-pointer"
                >
                  <option value="PUBLIC">🌍 Public</option>
                  <option value="FOLLOWERS">👥 Followers Only</option>
                  <option value="PRIVATE">🔒 Only Me</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setPostType(postType === 'POST' ? 'VIDEO' : 'POST')}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  postType === 'VIDEO'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black shadow-sm'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                }`}
              >
                {postType === 'VIDEO' ? '🎥 Reel / Video Mode' : '📝 Standard Post'}
              </button>
            </div>
          </div>

          {/* Video Title (if video mode) */}
          {postType === 'VIDEO' && (
            <input
              id="modal-post-title"
              name="title"
              type="text"
              placeholder="Reel / Video Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-gray-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          )}

          {/* Caption Input */}
          <textarea
            id="modal-post-caption"
            name="caption"
            rows="3"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={`What's on your mind, ${user?.displayName || 'creator'}? Use #hashtags or @mentions...`}
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
          />

          {/* Selected Music Chip Banner */}
          {selectedMusic && (
            <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={selectedMusic.coverUrl}
                  alt={selectedMusic.title}
                  className="w-9 h-9 rounded-xl object-cover border border-cyan-400 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-black text-white truncate flex items-center gap-1">
                    <Music className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{selectedMusic.title}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {selectedMusic.artist} · Vol: {selectedMusic.volume}% · Start: {selectedMusic.startTime}s
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowMusicModal(true)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer"
                  title="Trim / Adjust Music"
                >
                  <Scissors className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMusic(null)}
                  className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors cursor-pointer"
                  title="Remove Music"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Media Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {previews.map((item, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square bg-black">
                  {item.type === 'VIDEO' ? (
                    <video src={item.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={item.url} alt="Preview" className="w-full h-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-700 hover:border-cyan-500 aspect-square text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                <Plus className="w-6 h-6" />
                <span className="text-[11px] font-semibold mt-1">Add More</span>
              </button>
            </div>
          )}

          {/* Media Dropzone */}
          {previews.length === 0 && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-700 hover:border-cyan-500 bg-gray-50/50 dark:bg-zinc-800/40 text-center space-y-2 transition-all hover:bg-cyan-50/30 dark:hover:bg-cyan-950/20"
            >
              <div className="flex justify-center space-x-3 text-cyan-500">
                <Image className="w-8 h-8" />
                <Video className="w-8 h-8 text-fuchsia-500" />
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                Drag and drop photos or videos, or <span className="text-cyan-500 dark:text-cyan-400 underline">browse</span>
              </p>
              <p className="text-xs text-gray-400 dark:text-zinc-500">Supports JPG, PNG, WEBP, MP4 (up to 100MB)</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFilesSelect}
            className="hidden"
          />

          {/* Submit Actions & Add Music Button */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 rounded-xl transition-colors cursor-pointer"
                title="Add Photos/Videos"
              >
                <Image className="w-5 h-5" />
              </button>

              {/* Add Music Button */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playSwipeTick();
                  setShowMusicModal(true);
                }}
                className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                  selectedMusic
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Add Music / Select Song"
              >
                <Music className="w-5 h-5 text-cyan-400" />
                <span className="hidden sm:inline">{selectedMusic ? 'Change Music' : 'Add Music'}</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 text-sm font-black shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Publishing...' : 'Share Post'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Music Selection Modal */}
      <MusicPickerModal
        isOpen={showMusicModal}
        onClose={() => setShowMusicModal(false)}
        selectedMusic={selectedMusic}
        onSelectMusic={(music) => setSelectedMusic(music)}
      />
    </>
  );
};
