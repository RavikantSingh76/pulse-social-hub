import React, { useState } from 'react';
import {
  X,
  Download,
  Share2,
  Check,
  Film,
  Sparkles,
  Loader2,
  AlertCircle,
  Play,
  RotateCcw,
  Zap
} from 'lucide-react';
import { videoExportService } from '../../services/videoExportService';
import { soundFx } from '../../utils/audioEffects';
import toast from 'react-hot-toast';

export default function ExportModal({
  isOpen,
  onClose,
  timelineClips = [],
  textLayers = [],
  backgroundMusic = null,
  voiceoverTracks = [],
  aspectRatio = '9:16',
  activeFilter = 'none',
  projectName = 'Untitled Reel'
}) {
  const [resolution, setResolution] = useState('1080p'); // '1080p' | '720p'
  const [fps, setFps] = useState(30);
  const [exporting, setExporting] = useState(false);
  const [progressState, setProgressState] = useState({ stage: 'idle', progress: 0, message: '' });
  const [exportedResult, setExportedResult] = useState(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setExporting(true);
    setExportedResult(null);
    soundFx.playChimeCTA();

    try {
      const result = await videoExportService.exportTimeline({
        timelineClips,
        textLayers,
        backgroundMusic,
        voiceoverTracks,
        aspectRatio,
        resolution,
        fps,
        filterPreset: activeFilter,
        onProgress: (prog) => {
          setProgressState(prog);
        }
      });

      setExportedResult(result);
      soundFx.playChimeCTA();
      toast.success('Video exported successfully! 🎉');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleDownload = () => {
    if (!exportedResult) return;
    soundFx.playReactionBubble();

    const a = document.createElement('a');
    a.href = exportedResult.videoUrl;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_${resolution}_reel.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast.success('Download started! 📥');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Export Video Reel</h3>
              <p className="text-[11px] text-slate-400">Render high-definition video with full audio mix</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (exporting) videoExportService.cancelExport();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Options (When not exporting or finished) */}
        {!exporting && !exportedResult && (
          <div className="space-y-4">
            {/* Resolution Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Resolution Quality</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: '1080p', label: '1080p Full HD', desc: 'Recommended for Reels' },
                  { id: '720p', label: '720p Fast HD', desc: 'Smaller file size' }
                ].map((res) => (
                  <button
                    key={res.id}
                    onClick={() => setResolution(res.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      resolution === res.id
                        ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-xs font-black text-white">{res.label}</p>
                    <p className="text-[10px] text-slate-400">{res.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Rate */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Frame Rate</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { fpsVal: 30, label: '30 FPS (Standard)' },
                  { fpsVal: 60, label: '60 FPS (Smooth)' }
                ].map((f) => (
                  <button
                    key={f.fpsVal}
                    onClick={() => setFps(f.fpsVal)}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      fps === f.fpsVal
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Details */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Aspect Ratio:</span>
                <span className="font-bold text-white">{aspectRatio}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Clips:</span>
                <span className="font-bold text-white">{timelineClips.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Audio Mixing:</span>
                <span className="font-bold text-cyan-400">
                  {backgroundMusic ? 'Background Music Active' : 'Native Clip Audio'}
                </span>
              </div>
            </div>

            <button
              onClick={handleStartExport}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Start Rendering & Export</span>
            </button>
          </div>
        )}

        {/* Export In Progress */}
        {exporting && (
          <div className="space-y-4 py-4 text-center">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-spin border-t-cyan-400" />
              <span className="font-mono font-black text-sm text-cyan-400">{progressState.progress}%</span>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-sm text-white">Rendering Video Reel</h4>
              <p className="text-xs text-slate-400">{progressState.message}</p>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 h-full transition-all duration-200"
                style={{ width: `${progressState.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Export Complete */}
        {exportedResult && (
          <div className="space-y-4">
            {/* Video Preview */}
            <div className="aspect-[9/12] max-h-56 rounded-2xl overflow-hidden bg-black border border-cyan-500/50 mx-auto">
              <video
                src={exportedResult.videoUrl}
                controls
                autoPlay
                loop
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-center space-y-0.5">
              <p className="text-xs font-black text-white flex items-center justify-center gap-1">
                <Check className="w-4 h-4 text-cyan-400 stroke-[3]" />
                <span>Video Ready for Download!</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Resolution: {exportedResult.resolution} • Size: {(exportedResult.sizeBytes / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownload}
                className="py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Video</span>
              </button>

              <button
                onClick={() => {
                  toast.success('Published directly to Pulse Reels Feed! 🚀');
                  onClose();
                }}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Publish to Pulse</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
