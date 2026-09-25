import React, { useState, useEffect } from 'react';
import {
  FolderPlus,
  Play,
  ListVideo,
  Plus,
  Trash2,
  Edit3,
  MoveUp,
  MoveDown,
  Globe,
  Lock,
  Sparkles,
  Search,
  Check,
  X,
  Loader2,
  Film
} from 'lucide-react';
import { playlistService, reelService } from '../services/services';
import { useAuth } from '../context/AuthContext';
import { soundFx } from '../utils/audioEffects';
import PlaylistPlayerModal from '../components/playlist/PlaylistPlayerModal';
import toast from 'react-hot-toast';

export default function PlaylistsPage() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('my'); // 'my' | 'public'

  // Creation Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createVisibility, setCreateVisibility] = useState('PUBLIC');
  const [creating, setCreating] = useState(false);

  // Detail / Manage State
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Player State
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerStartIndex, setPlayerStartIndex] = useState(0);

  // Add Videos Modal State
  const [isAddVideosOpen, setIsAddVideosOpen] = useState(false);
  const [availableReels, setAvailableReels] = useState([]);
  const [selectedVideoIdsToAdd, setSelectedVideoIdsToAdd] = useState([]);
  const [loadingReels, setLoadingReels] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, [tab]);

  const loadPlaylists = async () => {
    setLoading(true);
    try {
      const res = await playlistService.getPlaylists(tab === 'my' && user ? user.id : null);
      const data = res.data?.data || res.data || [];
      setPlaylists(data);
    } catch (e) {
      console.error('Failed to load playlists:', e);
      toast.error('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (playlistId) => {
    soundFx.playSwipeTick();
    setLoadingDetail(true);
    try {
      const res = await playlistService.getPlaylist(playlistId);
      const data = res.data?.data || res.data;
      setSelectedPlaylist(data);
    } catch (e) {
      toast.error('Failed to load playlist details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!createName.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }
    setCreating(true);
    try {
      const res = await playlistService.createPlaylist({
        name: createName.trim(),
        description: createDesc.trim(),
        visibility: createVisibility
      });
      soundFx.playChimeCTA();
      toast.success('Playlist created successfully! 📁');
      setIsCreateOpen(false);
      setCreateName('');
      setCreateDesc('');
      loadPlaylists();
      const created = res.data?.data || res.data;
      if (created?.id) {
        handleOpenDetail(created.id);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create playlist';
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    try {
      await playlistService.deletePlaylist(playlistId);
      toast.success('Playlist deleted');
      setSelectedPlaylist(null);
      loadPlaylists();
    } catch (e) {
      toast.error('Failed to delete playlist');
    }
  };

  const handleRemoveVideo = async (videoId) => {
    if (!selectedPlaylist) return;
    try {
      const res = await playlistService.removeVideo(selectedPlaylist.id, videoId);
      setSelectedPlaylist(res.data?.data || res.data);
      toast.success('Video removed from playlist');
      loadPlaylists();
    } catch (e) {
      toast.error('Failed to remove video');
    }
  };

  const handleMoveVideo = async (currentIndex, direction) => {
    if (!selectedPlaylist?.videos) return;
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= selectedPlaylist.videos.length) return;

    soundFx.playSwipeTick();
    const newVideos = [...selectedPlaylist.videos];
    const temp = newVideos[currentIndex];
    newVideos[currentIndex] = newVideos[targetIndex];
    newVideos[targetIndex] = temp;

    // Optimistic UI
    setSelectedPlaylist({ ...selectedPlaylist, videos: newVideos });

    const orderedIds = newVideos.map(v => v.videoId);
    try {
      const res = await playlistService.reorderVideos(selectedPlaylist.id, orderedIds);
      setSelectedPlaylist(res.data?.data || res.data);
    } catch (e) {
      toast.error('Failed to save reorder position');
      handleOpenDetail(selectedPlaylist.id);
    }
  };

  const handleOpenAddVideos = async () => {
    setIsAddVideosOpen(true);
    setSelectedVideoIdsToAdd([]);
    setLoadingReels(true);
    try {
      const res = await reelService.getReels(1, 50);
      const data = res.data?.data?.reels || res.data?.reels || res.data || [];
      setAvailableReels(data);
    } catch (e) {
      toast.error('Failed to fetch available reels');
    } finally {
      setLoadingReels(false);
    }
  };

  const handleToggleAddVideo = (reelId) => {
    const sId = String(reelId);
    setSelectedVideoIdsToAdd(prev =>
      prev.includes(sId) ? prev.filter(id => id !== sId) : [...prev, sId]
    );
  };

  const handleConfirmAddVideos = async () => {
    if (!selectedPlaylist || selectedVideoIdsToAdd.length === 0) return;

    const currentCount = selectedPlaylist.videos?.length || 0;
    if (currentCount + selectedVideoIdsToAdd.length > 100) {
      toast.error(`Playlist maximum cap is 100 videos. You can only add up to ${100 - currentCount} more videos.`);
      return;
    }

    try {
      const res = await playlistService.addVideos(selectedPlaylist.id, selectedVideoIdsToAdd);
      setSelectedPlaylist(res.data?.data || res.data);
      toast.success(`${selectedVideoIdsToAdd.length} video(s) added to playlist! 🎬`);
      setIsAddVideosOpen(false);
      loadPlaylists();
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Failed to add videos';
      toast.error(msg);
    }
  };

  const resolveMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    return `http://localhost:8080${url}`;
  };

  return (
    <div className="min-h-screen pb-24 text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ListVideo className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Video Playlists
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Organize and sequentially stream up to 100 short videos per playlist
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Tabs */}
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setTab('my')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === 'my'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              My Playlists
            </button>
            <button
              onClick={() => setTab('public')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === 'public'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Public Playlists
            </button>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Playlist</span>
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
          <p className="text-xs text-slate-400">Loading playlists...</p>
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 p-8 max-w-lg mx-auto">
          <FolderPlus className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-base font-bold text-white mb-1">No playlists yet</h3>
          <p className="text-xs text-slate-400 mb-6">
            Create your first playlist to curate up to 100 videos with seamless sequential playback.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/20"
          >
            + Create New Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden group hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 flex flex-col"
            >
              {/* Cover Banner */}
              <div
                onClick={() => handleOpenDetail(pl.id)}
                className="relative h-44 bg-slate-950 overflow-hidden cursor-pointer"
              >
                {pl.coverUrl ? (
                  <img
                    src={resolveMediaUrl(pl.coverUrl)}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/40 flex items-center justify-center">
                    <Film className="w-12 h-12 text-slate-700" />
                  </div>
                )}

                {/* Video Count Tag */}
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs font-bold text-cyan-400">
                  {pl.videoCount || 0} / 100 Videos
                </div>

                {/* Visibility Badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-slate-300 flex items-center space-x-1">
                  {pl.visibility === 'PRIVATE' ? (
                    <>
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Private</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-3 h-3 text-emerald-400" />
                      <span>Public</span>
                    </>
                  )}
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-xl shadow-cyan-500/40 transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-6 h-6 fill-current translate-x-0.5" />
                  </div>
                </div>
              </div>

              {/* Info Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    onClick={() => handleOpenDetail(pl.id)}
                    className="font-bold text-sm text-white hover:text-cyan-400 cursor-pointer line-clamp-1 mb-1 transition-colors"
                  >
                    {pl.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {pl.description || 'Curated short-video collection'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-500 font-medium">
                    @{pl.user?.username || 'user'}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenDetail(pl.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
                    >
                      Open
                    </button>
                    {pl.videoCount > 0 && (
                      <button
                        onClick={async () => {
                          const res = await playlistService.getPlaylist(pl.id);
                          setSelectedPlaylist(res.data?.data || res.data);
                          setPlayerStartIndex(0);
                          setPlayerOpen(true);
                        }}
                        className="p-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 transition-colors"
                        title="Play All Sequentially"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create New Playlist</h3>
                  <p className="text-[11px] text-slate-400">Up to 100 videos limit</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label htmlFor="playlist-title-input" className="block text-xs font-bold text-slate-300 mb-1.5">
                  Playlist Title <span className="text-cyan-400">*</span>
                </label>
                <input
                  id="playlist-title-input"
                  name="title"
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g., My Viral Reels"
                  maxLength={100}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="playlist-desc-input" className="block text-xs font-bold text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  id="playlist-desc-input"
                  name="description"
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  placeholder="Short description of this playlist..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Visibility
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateVisibility('PUBLIC')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                      createVisibility === 'PUBLIC'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>Public</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateVisibility('PRIVATE')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                      createVisibility === 'PRIVATE'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    <span>Private</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center space-x-2"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Playlist</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Playlist Detail & Management Modal */}
      {selectedPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="relative w-20 h-28 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0">
                  {selectedPlaylist.coverUrl ? (
                    <img
                      src={resolveMediaUrl(selectedPlaylist.coverUrl)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                      <Film className="w-8 h-8 text-slate-600" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h2 className="text-xl font-black text-white">{selectedPlaylist.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30">
                      {selectedPlaylist.videos?.length || 0} / 100 Videos
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {selectedPlaylist.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center space-x-2">
                    {selectedPlaylist.videos?.length > 0 && (
                      <button
                        onClick={() => {
                          setPlayerStartIndex(0);
                          setPlayerOpen(true);
                        }}
                        className="px-4 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/25 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play All Sequentially</span>
                      </button>
                    )}

                    <button
                      onClick={handleOpenAddVideos}
                      className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Add Videos</span>
                    </button>

                    {user?.id === selectedPlaylist.userId && (
                      <button
                        onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
                        className="p-2 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                        title="Delete Playlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedPlaylist(null)}
                className="p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video List & Drag/Reorder View */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {selectedPlaylist.videos?.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Film className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p className="text-xs font-semibold">No videos added yet.</p>
                  <button
                    onClick={handleOpenAddVideos}
                    className="mt-3 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-xs font-bold"
                  >
                    + Add Videos from Library
                  </button>
                </div>
              ) : (
                selectedPlaylist.videos?.map((vid, idx) => (
                  <div
                    key={vid.id || idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="text-xs font-bold text-slate-500 w-6 text-center">
                        {idx + 1}
                      </span>

                      <div
                        onClick={() => {
                          setPlayerStartIndex(idx);
                          setPlayerOpen(true);
                        }}
                        className="relative w-14 h-20 rounded-xl overflow-hidden bg-slate-900 cursor-pointer flex-shrink-0"
                      >
                        <img
                          src={resolveMediaUrl(vid.thumbnailUrl)}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Play className="w-5 h-5 text-white fill-current" />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white line-clamp-1">
                          {vid.caption || `Video #${idx + 1}`}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {vid.duration ? `${vid.duration}s` : '20s'} • Added to playlist
                        </p>
                        {vid.music && (
                          <p className="text-[10px] text-cyan-400 line-clamp-1 flex items-center mt-0.5">
                            <Sparkles className="w-2.5 h-2.5 mr-1" />
                            {vid.music.title}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions: Move Up / Down & Remove */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleMoveVideo(idx, -1)}
                        disabled={idx === 0}
                        className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 disabled:opacity-20 text-slate-300 transition-colors"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveVideo(idx, 1)}
                        disabled={idx === selectedPlaylist.videos.length - 1}
                        className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 disabled:opacity-20 text-slate-300 transition-colors"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>

                      {user?.id === selectedPlaylist.userId && (
                        <button
                          onClick={() => handleRemoveVideo(vid.videoId)}
                          className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 ml-1 transition-colors"
                          title="Remove from Playlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Videos Multi-Select Modal */}
      {isAddVideosOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div>
                <h3 className="text-base font-bold text-white">Add Videos to Playlist</h3>
                <p className="text-xs text-slate-400">
                  {selectedPlaylist?.videos?.length || 0} / 100 current • Selected {selectedVideoIdsToAdd.length}
                </p>
              </div>
              <button
                onClick={() => setIsAddVideosOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              {loadingReels ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                </div>
              ) : availableReels.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-xs font-semibold">No reels available to add.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableReels.map((reel) => {
                    const isSelected = selectedVideoIdsToAdd.includes(String(reel.id));
                    const isAlreadyIn = selectedPlaylist?.videos?.some(v => v.videoId === String(reel.id));

                    return (
                      <div
                        key={reel.id}
                        onClick={() => {
                          if (!isAlreadyIn) {
                            handleToggleAddVideo(reel.id);
                          }
                        }}
                        className={`relative rounded-2xl overflow-hidden border aspect-[9/14] bg-slate-950 cursor-pointer transition-all ${
                          isAlreadyIn
                            ? 'opacity-40 cursor-not-allowed border-slate-800'
                            : isSelected
                            ? 'border-cyan-500 ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-500/20'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <img
                          src={resolveMediaUrl(reel.thumbnailUrl)}
                          alt=""
                          className="w-full h-full object-cover"
                        />

                        {/* Top checkmark badge */}
                        <div className="absolute top-2 right-2">
                          {isAlreadyIn ? (
                            <span className="px-2 py-0.5 rounded-full bg-slate-800/90 text-[10px] text-slate-300 font-bold">
                              Added
                            </span>
                          ) : isSelected ? (
                            <div className="w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-lg">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-black/60 border border-white/20" />
                          )}
                        </div>

                        {/* Bottom caption */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                          <p className="text-[11px] font-bold text-white line-clamp-1">
                            {reel.caption || `Reel #${reel.id}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Selected: <strong className="text-cyan-400">{selectedVideoIdsToAdd.length}</strong> videos
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsAddVideosOpen(false)}
                  className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAddVideos}
                  disabled={selectedVideoIdsToAdd.length === 0}
                  className="px-5 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-cyan-500/25"
                >
                  Add Selected Videos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sequential Playlist Player Modal */}
      <PlaylistPlayerModal
        isOpen={playerOpen}
        onClose={() => setPlayerOpen(false)}
        playlist={selectedPlaylist}
        initialIndex={playerStartIndex}
      />
    </div>
  );
}
