import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Music,
  Upload,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sliders,
  Scissors,
  Check,
  Search,
  Sparkles,
  Trash2,
  Clock,
  Radio,
  Disc,
  Filter,
  Flame,
  Activity
} from 'lucide-react';
import { musicLibraryService, MUSIC_CATEGORIES, COMPREHENSIVE_MUSIC_LIBRARY } from '../../services/musicLibraryService';
import { soundFx } from '../../utils/audioEffects';
import toast from 'react-hot-toast';

export const CURATED_MUSIC_LIBRARY = COMPREHENSIVE_MUSIC_LIBRARY;

export default function MusicPickerModal({
  isOpen,
  onClose,
  selectedMusic,
  onSelectMusic
}) {
  const [activeTab, setActiveTab] = useState('library'); // 'library' | 'upload' | 'trim'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSelected, setCurrentSelected] = useState(selectedMusic || null);
  const [previewingId, setPreviewingId] = useState(null);

  // Audio adjustments
  const [volume, setVolume] = useState(selectedMusic?.volume ?? 80);
  const [startTime, setStartTime] = useState(selectedMusic?.startTime ?? 0);
  const [fadeIn, setFadeIn] = useState(selectedMusic?.fadeIn ?? true);
  const [fadeOut, setFadeOut] = useState(selectedMusic?.fadeOut ?? true);
  const [autoDucking, setAutoDucking] = useState(selectedMusic?.autoDucking ?? true);

  const previewAudioRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (selectedMusic) {
      setCurrentSelected(selectedMusic);
      setVolume(selectedMusic.volume ?? 80);
      setStartTime(selectedMusic.startTime ?? 0);
      setFadeIn(selectedMusic.fadeIn ?? true);
      setFadeOut(selectedMusic.fadeOut ?? true);
      setAutoDucking(selectedMusic.autoDucking ?? true);
    }
  }, [selectedMusic]);

  // Clean up audio on modal close
  useEffect(() => {
    if (!isOpen) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.currentTime = 0;
      }
      setPreviewingId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTogglePreview = (song) => {
    soundFx.playSwipeTick();
    if (previewingId === song.id) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setPreviewingId(null);
    } else {
      if (previewAudioRef.current) {
        previewAudioRef.current.src = song.audioUrl;
        previewAudioRef.current.volume = volume / 100;
        previewAudioRef.current.currentTime = startTime;
        previewAudioRef.current.play().catch(() => {});
      }
      setPreviewingId(song.id);
    }
  };

  const handleSelectSong = (song) => {
    soundFx.playChimeCTA();
    const updated = {
      ...song,
      volume,
      startTime,
      fadeIn,
      fadeOut,
      autoDucking
    };
    setCurrentSelected(updated);
    toast.success(`Selected: "${song.title}" 🎵`);
  };

  const handleCustomAudioUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Please upload a valid audio file (.mp3, .wav, .m4a)');
      return;
    }

    soundFx.playReactionBubble();
    const customUrl = URL.createObjectURL(file);
    const customSong = {
      id: `custom_${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Original Device Audio',
      genre: 'Custom Audio',
      duration: 180,
      audioUrl: customUrl,
      isCustom: true,
      coverUrl: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=300',
      volume,
      startTime: 0,
      fadeIn: true,
      fadeOut: true,
      autoDucking: true
    };

    setCurrentSelected(customSong);
    setActiveTab('trim');
    toast.success('Device audio uploaded! 🎧');
  };

  const handleRemoveMusic = () => {
    soundFx.playSwipeTick();
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    setPreviewingId(null);
    setCurrentSelected(null);
    onSelectMusic(null);
    toast.success('Music removed from reel');
  };

  const handleApply = () => {
    soundFx.playChimeCTA();
    if (currentSelected) {
      onSelectMusic({
        ...currentSelected,
        volume,
        startTime,
        fadeIn,
        fadeOut,
        autoDucking
      });
    } else {
      onSelectMusic(null);
    }
    onClose();
  };

  // Filter songs by Category and Search Query
  const filteredSongs = musicLibraryService.filterSongs({
    category: selectedCategory,
    query: searchQuery
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      {/* Hidden HTML5 Audio Element for previewing */}
      <audio
        ref={previewAudioRef}
        onEnded={() => setPreviewingId(null)}
        onError={() => setPreviewingId(null)}
      />

      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] text-white overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Music & Soundtracks</h3>
              <p className="text-[11px] text-slate-400">Hindi, Bhojpuri, Trending, Lofi & Devotional library</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currently Selected / Active Song Banner */}
        {currentSelected ? (
          <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-indigo-950/70 to-slate-900 border border-cyan-500/40 flex items-center justify-between animate-fade-in shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={currentSelected.coverUrl}
                  alt={currentSelected.title}
                  className="w-12 h-12 rounded-xl object-cover border border-cyan-400"
                />
                <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[9px]">
                  ✓
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white truncate">{currentSelected.title}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 uppercase tracking-wider shrink-0">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentSelected.artist} • <span className="text-cyan-400 font-semibold">{currentSelected.genre}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleTogglePreview(currentSelected)}
                className="p-2 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold transition-colors cursor-pointer"
                title="Preview"
              >
                {previewingId === currentSelected.id ? (
                  <Pause className="w-4 h-4 fill-slate-950" />
                ) : (
                  <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                )}
              </button>

              <button
                onClick={handleRemoveMusic}
                className="p-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors cursor-pointer"
                title="Remove music"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
            No music track currently applied. Choose from categories below or upload device audio.
          </div>
        )}

        {/* Tab Navigation: Library vs Upload vs Trimming */}
        <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800 my-3">
          <button
            onClick={() => setActiveTab('library')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'library'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎵 Music Categories
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📁 Device Audio
          </button>

          <button
            onClick={() => setActiveTab('trim')}
            disabled={!currentSelected}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-30 ${
              activeTab === 'trim'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ✂ Trim & Mixing
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
          {/* 1. MUSIC LIBRARY TAB */}
          {activeTab === 'library' && (
            <div className="space-y-3">
              {/* Category Badges Horizontal Filter Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {MUSIC_CATEGORIES.map((cat) => {
                  const isCatSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        soundFx.playSwipeTick();
                        setSelectedCategory(cat.id);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isCatSelected
                          ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Hindi, Bhojpuri, Lofi, Devotional by name or artist..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                />
              </div>

              {/* Songs List */}
              <div className="space-y-2">
                {filteredSongs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs bg-slate-950/40 rounded-2xl border border-slate-800">
                    No songs found matching "{searchQuery}". Try selecting another category!
                  </div>
                ) : (
                  filteredSongs.map((song) => {
                    const isSelected = currentSelected?.id === song.id;
                    const isPlaying = previewingId === song.id;

                    return (
                      <div
                        key={song.id}
                        className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                            : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative group shrink-0">
                            <img
                              src={song.coverUrl}
                              alt={song.title}
                              className="w-11 h-11 rounded-xl object-cover border border-slate-700"
                            />
                            <button
                              onClick={() => handleTogglePreview(song)}
                              className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center text-white transition-opacity cursor-pointer"
                            >
                              {isPlaying ? (
                                <Pause className="w-4 h-4 fill-white animate-pulse text-cyan-400" />
                              ) : (
                                <Play className="w-4 h-4 fill-white ml-0.5" />
                              )}
                            </button>
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-extrabold text-xs text-white truncate">{song.title}</h4>
                            <p className="text-[10px] text-slate-400 truncate">
                              {song.artist} • <span className="text-cyan-400 font-semibold">{song.genre}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Simulated mini waveform */}
                          <div className="hidden sm:flex items-end space-x-0.5 h-3 opacity-60">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <span
                                key={i}
                                className={`w-0.5 rounded-full ${isPlaying ? 'bg-cyan-400 animate-bounce' : 'bg-slate-600'}`}
                                style={{ height: `${(i % 3 + 1) * 4}px` }}
                              />
                            ))}
                          </div>

                          <span className="text-[10px] text-slate-500 font-mono">
                            {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                          </span>

                          <button
                            onClick={() => handleSelectSong(song)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            }`}
                          >
                            {isSelected ? '✓ Added' : '+ Add'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 2. UPLOAD CUSTOM AUDIO TAB */}
          {activeTab === 'upload' && (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-950/60 rounded-3xl border border-dashed border-slate-700 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Upload className="w-8 h-8 animate-bounce" />
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-white">Upload Custom Song / Original Audio</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Upload MP3, WAV, AAC, or M4A audio files from your local storage to use as your reel track.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleCustomAudioUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 hover:opacity-95 transition-opacity cursor-pointer"
              >
                Browse Audio Files
              </button>
            </div>
          )}

          {/* 3. TRIM & AUDIO MIXING TAB */}
          {activeTab === 'trim' && currentSelected && (
            <div className="space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              {/* Volume Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <span>Music Volume</span>
                  </span>
                  <span className="font-mono font-bold text-cyan-400">{volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setVolume(v);
                    if (previewAudioRef.current) previewAudioRef.current.volume = v / 100;
                  }}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              {/* Start Point Trimming Slider */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Scissors className="w-4 h-4 text-cyan-400" />
                    <span>Starting Point (Offset)</span>
                  </span>
                  <span className="font-mono font-bold text-cyan-400">
                    {Math.floor(startTime / 60)}:{(startTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, currentSelected.duration - 10)}
                  value={startTime}
                  onChange={(e) => {
                    const t = Number(e.target.value);
                    setStartTime(t);
                    if (previewAudioRef.current) previewAudioRef.current.currentTime = t;
                  }}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              {/* Fade In / Fade Out Envelope Switches */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-xs font-bold text-white">Fade In (0.5s)</span>
                  <input
                    type="checkbox"
                    checked={fadeIn}
                    onChange={(e) => setFadeIn(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 cursor-pointer accent-cyan-400"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-xs font-bold text-white">Fade Out (0.5s)</span>
                  <input
                    type="checkbox"
                    checked={fadeOut}
                    onChange={(e) => setFadeOut(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>

              {/* Auto Ducking Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white">Smart Voice Ducking</p>
                  <p className="text-[10px] text-slate-400">
                    Automatically lowers music volume when voice-over or speech is speaking.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoDucking}
                  onChange={(e) => setAutoDucking(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Apply / Cancel Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800 mt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-md shadow-cyan-500/25 hover:opacity-95 transition-opacity cursor-pointer"
          >
            Apply Soundtrack
          </button>
        </div>
      </div>
    </div>
  );
}
