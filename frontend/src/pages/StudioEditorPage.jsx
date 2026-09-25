import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudioHeader from '../components/studio/StudioHeader';
import StudioLeftSidebar from '../components/studio/StudioLeftSidebar';
import StudioCanvasPreview from '../components/studio/StudioCanvasPreview';
import StudioRightInspector from '../components/studio/StudioRightInspector';
import StudioTimeline from '../components/studio/StudioTimeline';
import ExportModal from '../components/studio/ExportModal';
import VoiceRecorderModal from '../components/studio/VoiceRecorderModal';
import ShortcutsModal from '../components/studio/ShortcutsModal';
import { projectStorageService } from '../services/projectStorageService';
import { audioAnalysisService } from '../services/audioAnalysisService';
import { soundFx } from '../utils/audioEffects';
import toast from 'react-hot-toast';

export default function StudioEditorPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // Project Configuration State
  const [project, setProject] = useState(null);
  const [projectName, setProjectName] = useState('Untitled Masterclass Reel');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [previewQuality, setPreviewQuality] = useState('1x');
  const [activeFilter, setActiveFilter] = useState('none');
  const [timelineClips, setTimelineClips] = useState([]);
  const [textLayers, setTextLayers] = useState([]);
  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [voiceoverTracks, setVoiceoverTracks] = useState([]);

  // Playback & Scrubber State
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [selectedElementType, setSelectedElementType] = useState(null);

  // Beat Sync
  const [beatSyncEnabled, setBeatSyncEnabled] = useState(false);
  const [beatMarkers, setBeatMarkers] = useState([]);

  // Undo / Redo History Stack
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Modals
  const [showExportModal, setShowExportModal] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const playbackTimerRef = useRef(null);
  const bgMusicAudioRef = useRef(null);

  // Total Duration
  const totalDuration = Math.max(1, timelineClips.reduce((sum, c) => sum + (c.duration || 3), 0));

  // Load project on mount or initialize demo
  useEffect(() => {
    let currentProj = null;
    if (projectId && projectId !== 'new') {
      currentProj = projectStorageService.getProjectById(projectId);
    }

    if (!currentProj) {
      // Load default interview masterclass demo
      currentProj = projectStorageService.createDemoProject();
    }

    if (currentProj) {
      setProject(currentProj);
      setProjectName(currentProj.name || 'Untitled Reel');
      setAspectRatio(currentProj.aspectRatio || '9:16');
      setActiveFilter(currentProj.filterPreset || 'none');
      setTimelineClips(currentProj.timelineClips || []);
      setTextLayers(currentProj.textLayers || []);
      setBackgroundMusic(currentProj.backgroundMusic || null);
      setVoiceoverTracks(currentProj.voiceoverTracks || []);

      // Initial history point
      setHistory([{
        timelineClips: currentProj.timelineClips || [],
        textLayers: currentProj.textLayers || [],
        backgroundMusic: currentProj.backgroundMusic || null
      }]);
      setHistoryIndex(0);
    }
  }, [projectId]);

  // Push state to undo/redo history
  const pushHistory = (newClips, newTexts, newMusic) => {
    const newState = {
      timelineClips: newClips !== undefined ? newClips : timelineClips,
      textLayers: newTexts !== undefined ? newTexts : textLayers,
      backgroundMusic: newMusic !== undefined ? newMusic : backgroundMusic
    };

    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newState);
    if (nextHistory.length > 25) nextHistory.shift();

    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setTimelineClips(prev.timelineClips);
      setTextLayers(prev.textLayers);
      setBackgroundMusic(prev.backgroundMusic);
      setHistoryIndex(historyIndex - 1);
      toast('Undo', { id: 'undo-toast' });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setTimelineClips(next.timelineClips);
      setTextLayers(next.textLayers);
      setBackgroundMusic(next.backgroundMusic);
      setHistoryIndex(historyIndex + 1);
      toast('Redo', { id: 'redo-toast' });
    }
  };

  // Beat Sync Detection when background music is changed
  useEffect(() => {
    if (backgroundMusic && backgroundMusic.audioUrl) {
      audioAnalysisService.detectBeats(backgroundMusic.audioUrl).then(beats => {
        setBeatMarkers(beats);
      });
    } else {
      setBeatMarkers([]);
    }
  }, [backgroundMusic?.audioUrl]);

  // Audio Playback Loop for Background Music
  useEffect(() => {
    if (!backgroundMusic || !backgroundMusic.audioUrl) {
      if (bgMusicAudioRef.current) {
        bgMusicAudioRef.current.pause();
        bgMusicAudioRef.current = null;
      }
      return;
    }

    if (!bgMusicAudioRef.current) {
      bgMusicAudioRef.current = new Audio(backgroundMusic.audioUrl);
      bgMusicAudioRef.current.loop = true;
    }

    bgMusicAudioRef.current.volume = (backgroundMusic.volume || 75) / 100;
    bgMusicAudioRef.current.currentTime = (backgroundMusic.startTime || 0) + currentTime;

    if (isPlaying) {
      bgMusicAudioRef.current.play().catch(() => {});
    } else {
      bgMusicAudioRef.current.pause();
    }

    return () => {
      if (bgMusicAudioRef.current) {
        bgMusicAudioRef.current.pause();
      }
    };
  }, [isPlaying, backgroundMusic?.audioUrl, backgroundMusic?.volume]);

  // Real-time Playhead Tick Timer
  useEffect(() => {
    if (!isPlaying) {
      clearInterval(playbackTimerRef.current);
      return;
    }

    const intervalMs = 40; // ~25 fps updates
    playbackTimerRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        const nextTime = prev + (intervalMs / 1000) * playbackSpeed;
        if (nextTime >= totalDuration) {
          setIsPlaying(false);
          return 0; // Loop or stop
        }
        return nextTime;
      });
    }, intervalMs);

    return () => clearInterval(playbackTimerRef.current);
  }, [isPlaying, totalDuration, playbackSpeed]);

  // Keyboard Shortcuts Handler
  const handleKeyDown = useCallback((e) => {
    // Ignore when typing inside input / textarea
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

    if (e.code === 'Space') {
      e.preventDefault();
      setIsPlaying(prev => !prev);
    } else if (e.key === 's' || e.key === 'S') {
      if (e.ctrlKey) {
        e.preventDefault();
        handleSaveProject();
      } else {
        e.preventDefault();
        handleSplitClipAtPlayhead();
      }
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      handleDeleteSelected();
    } else if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      handleUndo();
    } else if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) {
      e.preventDefault();
      handleRedo();
    }
  }, [currentTime, selectedElementId, selectedElementType, timelineClips, textLayers]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Timeline Operations
  const handleAddMediaClip = (clip) => {
    const updated = [...timelineClips, clip];
    setTimelineClips(updated);
    pushHistory(updated, undefined, undefined);
    setSelectedElementId(clip.id);
    setSelectedElementType('clip');
  };

  const handleUpdateClip = (clipId, updates) => {
    const updated = timelineClips.map(c => (c.id === clipId ? { ...c, ...updates } : c));
    setTimelineClips(updated);
    pushHistory(updated, undefined, undefined);
  };

  const handleDeleteClip = (clipId) => {
    const updated = timelineClips.filter(c => c.id !== clipId);
    setTimelineClips(updated);
    pushHistory(updated, undefined, undefined);
    setSelectedElementId(null);
    setSelectedElementType(null);
    toast.success('Clip removed');
  };

  const handleDuplicateClip = (clipId) => {
    const orig = timelineClips.find(c => c.id === clipId);
    if (!orig) return;

    const copy = {
      ...orig,
      id: `clip_${Date.now()}_copy`,
      title: `${orig.title} (Copy)`
    };

    const idx = timelineClips.findIndex(c => c.id === clipId);
    const updated = [...timelineClips];
    updated.splice(idx + 1, 0, copy);

    setTimelineClips(updated);
    pushHistory(updated, undefined, undefined);
    setSelectedElementId(copy.id);
    toast.success('Clip duplicated');
  };

  const handleSplitClipAtPlayhead = (targetClipId) => {
    // Determine which clip to split
    let accumulatedTime = 0;
    let clipToSplit = null;
    let splitOffset = 0;

    for (const clip of timelineClips) {
      const clipDur = clip.duration || 3;
      if (currentTime > accumulatedTime && currentTime < accumulatedTime + clipDur) {
        clipToSplit = clip;
        splitOffset = currentTime - accumulatedTime;
        break;
      }
      accumulatedTime += clipDur;
    }

    if (!clipToSplit || splitOffset < 0.3 || (clipToSplit.duration - splitOffset) < 0.3) {
      toast.error('Position playhead inside a clip to split.');
      return;
    }

    const firstHalfDuration = parseFloat(splitOffset.toFixed(2));
    const secondHalfDuration = parseFloat((clipToSplit.duration - splitOffset).toFixed(2));

    const firstHalf = {
      ...clipToSplit,
      duration: firstHalfDuration,
      trimEnd: (clipToSplit.trimStart || 0) + firstHalfDuration
    };

    const secondHalf = {
      ...clipToSplit,
      id: `clip_${Date.now()}_split`,
      title: `${clipToSplit.title} (Part 2)`,
      duration: secondHalfDuration,
      trimStart: (clipToSplit.trimStart || 0) + firstHalfDuration,
      trimEnd: (clipToSplit.trimStart || 0) + clipToSplit.duration
    };

    const idx = timelineClips.findIndex(c => c.id === clipToSplit.id);
    const updated = [...timelineClips];
    updated.splice(idx, 1, firstHalf, secondHalf);

    setTimelineClips(updated);
    pushHistory(updated, undefined, undefined);
    toast.success('Clip split at playhead! ✂️');
  };

  const handleAddTextLayer = (textLayer) => {
    const updated = [...textLayers, { ...textLayer, startTime: currentTime }];
    setTextLayers(updated);
    pushHistory(undefined, updated, undefined);
    setSelectedElementId(textLayer.id);
    setSelectedElementType('text');
  };

  const handleUpdateTextLayer = (textId, updates) => {
    const updated = textLayers.map(t => (t.id === textId ? { ...t, ...updates } : t));
    setTextLayers(updated);
    pushHistory(undefined, updated, undefined);
  };

  const handleDeleteTextLayer = (textId) => {
    const updated = textLayers.filter(t => t.id !== textId);
    setTextLayers(updated);
    pushHistory(undefined, updated, undefined);
    setSelectedElementId(null);
    setSelectedElementType(null);
    toast.success('Text layer removed');
  };

  const handleDeleteSelected = () => {
    if (selectedElementType === 'clip') handleDeleteClip(selectedElementId);
    else if (selectedElementType === 'text') handleDeleteTextLayer(selectedElementId);
  };

  const handleDuplicateSelected = () => {
    if (selectedElementType === 'clip') handleDuplicateClip(selectedElementId);
  };

  const handleApplyTemplate = (template) => {
    setAspectRatio(template.aspectRatio || '9:16');
    setTimelineClips(template.timelineClips || []);
    setTextLayers(template.textLayers || []);
    setBackgroundMusic(template.backgroundMusic || null);
    pushHistory(template.timelineClips, template.textLayers, template.backgroundMusic);
    setCurrentTime(0);
  };

  const handleSaveProject = () => {
    const updatedProject = {
      id: project?.id || `proj_${Date.now()}`,
      name: projectName,
      aspectRatio,
      filterPreset: activeFilter,
      timelineClips,
      textLayers,
      backgroundMusic,
      voiceoverTracks,
      duration: totalDuration
    };

    projectStorageService.saveProject(updatedProject);
    setProject(updatedProject);
    toast.success('Project saved! 💾');
  };

  // Find currently selected element for right inspector
  const selectedElement =
    selectedElementType === 'clip'
      ? timelineClips.find(c => c.id === selectedElementId)
      : selectedElementType === 'text'
      ? textLayers.find(t => t.id === selectedElementId)
      : selectedElementType === 'music'
      ? backgroundMusic
      : null;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden select-none">
      {/* 1. TOP STUDIO HEADER */}
      <StudioHeader
        projectName={projectName}
        onRenameProject={setProjectName}
        aspectRatio={aspectRatio}
        onChangeAspectRatio={setAspectRatio}
        previewQuality={previewQuality}
        onChangePreviewQuality={setPreviewQuality}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSaveProject}
        onOpenExport={() => setShowExportModal(true)}
        onOpenShortcuts={() => setShowShortcutsModal(true)}
        beatSyncEnabled={beatSyncEnabled}
        onToggleBeatSync={() => setBeatSyncEnabled(!beatSyncEnabled)}
      />

      {/* 2. MAIN 3-PANEL WORKSPACE (Left Tools, Center Canvas, Right Inspector) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <StudioLeftSidebar
          onAddMediaClip={handleAddMediaClip}
          onSelectMusic={(music) => {
            setBackgroundMusic(music);
            pushHistory(undefined, undefined, music);
          }}
          selectedMusic={backgroundMusic}
          onAddTextLayer={handleAddTextLayer}
          onOpenVoiceRecorder={() => setShowVoiceRecorder(true)}
          onApplyFilter={setActiveFilter}
          activeFilter={activeFilter}
          onApplyTemplate={handleApplyTemplate}
        />

        {/* Center Canvas Preview */}
        <StudioCanvasPreview
          aspectRatio={aspectRatio}
          timelineClips={timelineClips}
          textLayers={textLayers}
          activeFilter={activeFilter}
          currentTime={currentTime}
          totalDuration={totalDuration}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onRestart={() => setCurrentTime(0)}
          playbackSpeed={playbackSpeed}
          onChangeSpeed={setPlaybackSpeed}
          selectedElementId={selectedElementId}
          onSelectElement={(id, type) => {
            setSelectedElementId(id);
            setSelectedElementType(type);
          }}
          onUpdateTextLayer={handleUpdateTextLayer}
          onDeleteTextLayer={handleDeleteTextLayer}
        />

        {/* Right Inspector */}
        <StudioRightInspector
          selectedElement={selectedElement}
          elementType={selectedElementType}
          onUpdateClip={handleUpdateClip}
          onDeleteClip={handleDeleteClip}
          onDuplicateClip={handleDuplicateClip}
          onSplitClip={handleSplitClipAtPlayhead}
          onUpdateTextLayer={handleUpdateTextLayer}
          onDeleteTextLayer={handleDeleteTextLayer}
          onUpdateMusic={(updates) => {
            const updated = { ...backgroundMusic, ...updates };
            setBackgroundMusic(updated);
            pushHistory(undefined, undefined, updated);
          }}
          onRemoveMusic={() => {
            setBackgroundMusic(null);
            pushHistory(undefined, undefined, null);
            toast.success('Music removed');
          }}
          projectInfo={{
            aspectRatio,
            clipsCount: timelineClips.length,
            totalDuration
          }}
        />
      </div>

      {/* 3. BOTTOM MULTI-TRACK TIMELINE */}
      <StudioTimeline
        timelineClips={timelineClips}
        textLayers={textLayers}
        backgroundMusic={backgroundMusic}
        voiceoverTracks={voiceoverTracks}
        currentTime={currentTime}
        totalDuration={totalDuration}
        onSeekTime={(sec) => setCurrentTime(sec)}
        selectedElementId={selectedElementId}
        selectedElementType={selectedElementType}
        onSelectElement={(id, type) => {
          setSelectedElementId(id);
          setSelectedElementType(type);
        }}
        onSplitClipAtPlayhead={handleSplitClipAtPlayhead}
        onDeleteSelected={handleDeleteSelected}
        onDuplicateSelected={handleDuplicateSelected}
        beatMarkers={beatMarkers}
        beatSyncEnabled={beatSyncEnabled}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        timelineClips={timelineClips}
        textLayers={textLayers}
        backgroundMusic={backgroundMusic}
        voiceoverTracks={voiceoverTracks}
        aspectRatio={aspectRatio}
        activeFilter={activeFilter}
        projectName={projectName}
      />

      {/* Voice Recorder Modal */}
      <VoiceRecorderModal
        isOpen={showVoiceRecorder}
        onClose={() => setShowVoiceRecorder(false)}
        onAddVoiceover={(vo) => {
          setVoiceoverTracks(prev => [...prev, vo]);
        }}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  );
}
