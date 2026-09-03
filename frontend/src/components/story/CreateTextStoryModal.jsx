import React, { useState } from 'react';
import { storyService } from '../../services/services';
import { X, Sparkles, Type, Check } from 'lucide-react';

const GRADIENTS = [
  'from-purple-600 to-pink-500',
  'from-blue-600 to-cyan-400',
  'from-amber-500 to-rose-500',
  'from-emerald-500 to-teal-700',
  'from-fuchsia-600 to-violet-800',
  'from-slate-900 to-slate-800',
];

const FONTS = [
  { id: 'sans', label: 'Modern', style: 'font-sans' },
  { id: 'serif', label: 'Classic', style: 'font-serif' },
  { id: 'mono', label: 'Code', style: 'font-mono' },
];

export default function CreateTextStoryModal({ onClose, onStoryCreated }) {
  const [text, setText] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0]);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      setSubmitting(true);
      const res = await storyService.createTextStory({
        text: text.trim(),
        bgGradient: selectedGradient,
        fontFamily: selectedFont.id,
        textColor: '#ffffff',
      });
      if (res.data?.success) {
        onStoryCreated && onStoryCreated(res.data.data);
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to publish text story.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <h3 className="font-bold text-slate-800 dark:text-white">Create Text Story</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Story Preview */}
        <div
          className={`relative w-full h-80 bg-gradient-to-br ${selectedGradient} flex items-center justify-center p-6 text-white text-center transition-all duration-300`}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type something memorable..."
            maxLength={300}
            className={`w-full bg-transparent text-center text-2xl font-bold text-white placeholder-white/60 focus:outline-none resize-none ${selectedFont.style}`}
            rows={4}
          />
          <span className="absolute bottom-3 right-4 text-xs text-white/70">
            {text.length}/300
          </span>
        </div>

        {/* Controls */}
        <div className="p-5 space-y-4">
          {/* Gradient Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 block">
              Background Style
            </label>
            <div className="flex items-center gap-3">
              {GRADIENTS.map((grad) => (
                <button
                  key={grad}
                  type="button"
                  onClick={() => setSelectedGradient(grad)}
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${grad} border-2 flex items-center justify-center transition-transform ${
                    selectedGradient === grad ? 'border-primary-500 scale-110 shadow-lg' : 'border-white'
                  }`}
                >
                  {selectedGradient === grad && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Font Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 block">
              Font Style
            </label>
            <div className="flex items-center gap-2">
              {FONTS.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => setSelectedFont(font)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    selectedFont.id === font.id
                      ? 'bg-primary-50 dark:bg-primary-950 border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !text.trim()}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors cursor-pointer shadow-md shadow-primary-500/25"
            >
              {submitting ? 'Sharing...' : 'Share to Story'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
