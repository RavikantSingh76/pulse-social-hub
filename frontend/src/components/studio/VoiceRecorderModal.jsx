import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Mic,
  Square,
  Play,
  Pause,
  Check,
  Radio,
  Volume2,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { soundFx } from '../../utils/audioEffects';
import toast from 'react-hot-toast';

export default function VoiceRecorderModal({ isOpen, onClose, onAddVoiceover }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const previewAudioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    };
  }, []);

  if (!isOpen) return null;

  const startRecording = async () => {
    soundFx.playChimeCTA();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Setup Web Audio Analyser for live meter
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach(t => t.stop());
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        setAudioLevel(0);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error('Microphone access denied or not available.');
    }
  };

  const stopRecording = () => {
    soundFx.playSwipeTick();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const handleApplyVoiceover = () => {
    if (!recordedAudioUrl) return;
    soundFx.playChimeCTA();

    onAddVoiceover({
      id: `vo_${Date.now()}`,
      title: `Voice Narration (${recordSeconds}s)`,
      audioUrl: recordedAudioUrl,
      duration: Math.max(1, recordSeconds),
      startTime: 0,
      volume: 100
    });

    toast.success('Voice-over added to timeline! 🎙️');
    onClose();
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <audio
        ref={previewAudioRef}
        src={recordedAudioUrl}
        onEnded={() => setIsPlayingPreview(false)}
      />

      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-5 text-center">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-400 animate-pulse" />
            <h3 className="font-extrabold text-base text-white">Voice Recorder Studio</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Microphone Visualizer Sphere */}
        <div className="py-4 flex flex-col items-center justify-center space-y-3">
          <div className="relative w-24 h-24 rounded-full flex items-center justify-center">
            {/* Pulsing ring matching audio level */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-75 ${
                isRecording ? 'bg-rose-500/20 animate-ping' : 'bg-slate-800'
              }`}
              style={{ transform: `scale(${1 + (audioLevel / 100) * 0.4})` }}
            />
            <div
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-colors ${
                isRecording
                  ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-rose-500/40'
                  : recordedAudioUrl
                  ? 'bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Mic className="w-8 h-8" />
            </div>
          </div>

          {/* Time Counter */}
          <div className="font-mono font-black text-2xl text-white">
            {formatTime(recordSeconds)}
          </div>
        </div>

        {/* Record / Stop Action Controls */}
        <div className="space-y-2">
          {!isRecording && !recordedAudioUrl && (
            <button
              onClick={startRecording}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-black text-xs shadow-lg shadow-rose-500/25 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Start Recording</span>
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="w-full py-3 rounded-2xl bg-rose-600 text-white font-black text-xs shadow-lg shadow-rose-500/30 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer animate-pulse"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Stop & Save Recording</span>
            </button>
          )}

          {recordedAudioUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    if (isPlayingPreview) {
                      previewAudioRef.current?.pause();
                      setIsPlayingPreview(false);
                    } else {
                      previewAudioRef.current?.play();
                      setIsPlayingPreview(true);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isPlayingPreview ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingPreview ? 'Pause' : 'Preview'}</span>
                </button>

                <button
                  onClick={() => {
                    setRecordedAudioUrl(null);
                    setRecordSeconds(0);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                  title="Re-record"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleApplyVoiceover}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Add to Timeline</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
