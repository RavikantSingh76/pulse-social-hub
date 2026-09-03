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
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 space-y-8 select-none max-w-7xl mx-auto">
      {/* 1. TOP HERO HEADER & INTERVIEW DEMO CALL-TO-ACTION */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>Pulse Reel Creator & Editor Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Production-Grade Video Editing & Audio Mixing Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Multi-track timeline, canvas compositing, smart voice ducking, beat-synced cuts, Ken Burns motion, and real client-side video rendering.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={handleLaunchDemo}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-600 hover:opacity-95 text-slate-950 font-black text-xs shadow-xl shadow-rose-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Flame className="w-4 h-4 fill-slate-950 animate-bounce" />
            <span>🚀 Launch Technical Interview Demo</span>
          </button>

          <button
            onClick={handleCreateNewBlank}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Blank Reel</span>
          </button>
        </div>
      </div>

      {/* 2. REAL STATISTICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Projects', val: projects.length, icon: Film, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { label: 'Timeline Clips Processed', val: totalClipsCount, icon: Video, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
          { label: 'Total Runtime Edited', val: `${Math.round(totalDurationSum)}s`, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Export Engine', val: '1080p 60fps', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3.5 shadow-sm">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400">{stat.label}</p>
                <h3 className="text-lg font-black text-white">{stat.val}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. REEL TEMPLATES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-black text-white">Interview-Ready Reel Templates</h2>
          </div>
          <span className="text-xs text-slate-400">Click any template to edit and export</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REEL_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => handleApplyTemplate(tpl)}
              className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-cyan-400 cursor-pointer shadow-md hover:shadow-xl transition-all"
            >
              <div className="aspect-[16/9] overflow-hidden bg-slate-950 relative">
                <img src={tpl.coverUrl} alt={tpl.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-cyan-500/20 backdrop-blur-md border border-cyan-400/40 text-[10px] font-black text-cyan-300 uppercase tracking-wider">
                  {tpl.category}
                </span>
              </div>

              <div className="p-4 space-y-1">
                <h3 className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors">{tpl.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{tpl.description}</p>
                <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>{tpl.timelineClips?.length || 4} Scene Cuts</span>
                  <span className="text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Open in Studio →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. RECENT EDITING PROJECTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-black text-white">Your Video Projects ({projects.length})</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => {
            const firstClip = proj.timelineClips?.[0];
            const cover = firstClip?.url || 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=300';
            const duration = (proj.timelineClips || []).reduce((sum, c) => sum + (c.duration || 3), 0);

            return (
              <div
                key={proj.id}
                onClick={() => navigate(`/studio/editor/${proj.id}`)}
                className="group p-4 rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-400/60 cursor-pointer shadow-md transition-all space-y-3"
              >
                <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-black relative border border-slate-800">
                  {firstClip?.mediaType === 'VIDEO' ? (
                    <video src={cover} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <img src={cover} alt="" className="w-full h-full object-cover" />
                  )}
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white font-mono text-[10px] font-bold">
                    {duration.toFixed(1)}s
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-white truncate group-hover:text-cyan-400 transition-colors">
                      {proj.name}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {proj.timelineClips?.length || 0} clips • Ratio: {proj.aspectRatio || '9:16'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleDuplicateProject(e, proj.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteProject(e, proj.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
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
