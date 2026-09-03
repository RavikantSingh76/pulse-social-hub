import React, { useState, useEffect } from 'react';
import { storyService } from '../../services/services';
import { Plus, Sparkles, X, ChevronRight, ChevronLeft, Heart, Play } from 'lucide-react';
import { soundFx } from '../../utils/audioEffects';
import toast from 'react-hot-toast';

const DEFAULT_MOCK_HIGHLIGHTS = [
  {
    id: 901,
    title: 'Projects',
    coverUrl: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=300',
    items: [
      { id: 1, mediaUrl: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800', mediaType: 'IMAGE', caption: 'Pulse Social Hub Architecture & Cloud Microservices 🚀' },
      { id: 2, mediaUrl: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800', mediaType: 'IMAGE', caption: 'Sub-10ms WebRTC Peer-to-Peer Video Call Engine ⚡' }
    ]
  },
  {
    id: 902,
    title: 'Travel',
    coverUrl: 'https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=300',
    items: [
      { id: 3, mediaUrl: 'https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=800', mediaType: 'IMAGE', caption: 'Sunset vibes at Marine Drive, Mumbai 🌊' },
      { id: 4, mediaUrl: 'https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg?auto=compress&cs=tinysrgb&w=800', mediaType: 'IMAGE', caption: 'Western Ghats Monsoon Expedition ⛰️' }
    ]
  },
  {
    id: 903,
    title: 'Coding',
    coverUrl: 'https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=300',
    items: [
      { id: 5, mediaUrl: 'https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=800', mediaType: 'IMAGE', caption: 'Mechanical keyboard sound ASMR & late night debugging ☕' }
    ]
  },
  {
    id: 904,
    title: 'College',
    coverUrl: 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=300',
    items: [
      { id: 6, mediaUrl: 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=800', mediaType: 'IMAGE', caption: 'CSE Hackathon Champions 🏆 Bengaluru Campus' }
    ]
  },
  {
    id: 905,
    title: 'Memories',
    coverUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=300',
    items: [
      { id: 7, mediaUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800', mediaType: 'IMAGE', caption: 'Celebrating 200+ active engineering leaders on Pulse! ✨' }
    ]
  }
];

export default function StoryHighlights({ username, isOwnProfile }) {
  const [highlights, setHighlights] = useState(DEFAULT_MOCK_HIGHLIGHTS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  useEffect(() => {
    if (username) fetchHighlights();
  }, [username]);

  const fetchHighlights = async () => {
    try {
      const fn = storyService?.getUserHighlights || storyService?.getHighlights;
      if (typeof fn === 'function') {
        const res = await fn(username);
        const data = res.data?.data || res.data;
        if (Array.isArray(data) && data.length > 0) {
          setHighlights(data);
        } else {
          setHighlights(DEFAULT_MOCK_HIGHLIGHTS);
        }
      }
    } catch (err) {
      setHighlights(DEFAULT_MOCK_HIGHLIGHTS);
    }
  };

  const handleOpenHighlight = (hl) => {
    soundFx.playSwipeTick();
    if (hl.items && hl.items.length > 0) {
      setActiveHighlight(hl);
      setActiveItemIndex(0);
    } else {
      toast('Highlight preview coming soon! ✨');
    }
  };

  const nextSlide = () => {
    soundFx.playSwipeTick();
    if (activeHighlight && activeItemIndex < activeHighlight.items.length - 1) {
      setActiveItemIndex((prev) => prev + 1);
    } else {
      setActiveHighlight(null);
    }
  };

  const prevSlide = () => {
    soundFx.playSwipeTick();
    if (activeItemIndex > 0) {
      setActiveItemIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="py-4 border-b border-slate-200 dark:border-slate-800 select-none">
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-none px-1">
        {/* Add Highlight Button (For Own Profile) */}
        {isOwnProfile && (
          <div
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
            onClick={() => setShowCreateModal(true)}
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center group-hover:border-cyan-400 transition-colors">
              <Plus className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">New</span>
          </div>
        )}

        {/* Highlight Circles with Gradient Borders */}
        {highlights.map((hl) => {
          const cover = hl.coverUrl || (hl.items && hl.items[0]?.mediaUrl);
          return (
            <div
              key={hl.id}
              onClick={() => handleOpenHighlight(hl)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-500 group-hover:scale-105 transition-transform overflow-hidden shadow-sm">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 border-2 border-white dark:border-slate-900">
                  {cover ? (
                    <img
                      src={cover.startsWith('http') ? cover : `http://localhost:8080${cover}`}
                      alt={hl.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                      {hl.title.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 max-w-[5rem] truncate text-center">
                {hl.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Highlight Story Viewer Modal */}
      {activeHighlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm h-[80vh] max-h-[720px] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-slate-800">
            {/* Top Progress Segments */}
            <div className="absolute top-4 inset-x-4 z-30 flex items-center gap-1.5">
              {activeHighlight.items.map((item, idx) => (
                <div key={item.id || idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-cyan-400 transition-all duration-300 ${
                      idx <= activeItemIndex ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Header / Creator Info */}
            <div className="absolute top-8 inset-x-4 z-30 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full p-0.5 bg-cyan-400 overflow-hidden">
                  <img src={activeHighlight.coverUrl} alt="" className="w-full h-full object-cover rounded-full" />
                </div>
                <div>
                  <span className="text-xs font-black">{activeHighlight.title}</span>
                  <p className="text-[10px] text-cyan-300">Highlight</p>
                </div>
              </div>

              <button
                onClick={() => setActiveHighlight(null)}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slide Navigation Zones */}
            <button
              onClick={prevSlide}
              className="absolute left-0 inset-y-16 w-1/3 z-20 opacity-0 hover:opacity-10 transition-opacity flex items-center justify-start pl-2 cursor-pointer"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 inset-y-16 w-1/3 z-20 opacity-0 hover:opacity-10 transition-opacity flex items-center justify-end pr-2 cursor-pointer"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>

            {/* Current Item Media */}
            <div className="flex-1 flex items-center justify-center bg-black overflow-hidden">
              {activeHighlight.items[activeItemIndex]?.mediaType === 'VIDEO' ? (
                <video
                  src={activeHighlight.items[activeItemIndex]?.mediaUrl}
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={activeHighlight.items[activeItemIndex]?.mediaUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Bottom Caption Overlay */}
            {activeHighlight.items[activeItemIndex]?.caption && (
              <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white z-30">
                <p className="text-xs font-semibold leading-relaxed drop-shadow">
                  {activeHighlight.items[activeItemIndex]?.caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
