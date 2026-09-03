import React, { useState, useEffect } from 'react';
import { storyService } from '../../services/services';
import { Plus, Sparkles, X, ChevronRight } from 'lucide-react';

export default function StoryHighlights({ username, isOwnProfile }) {
  const [highlights, setHighlights] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  useEffect(() => {
    if (username) fetchHighlights();
  }, [username]);

  const fetchHighlights = async () => {
    try {
      const res = await storyService.getUserHighlights(username);
      if (res.data?.success) {
        setHighlights(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenHighlight = (hl) => {
    if (hl.items && hl.items.length > 0) {
      setActiveHighlight(hl);
      setActiveItemIndex(0);
    }
  };

  const nextSlide = () => {
    if (activeHighlight && activeItemIndex < activeHighlight.items.length - 1) {
      setActiveItemIndex((prev) => prev + 1);
    } else {
      setActiveHighlight(null);
    }
  };

  return (
    <div className="py-4 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
        {/* Add Highlight Button (For Own Profile) */}
        {isOwnProfile && (
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer" onClick={() => setShowCreateModal(true)}>
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center hover:border-primary-500 transition-colors">
              <Plus className="w-6 h-6 text-slate-500 hover:text-primary-500" />
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">New</span>
          </div>
        )}

        {/* Highlight Circles */}
        {highlights.map((hl) => {
          const cover = hl.coverUrl || (hl.items && hl.items[0]?.mediaUrl);
          return (
            <div
              key={hl.id}
              onClick={() => handleOpenHighlight(hl)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full p-0.5 border-2 border-primary-500 group-hover:scale-105 transition-transform overflow-hidden bg-slate-100 dark:bg-slate-800">
                {cover ? (
                  <img src={cover.startsWith('http') ? cover : `http://localhost:8080${cover}`} alt={hl.title} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white font-bold text-xs">
                    {hl.title.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[4rem] truncate text-center">
                {hl.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Create Highlight Modal */}
      {showCreateModal && (
        <CreateHighlightModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(newHl) => {
            setHighlights((prev) => [newHl, ...prev]);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Highlight Story Viewer Modal */}
      {activeHighlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-sm h-[80vh] bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
            {/* Top Progress Bar */}
            <div className="absolute top-4 inset-x-4 z-30 flex items-center gap-1.5">
              {activeHighlight.items.map((item, idx) => (
                <div key={item.id || idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div className={`h-full bg-white transition-all duration-300 ${idx <= activeItemIndex ? 'w-full' : 'w-0'}`} />
                </div>
              ))}
            </div>

            {/* Header info */}
            <div className="absolute top-8 inset-x-4 z-30 flex items-center justify-between text-white">
              <span className="font-bold text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                {activeHighlight.title}
              </span>
              <button onClick={() => setActiveHighlight(null)} className="p-1 rounded-full bg-black/40 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Highlight Slide */}
            {(() => {
              const current = activeHighlight.items[activeItemIndex];
              if (!current) return null;
              return (
                <div className="w-full h-full flex items-center justify-center relative cursor-pointer" onClick={nextSlide}>
                  {current.mediaType === 'TEXT' || (!current.mediaUrl && current.caption) ? (
                    <div className={`w-full h-full bg-gradient-to-br ${current.bgGradient || 'from-purple-600 to-pink-500'} flex items-center justify-center p-8 text-white text-center font-bold text-xl`}>
                      {current.caption}
                    </div>
                  ) : current.mediaType === 'VIDEO' ? (
                    <video src={current.mediaUrl.startsWith('http') ? current.mediaUrl : `http://localhost:8080${current.mediaUrl}`} className="w-full h-full object-cover" autoPlay playsInline />
                  ) : (
                    <img src={current.mediaUrl.startsWith('http') ? current.mediaUrl : `http://localhost:8080${current.mediaUrl}`} alt={current.caption || 'highlight'} className="w-full h-full object-cover" />
                  )}
                  {current.caption && current.mediaType !== 'TEXT' && (
                    <div className="absolute bottom-6 inset-x-4 p-3 bg-black/60 backdrop-blur-md rounded-2xl text-white text-sm text-center">
                      {current.caption}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function CreateHighlightModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [stories, setStories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await storyService.getStories();
      if (res.data?.success) {
        setStories(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSubmitting(true);
      const res = await storyService.createHighlight({
        title: title.trim(),
        storyIds: selectedIds,
      });
      if (res.data?.success) {
        onCreated(res.data.data);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create highlight');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white">Create Story Highlight</h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Highlight Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Trips, Vibes, Coding"
              className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 mb-2 block">Select Stories to Include</label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {stories.length === 0 ? (
                <p className="col-span-3 text-xs text-slate-400 py-4 text-center">No active stories found</p>
              ) : (
                stories.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => toggleSelect(s.id)}
                    className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-transform ${
                      selectedIds.includes(s.id) ? 'border-primary-500 scale-95 shadow-md' : 'border-transparent'
                    }`}
                  >
                    {s.mediaUrl ? (
                      <img src={s.mediaUrl.startsWith('http') ? s.mediaUrl : `http://localhost:8080${s.mediaUrl}`} alt={s.caption} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-purple-600 to-pink-500 p-2 text-[10px] text-white flex items-center justify-center text-center font-bold">
                        {s.caption}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Highlight'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
