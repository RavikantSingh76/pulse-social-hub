import React, { useState, useRef } from 'react';
import {
  FolderOpen,
  Music,
  Type,
  Mic,
  Zap,
  Sliders,
  Volume2,
  LayoutTemplate,
  Upload,
  Plus,
  Play,
  Pause,
  Trash2,
  Sparkles,
  Scissors,
  Check,
  Search,
  Flame,
  Radio,
  Clock,
  Film
} from 'lucide-react';
import { CURATED_MUSIC_LIBRARY } from '../reels/MusicPickerModal';
import { REEL_TEMPLATES } from '../../services/projectStorageService';
import { soundFx } from '../../utils/audioEffects';
import toast from 'react-hot-toast';

// Curated stock assets for instant demonstration
const STOCK_VIDEO_ASSETS = [
  { id: 's1', title: 'Late Night City Traffic', url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-city-traffic-at-night-42261-large.mp4', duration: 3.5, thumbnail: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 's2', title: 'Coding On Laptop In Dark', url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-coding-on-a-laptop-in-a-dark-room-41885-large.mp4', duration: 4.5, thumbnail: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 's3', title: 'Modern Financial District', url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-modern-buildings-in-a-financial-district-42469-large.mp4', duration: 4.0, thumbnail: 'https://images.pexels.com/photos/373912/pexels-photo-373912.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 's4', title: 'Sunset Horizon Waves', url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-sun-setting-over-the-ocean-horizon-41571-large.mp4', duration: 4.5, thumbnail: 'https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 's5', title: 'Keyboard Typing ASMR', url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-hands-typing-on-a-laptop-keyboard-41589-large.mp4', duration: 3.5, thumbnail: 'https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=300' }
];

const SOUND_EFFECTS_LIST = [
  { id: 'sfx_impact', name: 'Sub-Bass Impact Drop', type: 'impact', duration: 1.2, play: () => soundFx.playImpactDrop() },
  { id: 'sfx_whoosh', name: 'Air-Cutting Whoosh', type: 'whoosh', duration: 0.8, play: () => soundFx.playWhoosh() },
  { id: 'sfx_typing', name: 'Mechanical Keyboard ASMR', type: 'typing', duration: 2.0, play: () => soundFx.playKeyboardTyping() },
  { id: 'sfx_shutter', name: 'Camera Shutter Click', type: 'shutter', duration: 0.6, play: () => soundFx.playCameraShutter() },
  { id: 'sfx_ding', name: 'Notification Ding', type: 'ding', duration: 0.5, play: () => soundFx.playNotificationDing() },
  { id: 'sfx_riser', name: 'Cinematic Tension Riser', type: 'riser', duration: 1.5, play: () => soundFx.playCinematicRiser() },
  { id: 'sfx_chime', name: 'CTA Arpeggio Chime', type: 'chime', duration: 1.0, play: () => soundFx.playChimeCTA() }
];

const TRANSITIONS_LIST = [
  { id: 'fade', name: 'Fade Through Black', icon: '⬛', duration: 0.5 },
  { id: 'dissolve', name: 'Cross Dissolve', icon: '✨', duration: 0.5 },
  { id: 'slide-left', name: 'Slide Left', icon: '⬅️', duration: 0.4 },
  { id: 'slide-right', name: 'Slide Right', icon: '➡️', duration: 0.4 },
  { id: 'zoom', name: 'Zoom In / Out', icon: '🔍', duration: 0.4 },
  { id: 'wipe', name: 'Smooth Wipe', icon: '🧹', duration: 0.5 }
];

const FILTERS_LIST = [
  { id: 'none', name: 'Natural (None)', desc: 'Original colors' },
  { id: 'cinematic', name: 'Cinematic Teal & Orange', desc: 'Punchy contrast & moody shadows' },
  { id: 'cyberpunk', name: 'Neon Cyberpunk', desc: 'Vibrant neon cyan and pink hues' },
  { id: 'warm', name: 'Sunset Warmth', desc: 'Golden hour amber warmth' },
  { id: 'cool', name: 'Arctic Cool', desc: 'Clean high-tech blue tone' },
  { id: 'vintage', name: '35mm Film Vintage', desc: 'Sepia nostalgic grain' },
  { id: 'bw', name: 'Monochrome Noir', desc: 'High-contrast black & white' }
];

export default function StudioLeftSidebar({
  onAddMediaClip,
  onSelectMusic,
  selectedMusic,
  onAddTextLayer,
  onOpenVoiceRecorder,
  onApplyFilter,
  activeFilter,
  onApplyTemplate
}) {
  const [activeTab, setActiveTab] = useState('media'); // 'media' | 'music' | 'text' | 'voice' | 'transitions' | 'filters' | 'sfx' | 'templates'
  const [searchQuery, setSearchQuery] = useState('');
  const [previewingAudioId, setPreviewingAudioId] = useState(null);

  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const previewAudioRef = useRef(null);

  // Handle local video/image files upload from user device
  const handleLocalMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach((file) => {
      const isVideo = file.type.startsWith('video');
      const isImage = file.type.startsWith('image');
      if (!isVideo && !isImage) return;

      const url = URL.createObjectURL(file);
      const title = file.name.replace(/\.[^/.]+$/, '');

      if (isVideo) {
        // Extract real video duration via temp video element
        const tempVideo = document.createElement('video');
        tempVideo.preload = 'metadata';
        tempVideo.src = url;
        tempVideo.onloadedmetadata = () => {
          const duration = parseFloat((tempVideo.duration || 4.0).toFixed(2));
          onAddMediaClip({
            id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            title,
            url,
            mediaType: 'VIDEO',
            duration: Math.min(60, duration),
            trimStart: 0,
            trimEnd: Math.min(60, duration),
            scale: 100,
            rotation: 0,
            opacity: 100,
            filter: activeFilter || 'none'
          });
          toast.success(`Video uploaded: "${title}" (${duration}s) 🎥`);
        };
      } else {
        onAddMediaClip({
          id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          title,
          url,
          mediaType: 'IMAGE',
          duration: 3.5,
          scale: 100,
          rotation: 0,
          opacity: 100,
          filter: activeFilter || 'none'
        });
        toast.success(`Image added: "${title}" 📸`);
      }
    });

    e.target.value = '';
  };

  const handleTogglePreviewAudio = (song) => {
    soundFx.playSwipeTick();
    if (previewingAudioId === song.id) {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      setPreviewingAudioId(null);
    } else {
      if (previewAudioRef.current) {
        previewAudioRef.current.src = song.audioUrl;
        previewAudioRef.current.play().catch(() => {});
      }
      setPreviewingAudioId(song.id);
    }
  };

  return (
    <div className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col h-[calc(100vh-3.5rem)] select-none">
      {/* Hidden Audio Player for Previewing */}
      <audio ref={previewAudioRef} onEnded={() => setPreviewingAudioId(null)} />

      {/* Sidebar Mode Navigation Pills */}
      <div className="grid grid-cols-4 gap-1 p-2 border-b border-slate-800 bg-slate-900/60">
        {[
          { id: 'media', label: 'Media', icon: FolderOpen },
          { id: 'music', label: 'Music', icon: Music },
          { id: 'text', label: 'Text', icon: Type },
          { id: 'voice', label: 'Voice', icon: Mic },
          { id: 'filters', label: 'Filters', icon: Sliders },
          { id: 'sfx', label: 'Sound FX', icon: Volume2 },
          { id: 'transitions', label: 'Effects', icon: Zap },
          { id: 'templates', label: 'Templates', icon: LayoutTemplate }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playSwipeTick();
                setActiveTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sidebar Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {/* 1. MEDIA TAB */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-2xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40 text-center space-y-2 cursor-pointer transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white">Upload Videos & Photos</p>
              <p className="text-[10px] text-slate-400">Supports MP4, WebM, MOV, PNG, JPG</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*"
              multiple
              onChange={handleLocalMediaUpload}
              className="hidden"
            />

            {/* Stock Footage Library */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Film className="w-3.5 h-3.5 text-cyan-400" />
                <span>HD Stock Assets (1-Click Add)</span>
              </h4>

              <div className="grid grid-cols-2 gap-2">
                {STOCK_VIDEO_ASSETS.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => {
                      soundFx.playChimeCTA();
                      onAddMediaClip({
                        id: `clip_${Date.now()}_${asset.id}`,
                        title: asset.title,
                        url: asset.url,
                        mediaType: 'VIDEO',
                        duration: asset.duration,
                        trimStart: 0,
                        trimEnd: asset.duration,
                        scale: 100,
                        rotation: 0,
                        opacity: 100,
                        filter: activeFilter || 'none'
                      });
                      toast.success(`Added clip: "${asset.title}"`);
                    }}
                    className="group relative aspect-[9/12] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-cyan-400 cursor-pointer shadow-sm transition-all"
                  >
                    <img src={asset.thumbnail} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2 flex flex-col justify-end">
                      <p className="text-[10px] font-bold text-white leading-tight truncate">{asset.title}</p>
                      <span className="text-[9px] text-cyan-400 font-mono">{asset.duration}s</span>
                    </div>
                    <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-cyan-500 text-slate-950 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. MUSIC TAB */}
        {activeTab === 'music' && (
          <div className="space-y-3">
            {/* Custom Audio Upload */}
            <div
              onClick={() => audioInputRef.current?.click()}
              className="p-3 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500 bg-slate-900/40 text-center space-y-1 cursor-pointer transition-colors"
            >
              <Music className="w-5 h-5 text-cyan-400 mx-auto" />
              <p className="text-xs font-bold text-white">Upload Audio from Device</p>
              <p className="text-[10px] text-slate-400">MP3, WAV, AAC, M4A</p>
            </div>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const audioUrl = URL.createObjectURL(file);
                onSelectMusic({
                  id: `custom_${Date.now()}`,
                  title: file.name.replace(/\.[^/.]+$/, ''),
                  artist: 'Your Device Audio',
                  audioUrl,
                  volume: 80,
                  startTime: 0,
                  autoDucking: true
                });
                toast.success('Custom song added to reel! 🎧');
                e.target.value = '';
              }}
              className="hidden"
            />

            {/* Curated Music Library */}
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Music Library</h4>
            <div className="space-y-2">
              {CURATED_MUSIC_LIBRARY.map((song) => {
                const isSelected = selectedMusic?.id === song.id;
                const isPlaying = previewingAudioId === song.id;

                return (
                  <div
                    key={song.id}
                    className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/60 shadow-sm'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => handleTogglePreviewAudio(song)}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{song.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{song.artist}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        soundFx.playChimeCTA();
                        onSelectMusic({
                          ...song,
                          volume: 75,
                          startTime: 0,
                          autoDucking: true
                        });
                        toast.success(`Selected: "${song.title}"`);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        isSelected ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? 'Active' : 'Apply'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. TEXT & CAPTIONS TAB */}
        {activeTab === 'text' && (
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Add Text Overlays</h4>

            {[
              { label: '⚡ Big Punchy Hook', text: 'STOP BUILDING THE OLD WAY', fontSize: 32, isBold: true, color: '#facc15', bg: true, anim: 'pop' },
              { label: '🚀 Sub-10ms Feature Pill', text: 'Sub-10ms High Concurrency Engine', fontSize: 26, isBold: true, color: '#38bdf8', bg: true, anim: 'typewriter' },
              { label: '👑 Creator Call To Action', text: 'Follow @ravikant & Join Pulse Today', fontSize: 28, isBold: true, color: '#f472b6', bg: true, anim: 'glow' },
              { label: '💬 Minimalist Caption', text: 'Late night architecture sprint in Bengaluru 🌃', fontSize: 22, isBold: false, color: '#ffffff', bg: false, anim: 'slide' }
            ].map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundFx.playSwipeTick();
                  onAddTextLayer({
                    id: `txt_${Date.now()}_${idx}`,
                    text: preset.text,
                    startTime: 0,
                    duration: 4.0,
                    fontSize: preset.fontSize,
                    isBold: preset.isBold,
                    color: preset.color,
                    hasBackground: preset.bg,
                    animation: preset.anim,
                    posX: 0,
                    posY: 0
                  });
                  toast.success('Text layer added to timeline! 🔤');
                }}
                className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-400 text-left space-y-1 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white group-hover:text-cyan-400 transition-colors">{preset.label}</span>
                  <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate">{preset.text}</p>
              </button>
            ))}
          </div>
        )}

        {/* 4. VOICEOVER TAB */}
        {activeTab === 'voice' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <Mic className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">Record Voice-Over</h4>
                <p className="text-xs text-slate-400 mt-0.5">Use your microphone to record real narration with auto-ducking</p>
              </div>

              <button
                onClick={() => {
                  soundFx.playChimeCTA();
                  onOpenVoiceRecorder();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-black text-xs shadow-lg shadow-rose-500/20 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
              >
                <Radio className="w-4 h-4 animate-ping" />
                <span>Open Voice Recorder Studio</span>
              </button>
            </div>
          </div>
        )}

        {/* 5. FILTERS & COLOR ADJUSTMENTS */}
        {activeTab === 'filters' && (
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Color Presets</h4>
            <div className="space-y-2">
              {FILTERS_LIST.map((filter) => {
                const isSelected = activeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => {
                      soundFx.playReactionBubble();
                      onApplyFilter(filter.id);
                      toast.success(`Filter applied: ${filter.name}`);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-black">{filter.name}</p>
                      <p className="text-[10px] text-slate-400">{filter.desc}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. SOUND EFFECTS LIBRARY */}
        {activeTab === 'sfx' && (
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Audio Foley & SFX</h4>
            {SOUND_EFFECTS_LIST.map((sfx) => (
              <div
                key={sfx.id}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white">{sfx.name}</p>
                  <p className="text-[10px] text-slate-400">{sfx.duration}s duration</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => sfx.play()}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold transition-colors cursor-pointer"
                    title="Preview Sound"
                  >
                    <Play className="w-3.5 h-3.5 fill-cyan-400" />
                  </button>
                  <button
                    onClick={() => {
                      soundFx.playReactionBubble();
                      toast.success(`Added "${sfx.name}" to timeline`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 7. TRANSITIONS & EFFECTS */}
        {activeTab === 'transitions' && (
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Cinematic Transitions</h4>
            <div className="grid grid-cols-2 gap-2">
              {TRANSITIONS_LIST.map((tr) => (
                <button
                  key={tr.id}
                  onClick={() => {
                    soundFx.playSwipeTick();
                    toast.success(`Transition set to: ${tr.name}`);
                  }}
                  className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-400 text-center space-y-1 transition-all cursor-pointer"
                >
                  <span className="text-xl block">{tr.icon}</span>
                  <p className="text-xs font-bold text-white truncate">{tr.name}</p>
                  <span className="text-[10px] text-slate-500 font-mono">{tr.duration}s</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 8. TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Interview-Ready Templates</h4>
            {REEL_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => {
                  soundFx.playChimeCTA();
                  onApplyTemplate(tpl);
                  toast.success(`Loaded template: "${tpl.name}" 🚀`);
                }}
                className="group relative rounded-2xl overflow-hidden border border-slate-800 hover:border-cyan-400 cursor-pointer shadow-md transition-all"
              >
                <img src={tpl.coverUrl} alt={tpl.name} className="w-full h-24 object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-3 flex flex-col justify-end">
                  <span className="text-[9px] font-black uppercase text-cyan-400 tracking-wider">{tpl.category}</span>
                  <h4 className="text-xs font-black text-white">{tpl.name}</h4>
                  <p className="text-[10px] text-slate-300 truncate">{tpl.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
