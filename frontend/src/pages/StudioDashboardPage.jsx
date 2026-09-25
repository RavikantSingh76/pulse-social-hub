import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Film,
  Plus,
  Sparkles,
  Flame,
  LayoutTemplate,
  Trash2,
  Copy,
  Clock,
  Video,
  Download,
  FolderOpen,
  ArrowUpRight,
  Zap,
  Play,
  Scissors
} from 'lucide-react';
import { projectStorageService, REEL_TEMPLATES } from '../services/projectStorageService';
import { soundFx } from '../utils/audioEffects';
import { getYouTubeId, getYouTubeThumbnail } from '../utils/mediaUtils';
import { PulseLogo } from '../components/common/PulseLogo';
import toast from 'react-hot-toast';

export default function StudioDashboardPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    let list = projectStorageService.getAllProjects();
    if (list.length === 0) {
      // Create initial demo project so dashboard is never empty
      const demo = projectStorageService.createDemoProject();
      list = [demo];
    }
    setProjects(list);
  };

  const handleCreateNewBlank = () => {
    soundFx.playChimeCTA();
    const newProj = {
      id: `proj_${Date.now()}`,
      name: 'New Custom Reel',
      aspectRatio: '9:16',
      filterPreset: 'none',
      timelineClips: [],
      textLayers: [],
      backgroundMusic: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    projectStorageService.saveProject(newProj);
    navigate(`/studio/editor/${newProj.id}`);
  };

  const handleLaunchDemo = () => {
    soundFx.playChimeCTA();
    const demo = projectStorageService.createDemoProject();
    toast.success('🚀 Technical Interview Demo Project Loaded!');
    navigate(`/studio/editor/${demo.id}`);
  };

  const handleApplyTemplate = (template) => {
    soundFx.playChimeCTA();
    const newProj = {
      id: `proj_${Date.now()}`,
      name: `${template.name} Reel`,
      aspectRatio: template.aspectRatio || '9:16',
      filterPreset: 'cinematic',
      timelineClips: template.timelineClips || [],
      textLayers: template.textLayers || [],
      backgroundMusic: template.backgroundMusic || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    projectStorageService.saveProject(newProj);
    toast.success(`Template loaded: "${template.name}"`);
    navigate(`/studio/editor/${newProj.id}`);
  };

  const handleDeleteProject = (e, id) => {
    e.stopPropagation();
    soundFx.playSwipeTick();
    projectStorageService.deleteProject(id);
    loadProjects();
    toast.success('Project deleted');
  };

  const handleDuplicateProject = (e, id) => {
    e.stopPropagation();
    soundFx.playReactionBubble();
    projectStorageService.duplicateProject(id);
    loadProjects();
    toast.success('Project duplicated');
  };

  // Compute Real Statistics
  const totalClipsCount = projects.reduce((sum, p) => sum + (p.timelineClips?.length || 0), 0);
  const totalDurationSum = projects.reduce((sum, p) => sum + (p.duration || 15), 0);

  return (
    <div className="p-3 sm:p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 text-slate-900 dark:text-slate-100 min-h-screen select-none">
      {/* --- 1. STUDIO HERO BANNER --- */}
      <div className="bg-gradient-to-r from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/95 dark:to-emerald-950/40 border border-emerald-200/70 dark:border-slate-800/90 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-7 shadow-xl dark:shadow-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <PulseLogo variant="sidebar" size="sm" to="/" />
            <span className="inline-block bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
              Pulse Studio Pro
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug">
            Production-Grade Video Editing & Audio Mixing Suite
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl">
            Multi-track timeline, canvas compositing, smart voice ducking, beat-synced cuts, and real client-side video rendering for high-impact Java tutorials & tech reels.
          </p>
        </div>

        {/* Action Buttons - Perfectly auto-scaled for 100% desktop & laptop zoom */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto shrink-0">
          <button
            onClick={handleLaunchDemo}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
            title="Launch Technical Interview Demo Reel"
          >
            <Flame className="w-4 h-4 fill-white shrink-0" />
            <span>🚀 Launch Interview Demo</span>
          </button>
          <button
            onClick={handleCreateNewBlank}
            className="bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0 shadow-sm"
            title="Create a new blank project"
          >
            <Plus className="w-4 h-4 stroke-[3] shrink-0" />
            <span>+ Create Blank Reel</span>
          </button>
        </div>
      </div>

      {/* --- 2. STATS SUMMARY BAR --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Projects', value: projects.length, icon: Film, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Timeline Clips', value: totalClipsCount, icon: Video, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/10' },
          { label: 'Total Runtime', value: `${Math.round(totalDurationSum)}s`, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Export Engine', value: '1080p 60fps', icon: Zap, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm dark:shadow-md flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
                <p className={`text-xl font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- 3. TEMPLATES SECTION --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">Interview-Ready Reel Templates</h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">Click any template to customize & export</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REEL_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => handleApplyTemplate(tmpl)}
              className="bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-5 hover:border-emerald-500/60 transition-all duration-200 cursor-pointer group shadow-sm dark:shadow-xl flex flex-col justify-between space-y-4 hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 relative border border-slate-200 dark:border-slate-800">
                  <img
                    src={tmpl.coverUrl}
                    alt={tmpl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    {tmpl.category || 'PRODUCT & TECH'}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider block mb-1 uppercase">
                    {tmpl.category || 'REEL TEMPLATE'}
                  </span>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                    {tmpl.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {tmpl.description || 'Hook → Demo → Architecture → Metrics → CTA'}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {tmpl.timelineClips?.length || 3} Scene Cuts
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Open in Studio →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- 4. RECENT EDITING PROJECTS --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">Your Video Projects ({projects.length})</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const firstClip = proj.timelineClips?.[0];
            const rawUrl = firstClip?.url || '';
            const ytId = getYouTubeId(rawUrl);
            const cover = ytId
              ? getYouTubeThumbnail(rawUrl, 'hqdefault')
              : (rawUrl || 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400');
            const duration = (proj.timelineClips || []).reduce((sum, c) => sum + (c.duration || 3), 0);

            return (
              <div
                key={proj.id}
                onClick={() => navigate(`/studio/editor/${proj.id}`)}
                className="group p-5 rounded-3xl bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 cursor-pointer shadow-sm dark:shadow-xl transition-all duration-200 space-y-4 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 dark:bg-black relative border border-slate-200 dark:border-slate-800">
                    {ytId ? (
                      <div className="w-full h-full relative">
                        <img src={cover} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all">
                          <span className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </span>
                        </div>
                      </div>
                    ) : firstClip?.mediaType === 'VIDEO' ? (
                      <video
                        src={cover}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <img src={cover} alt="" className="w-full h-full object-cover" />
                    )}
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white font-mono text-[10px] font-bold">
                      {duration.toFixed(1)}s
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {proj.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {proj.timelineClips?.length || 0} clips • Ratio: {proj.aspectRatio || '9:16'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Edit Reel →
                  </span>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleDuplicateProject(e, proj.id)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteProject(e, proj.id)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

