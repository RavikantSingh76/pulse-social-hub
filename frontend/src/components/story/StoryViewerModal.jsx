import React, { useState, useEffect, useRef } from 'react';
import { storyService } from '../../services/services';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { X, ChevronLeft, ChevronRight, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const StoryViewerModal = ({ stories, initialIndex = 0, onClose }) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const currentStory = stories[currentIndex];
  const isOwner = user && currentStory && user.id === currentStory.userId;
  const isAdmin = user && user.role === 'ADMIN';

  // Record view on story change
  useEffect(() => {
    if (currentStory) {
      storyService.recordView(currentStory.id).catch(() => {});
    }
  }, [currentIndex, currentStory]);

  // Progress Bar Timer (5 seconds per story)
  useEffect(() => {
    if (isPaused) return;

    setProgress(0);
    const interval = 50; // update every 50ms
    const step = (interval / 5000) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, isPaused]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this story?')) return;
    try {
      await storyService.deleteStory(currentStory.id);
      toast.success('Story deleted');
      handleNext();
    } catch (err) {
      toast.error('Failed to delete story');
    }
  };

  if (!currentStory) return null;

  const formattedTime = currentStory.createdAt ? formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true }) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-20 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Story Container */}
      <div
        className="relative w-full max-w-sm h-[85vh] max-h-[750px] bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Progress Bars */}
        <div className="absolute top-3 left-3 right-3 z-20 flex space-x-1">
          {stories.map((s, idx) => (
            <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-75"
                style={{
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Story Header */}
        <div className="absolute top-6 left-3 right-3 z-20 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Avatar src={currentStory.avatarUrl} username={currentStory.username} size="sm" />
            <div>
              <p className="text-xs font-bold text-white drop-shadow">{currentStory.displayName || currentStory.username}</p>
              <p className="text-[10px] text-white/80 drop-shadow">{formattedTime}</p>
            </div>
          </div>

          {(isOwner || isAdmin) && (
            <button onClick={handleDelete} className="p-1.5 text-white/80 hover:text-rose-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Story Media */}
        <div className="w-full h-full flex items-center justify-center bg-black">
          {currentStory.mediaType === 'VIDEO' ? (
            <video
              src={currentStory.mediaUrl}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt="Story"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Story Caption & View Count footer */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20 space-y-2">
          {currentStory.caption && (
            <p className="text-sm text-white font-medium text-center drop-shadow">
              {currentStory.caption}
            </p>
          )}
          {isOwner && (
            <div className="flex items-center justify-center space-x-1.5 text-xs text-white/90">
              <Eye className="w-4 h-4" />
              <span>{currentStory.viewsCount || 0} views</span>
            </div>
          )}
        </div>

        {/* Tap areas for prev / next */}
        <div className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer" onClick={handlePrev} />
        <div className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer" onClick={handleNext} />
      </div>

      {/* Navigation Arrows for desktop */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="hidden md:block absolute left-10 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}
      {currentIndex < stories.length - 1 && (
        <button
          onClick={handleNext}
          className="hidden md:block absolute right-10 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}
    </div>
  );
};
