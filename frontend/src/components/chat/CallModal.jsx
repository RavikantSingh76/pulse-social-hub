import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Maximize2 } from 'lucide-react';

export default function CallModal({ targetUser, isIncoming = false, isVideo = true, onClose, onAccept }) {
  const [callStatus, setCallStatus] = useState(isIncoming ? 'Ringing...' : 'Calling...');
  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(isVideo);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    let localStream = null;

    async function startMedia() {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: isVideo,
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      } catch (e) {
        console.warn('Media devices not accessible in current environment:', e);
      }
    }

    startMedia();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideo]);

  const handleToggleMic = () => {
    setMicActive(!micActive);
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getAudioTracks().forEach((t) => (t.enabled = !micActive));
    }
  };

  const handleToggleCam = () => {
    setCamActive(!camActive);
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getVideoTracks().forEach((t) => (t.enabled = !camActive));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col items-center justify-between min-h-[480px] p-6 text-white">
        {/* Top bar info */}
        <div className="flex flex-col items-center gap-2 mt-4 z-20">
          <img
            src={targetUser?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${targetUser?.username}`}
            alt={targetUser?.displayName}
            className="w-20 h-20 rounded-full border-4 border-primary-500 shadow-xl object-cover animate-pulse"
          />
          <h3 className="text-xl font-bold">{targetUser?.displayName || targetUser?.username}</h3>
          <span className="text-sm font-medium text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full">
            {callStatus}
          </span>
        </div>

        {/* Video Containers */}
        {isVideo && (
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            {/* Remote simulated video */}
            <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center opacity-60">
              <span className="text-xs text-slate-500">Connecting WebRTC P2P stream...</span>
            </div>

            {/* Local Video Picture-in-Picture */}
            <div className="absolute top-4 right-4 w-32 h-44 bg-black rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl z-20">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        {/* Action Controls Bar */}
        <div className="flex items-center gap-6 mb-4 z-20">
          <button
            onClick={handleToggleMic}
            className={`p-4 rounded-full transition-colors ${
              micActive ? 'bg-slate-800 hover:bg-slate-700' : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {micActive ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>

          {isVideo && (
            <button
              onClick={handleToggleCam}
              className={`p-4 rounded-full transition-colors ${
                camActive ? 'bg-slate-800 hover:bg-slate-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {camActive ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
          )}

          {isIncoming && (
            <button
              onClick={() => {
                setCallStatus('Connected');
                onAccept && onAccept();
              }}
              className="p-4 bg-emerald-600 hover:bg-emerald-700 rounded-full text-white shadow-lg transition-transform hover:scale-110"
            >
              <Phone className="w-6 h-6" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-4 bg-rose-600 hover:bg-rose-700 rounded-full text-white shadow-lg transition-transform hover:scale-110"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
