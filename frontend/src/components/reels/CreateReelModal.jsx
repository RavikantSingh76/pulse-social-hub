import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Music,
  Scissors,
  Volume2,
  VolumeX,
  Sparkles,
  Play,
  Pause,
  Film,
  Check,
  Search,
  RotateCcw,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Hash,
  Image as ImageIcon,
  FolderPlus,
  ListVideo
} from 'lucide-react';
import { audioService, reelService, playlistService } from '../../services/services';
import { soundFx } from '../../utils/audioEffects';
import toast from 'react-hot-toast';

export default function CreateReelModal({ isOpen, onClose, onReelCreated, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Select, 2: Trim, 3: Music, 4: Slice, 5: Volume, 6: Details, 7: Preview
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);

  // Trimming State
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(20);

  // Audio Selection State
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [audioQuery, setAudioQuery] = useState('');
  const [audioList, setAudioList] = useState([]);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [previewingAudioId, setPreviewingAudioId] = useState(null);

  // Audio Slice State
  const [audioStartTime, setAudioStartTime] = useState(0);
  const [audioEndTime, setAudioEndTime] = useState(20);

  // Volume State
  const [originalVolume, setOriginalVolume] = useState(100);
  const [musicVolume, setMusicVolume] = useState(80);

  // Caption & Cover
  const [caption, setCaption] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  // Playlist Attachment State
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [createNewPlaylistName, setCreateNewPlaylistName] = useState('');
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);

  // Upload & Progress State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('UPLOADING'); // 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED'
  const [errorMessage, setErrorMessage] = useState('');

  // Preview Playback State
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const videoPreviewRef = useRef(null);
  const audioPreviewRef = useRef(null);
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const POPULAR_HASHTAGS = [
    '#Tech', '#Coding', '#Reels', '#Viral', '#Bengaluru', '#FullStack', '#Java', '#SpringBoot', '#WebRTC', '#PulseHub'
  ];

  // Fetch audio tracks & user playlists on mount
  useEffect(() => {
    if (isOpen) {
      loadAudioTracks('');
      loadUserPlaylists();
    }
  }, [isOpen]);

  const loadUserPlaylists = async () => {
    try {
      const res = await playlistService.getPlaylists();
      const data = res.data?.data || res.data || [];
      setUserPlaylists(data);
    } catch (e) {
      console.error('Failed to load user playlists:', e);
    }
  };

  const loadAudioTracks = async (query) => {
    setLoadingAudio(true);
    try {
      let res;
      if (query && query.trim()) {
        res = await audioService.searchAudio(query.trim());
      } else {
        res = await audioService.getTrendingAudio();
      }
      const data = res.data?.data || res.data || [];
      setAudioList(data);
    } catch (e) {
      console.error('Failed to load audio tracks:', e);
    } finally {
      setLoadingAudio(false);
    }
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a valid MP4 or WebM video file');
      return;
    }

    const url = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = url;

    tempVideo.onloadedmetadata = () => {
      const dur = parseFloat(tempVideo.duration.toFixed(1));
      setVideoDuration(dur);
      setVideoFile(file);
      setVideoUrl(url);
      setTrimStart(0);
      setTrimEnd(Math.min(20.0, dur));
      setAudioEndTime(Math.min(20.0, dur));

      soundFx.playChimeCTA();
      toast.success(`Video loaded: ${dur}s duration 🎥`);
      setStep(2); // Go to Trimmer step
    };

    tempVideo.onerror = () => {
      toast.error('Corrupt or unreadable video file.');
    };
  };

  const formatSec = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const effectiveDuration = Math.min(20.0, Math.max(1.0, trimEnd - trimStart));

  const resolveAudioUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    return `http://localhost:8080${url}`;
  };

  const handleToggleAudioPreview = (track) => {
    soundFx.playSwipeTick();
    if (previewingAudioId === track.id) {
      if (audioPreviewRef.current) audioPreviewRef.current.pause();
      setPreviewingAudioId(null);
    } else {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.src = resolveAudioUrl(track.audioUrl);
        audioPreviewRef.current.currentTime = 0;
        audioPreviewRef.current.volume = musicVolume / 100;
        audioPreviewRef.current.play().catch(() => {});
      }
      setPreviewingAudioId(track.id);
    }
  };

  const handleSelectTrack = (track) => {
    soundFx.playReactionBubble();
    setSelectedMusic(track);
    setAudioStartTime(0);
    setAudioEndTime(Math.min(track.duration || 180, effectiveDuration));
    if (audioPreviewRef.current) {
      audioPreviewRef.current.src = resolveAudioUrl(track.audioUrl);
      audioPreviewRef.current.currentTime = 0;
    }
    toast.success(`Soundtrack selected: "${track.title}" 🎵`);
  };

  // Synchronize audio and video on Step 7 (Final Preview) and Step 4 (Segment Audition)
  useEffect(() => {
    if (step === 7) {
      if (videoPreviewRef.current) {
        videoPreviewRef.current.currentTime = 0;
        videoPreviewRef.current.volume = originalVolume / 100;
        videoPreviewRef.current.play().catch(() => {});
      }
      if (selectedMusic && audioPreviewRef.current) {
        audioPreviewRef.current.src = resolveAudioUrl(selectedMusic.audioUrl);
        audioPreviewRef.current.currentTime = audioStartTime;
        audioPreviewRef.current.volume = musicVolume / 100;
        audioPreviewRef.current.play().catch(() => {});
      }
    } else if (step !== 3 && step !== 4) {
      if (audioPreviewRef.current && previewingAudioId === null) {
        audioPreviewRef.current.pause();
      }
    }
  }, [step, selectedMusic, audioStartTime, originalVolume, musicVolume]);

  const handlePreviewTimeUpdate = () => {
    if (videoPreviewRef.current && audioPreviewRef.current && selectedMusic) {
      const vidCur = videoPreviewRef.current.currentTime;
      const expected = audioStartTime + (vidCur % Math.max(1, effectiveDuration));
      if (Math.abs(audioPreviewRef.current.currentTime - expected) > 0.4) {
        audioPreviewRef.current.currentTime = expected;
      }
    }
  };

  const handleAddHashtag = (tag) => {
    soundFx.playSwipeTick();
    if (!caption.includes(tag)) {
      setCaption(prev => (prev ? `${prev} ${tag}` : tag));
    }
  };

  const handlePublishReel = async () => {
    if (!videoFile) {
      toast.error('Please select a video file.');
      return;
    }

    if (effectiveDuration > 20.0) {
      toast.error('Reel duration must be 20 seconds or less.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('UPLOADING');
    setUploadProgress(10);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      if (caption.trim()) formData.append('caption', caption.trim());
      if (selectedMusic?.id) formData.append('music_id', selectedMusic.id);
      formData.append('audio_start_time', audioStartTime);
      formData.append('audio_end_time', audioStartTime + effectiveDuration);
      formData.append('original_audio_volume', originalVolume);
      formData.append('music_volume', musicVolume);
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
      if (thumbnailUrl) formData.append('thumbnail_url', thumbnailUrl);

      setUploadProgress(40);
      setUploadStatus('PROCESSING');

      const res = await reelService.createReel(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 70) / progressEvent.total);
          setUploadProgress(Math.min(85, 20 + percent));
        }
      });

      setUploadProgress(100);
      setUploadStatus('READY');
      soundFx.playLikePop();
      toast.success('Reel published successfully! 🚀');

      const createdData = res.data?.data || res.data;

      // Attach to Playlist if selected
      if (createdData?.id) {
        if (selectedPlaylistId) {
          try {
            await playlistService.addVideos(selectedPlaylistId, [String(createdData.id)]);
            toast.success('Reel added to selected playlist! 📁');
          } catch (pe) {
            console.error('Failed to add to playlist:', pe);
          }
        } else if (createNewPlaylistName.trim()) {
          try {
            await playlistService.createPlaylist({
              name: createNewPlaylistName.trim(),
              videoIds: [String(createdData.id)]
            });
            toast.success(`Created playlist "${createNewPlaylistName}" with this reel! 📁`);
          } catch (pe) {
            console.error('Failed to create playlist:', pe);
          }
        }
      }

      if (onReelCreated) {
        onReelCreated(createdData);
      }
      if (onSuccess) {
        onSuccess(createdData);
      }

      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err) {
      console.error('Reel upload error:', err);
      setUploadStatus('FAILED');
      const msg = err.response?.data?.message || err.message || 'Failed to upload reel';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (audioPreviewRef.current) audioPreviewRef.current.pause();
    if (videoPreviewRef.current) videoPreviewRef.current.pause();
    setStep(1);
    setVideoFile(null);
    setVideoUrl('');
    setSelectedMusic(null);
    setIsUploading(false);
    setUploadProgress(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Hidden audio player for auditioning */}
      <audio ref={audioPreviewRef} onEnded={() => setPreviewingAudioId(null)} />

      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white tracking-wide">
                {step === 1 && 'Create 20s Short Reel'}
                {step === 2 && 'Trim Video (Max 20.0s)'}
                {step === 3 && 'Choose Music / Audio'}
                {step === 4 && 'Select 20s Audio Segment'}
                {step === 5 && 'Audio Balance & Volume'}
                {step === 6 && 'Caption & Cover Photo'}
                {step === 7 && 'Final Live Preview & Post'}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Step {step} of 7 • Max 20s Duration
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* STEP 1: SELECT VIDEO */}
          {step === 1 && (
            <div className="space-y-4 text-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-10 rounded-3xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/30 cursor-pointer transition-all space-y-3"
              >
                <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-white">Select Video File</h4>
                  <p className="text-xs text-slate-400 mt-1">MP4 or WebM format • Max 20.0 seconds</p>
                </div>
                <div className="inline-block bg-slate-800 text-cyan-400 text-xs font-bold px-3 py-1 rounded-full border border-slate-700 font-mono">
                  Strict 20s Server Verification
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoSelect}
                className="hidden"
              />

              {/* Sample Stock Video Quick Picks */}
              <div className="space-y-2 pt-2 text-left">
                <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  Or Test with Sample High-Caliber Clips
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { title: 'Tech Architecture Demo', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', dur: 15.0 },
                    { title: 'Coding On Laptop In Dark', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4', dur: 18.0 }
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      onClick={async () => {
                        soundFx.playChimeCTA();
                        setVideoUrl(s.url);
                        setVideoDuration(s.dur);
                        setTrimStart(0);
                        setTrimEnd(s.dur);
                        // Fetch blob for upload
                        const res = await fetch(s.url);
                        const blob = await res.blob();
                        const file = new File([blob], `sample_reel_${idx + 1}.mp4`, { type: 'video/mp4' });
                        setVideoFile(file);
                        toast.success(`Loaded "${s.title}" (${s.dur}s) 🎥`);
                        setStep(2);
                      }}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-400 text-left transition-all cursor-pointer"
                    >
                      <p className="text-xs font-bold text-white truncate">{s.title}</p>
                      <span className="text-[10px] text-cyan-400 font-mono">{s.dur}s duration</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TRIM VIDEO */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="relative aspect-[9/12] max-h-[320px] mx-auto rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-xl flex items-center justify-center">
                <video
                  src={videoUrl}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                />
              </div>

              {/* Trimmer Controls */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Scissors className="w-4 h-4 text-cyan-400" />
                    <span>Video Trim Window</span>
                  </span>
                  <span className="font-mono font-black text-cyan-400">
                    Duration: {effectiveDuration.toFixed(1)}s {effectiveDuration > 20.0 && '(EXCEEDS 20s!)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      Start: {formatSec(trimStart)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, videoDuration - 1)}
                      step="0.5"
                      value={trimStart}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setTrimStart(val);
                        if (trimEnd <= val) setTrimEnd(Math.min(videoDuration, val + 20));
                      }}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      End: {formatSec(trimEnd)}
                    </label>
                    <input
                      type="range"
                      min={trimStart + 1}
                      max={videoDuration}
                      step="0.5"
                      value={trimEnd}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val - trimStart > 20.0) {
                          setTrimEnd(trimStart + 20.0);
                          toast.error('Maximum reel length is 20.0 seconds');
                        } else {
                          setTrimEnd(val);
                        }
                      }}
                      className="w-full accent-fuchsia-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MUSIC / AUDIO LIBRARY */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={audioQuery}
                  onChange={(e) => {
                    setAudioQuery(e.target.value);
                    loadAudioTracks(e.target.value);
                  }}
                  placeholder="Search music by song title, artist, genre..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                />
              </div>

              {/* Selected Track Banner */}
              {selectedMusic ? (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-fuchsia-950/60 border border-cyan-500/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={selectedMusic.coverUrl} alt="" className="w-10 h-10 rounded-xl object-cover border border-cyan-400" />
                    <div>
                      <p className="text-xs font-black text-white">{selectedMusic.title}</p>
                      <p className="text-[10px] text-cyan-300">{selectedMusic.artist} • {selectedMusic.genre}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedMusic(null)}
                    className="text-xs text-rose-400 font-bold px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                  No music selected. Choose a soundtrack below or proceed with original video audio.
                </div>
              )}

              {/* Tracks List */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {audioList.map((track) => {
                  const isSelected = selectedMusic?.id === track.id;
                  const isPlaying = previewingAudioId === track.id;

                  return (
                    <div
                      key={track.id}
                      className={`p-2.5 rounded-2xl border flex items-center justify-between transition-all ${
                        isSelected ? 'bg-cyan-950/40 border-cyan-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => handleToggleAudioPreview(track)}
                          className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center shrink-0 cursor-pointer"
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                        </button>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white truncate">{track.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{track.artist} • {track.genre}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectTrack(track)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Use Audio'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: SELECT 20S AUDIO SEGMENT */}
          {step === 4 && (
            <div className="space-y-4">
              {selectedMusic ? (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <img src={selectedMusic.coverUrl} alt="" className="w-12 h-12 rounded-2xl object-cover border border-cyan-400" />
                    <div>
                      <h4 className="text-sm font-black text-white">{selectedMusic.title}</h4>
                      <p className="text-xs text-cyan-400 font-bold">{selectedMusic.artist}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Total Duration: {selectedMusic.duration}s</p>
                    </div>
                  </div>

                  {/* Waveform Segment Slider */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300">Selected Segment:</span>
                      <span className="font-mono text-cyan-400 font-bold">
                        {formatSec(audioStartTime)} ──────── {formatSec(audioStartTime + effectiveDuration)} ({effectiveDuration.toFixed(1)}s)
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, (selectedMusic.duration || 180) - effectiveDuration)}
                      step="1"
                      value={audioStartTime}
                      onChange={(e) => setAudioStartTime(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>00:00</span>
                      <span>{formatSec(selectedMusic.duration || 180)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                  <Music className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-300">No music track was selected.</p>
                  <p className="text-[11px] text-slate-500">Your Reel will be published with original video audio.</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: VOLUME MIXING */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Audio Mixing & Balance</span>
                </h4>

                {/* Original Video Volume */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-300">Original Video Audio</span>
                    <span className="font-mono text-cyan-400">{originalVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={originalVolume}
                    onChange={(e) => setOriginalVolume(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* Music Soundtrack Volume */}
                {selectedMusic && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-300">Soundtrack ({selectedMusic.title})</span>
                      <span className="font-mono text-fuchsia-400">{musicVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={musicVolume}
                      onChange={(e) => setMusicVolume(Number(e.target.value))}
                      className="w-full accent-fuchsia-400 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 6: CAPTION & COVER */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  Caption & Description
                </label>
                <textarea
                  rows="3"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a catchy caption with hashtags..."
                  className="w-full px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              {/* Hashtags Cloud */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-400">Popular Tech Hashtags</label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_HASHTAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleAddHashtag(tag)}
                      className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-400 text-[10px] font-bold text-cyan-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cover Photo Selector */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  Custom Cover Photo (Optional)
                </label>
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="p-3 rounded-2xl border border-dashed border-slate-700 hover:border-cyan-400 bg-slate-950 flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs text-slate-300"
                >
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <span>{thumbnailFile ? thumbnailFile.name : 'Select Custom Cover Image'}</span>
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* STEP 7: PREVIEW & PUBLISH */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="relative aspect-[9/14] max-h-[360px] mx-auto rounded-3xl overflow-hidden bg-black border-2 border-cyan-500/50 shadow-2xl flex items-center justify-center">
                <video
                  ref={videoPreviewRef}
                  src={videoUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  playsInline
                  onTimeUpdate={handlePreviewTimeUpdate}
                />

                {/* Overlaid details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex flex-col justify-end pointer-events-none">
                  <p className="text-xs font-bold text-white line-clamp-2 drop-shadow">{caption || 'No caption'}</p>
                  {selectedMusic && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-300 mt-1">
                      <Music className="w-3 h-3 animate-spin" />
                      <span>{selectedMusic.title} • {selectedMusic.artist}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Add to Playlist Section */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ListVideo className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">Add to Playlist (Optional)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewPlaylistInput(!showNewPlaylistInput)}
                    className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {showNewPlaylistInput ? 'Cancel' : '+ New Playlist'}
                  </button>
                </div>

                {showNewPlaylistInput ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={createNewPlaylistName}
                      onChange={(e) => {
                        setCreateNewPlaylistName(e.target.value);
                        setSelectedPlaylistId('');
                      }}
                      placeholder="Enter new playlist name..."
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                ) : (
                  <select
                    value={selectedPlaylistId}
                    onChange={(e) => {
                      setSelectedPlaylistId(e.target.value);
                      setCreateNewPlaylistName('');
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">None (Don't add to playlist)</option>
                    {userPlaylists.map(pl => (
                      <option key={pl.id} value={pl.id}>
                        {pl.name} ({pl.videoCount || 0}/100 videos)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Upload Progress Bar if Uploading */}
              {isUploading && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-white">
                    <span>{uploadStatus === 'PROCESSING' ? 'Processing 20s Short Reel...' : 'Uploading Video Stream...'}</span>
                    <span className="font-mono text-cyan-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 px-6 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
          <button
            onClick={() => {
              soundFx.playSwipeTick();
              setStep(prev => Math.max(1, prev - 1));
            }}
            disabled={step === 1 || isUploading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {step < 7 ? (
            <button
              onClick={() => {
                soundFx.playSwipeTick();
                setStep(prev => Math.min(7, prev + 1));
              }}
              disabled={!videoFile}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white font-black text-xs flex items-center gap-1 shadow-lg shadow-cyan-500/20 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-opacity"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handlePublishReel}
              disabled={isUploading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-opacity"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing Reel...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish 20s Reel 🚀</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
