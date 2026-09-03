import React, { useState, useEffect, useRef } from 'react';
import { storyService, messageService } from '../../services/services';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { X, ChevronLeft, ChevronRight, Eye, Trash2, Send, Heart, Flame, Sparkles, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';
import { soundFx } from '../../utils/audioEffects';

export const StoryViewerModal = ({ stories, initialIndex = 0, onClose }) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef(null);
  const videoRef = useRef(null);

  const currentStory = stories[currentIndex];
  const isOwner = user && currentStory && user.id === currentStory.userId;
  const isAdmin = user && user.role === 'ADMIN';

  // Record view
  useEffect(() => {
    if (currentStory) {
      storyService.recordView(currentStory.id).catch(() => {});
    }
  }, [currentIndex, currentStory]);

  // Progress Bar Timer (5s per story)
  useEffect(() => {
    if (isPaused) return;

    setProgress(0);
    const interval = 50;
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
    soundFx.playSwipeTick();
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    soundFx.playSwipeTick();
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

  // Send DM reply to story
  const handleSendReply = async (e) => {
    e?.preventDefault();
    if (!replyText.trim() || !user) return;

    try {
      await messageService.sendMessage({
        recipientId: currentStory.userId,
        messageText: `Replying to your story: "${replyText.trim()}"`
      });
      toast.success(`Reply sent to @${currentStory.username}!`);
      setReplyText('');
    } catch (err) {
      toast.error('Could not send reply');
    }
  };

  // Quick Emoji Burst Reaction
  const handleQuickReaction = (emoji) => {
    const id = Date.now() + Math.random();
    setFloatingEmojis(prev => [...prev, { id, emoji, left: Math.random() * 60 + 20 }]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(item => item.id !== id));
    }, 1600);

    if (currentStory && user && currentStory.userId !== user.id) {
      messageService.sendMessage({
        recipientId: currentStory.userId,
        messageText: `Reacted ${emoji} to your story`
      }).catch(() => {});
    }
  };

  if (!currentStory) return null;

  const formattedTime = currentStory.createdAt
    ? formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true })
    : '';

  const isCloseFriends = currentStory.audience === 'CLOSE_FRIENDS';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in select-none">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white z-30 transition-colors cursor-pointer"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Story Container */}
      <div
        className="relative w-full max-w-sm h-[88vh] max-h-[780px] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Floating Emojis Burst Container */}
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          {floatingEmojis.map(item => (
            <div
              key={item.id}
              className="absolute bottom-20 text-4xl animate-float-up opacity-90 drop-shadow-lg"
              style={{ left: `${item.left}%` }}
            >
              {item.emoji}
            </div>
          ))}
        </div>

        {/* Progress Bars */}
        <div className="absolute top-3 left-3 right-3 z-20 flex space-x-1.5">
          {stories.map((s, idx) => (
            <div key={s.id} className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-75 shadow-sm shadow-cyan-400"
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
            <Avatar src={currentStory.avatarUrl} username={currentStory.username} size="sm" disableLink={true} />
            <div>
              <div className="flex items-center space-x-1.5">
                <p className="text-xs font-bold text-white drop-shadow-md">{currentStory.displayName || currentStory.username}</p>
                {isCloseFriends && (
                  <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.2 rounded-full">
                    ★ Close Friends
                  </span>
                )}
              </div>
              <p className="text-[10px] text-white/75 drop-shadow">{formattedTime}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {currentStory.mediaType === 'VIDEO' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                  if (videoRef.current) videoRef.current.muted = !isMuted;
                }}
                className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}

            {(isOwner || isAdmin) && (
              <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="p-1.5 text-white/80 hover:text-rose-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Story Media */}
        <div className="w-full h-full flex items-center justify-center bg-black">
          {currentStory.mediaType === 'VIDEO' ? (
            <video
              ref={videoRef}
              src={currentStory.mediaUrl.startsWith('http') ? currentStory.mediaUrl : `http://localhost:8080${currentStory.mediaUrl}`}
              autoPlay
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentStory.mediaUrl.startsWith('http') ? currentStory.mediaUrl : `http://localhost:8080${currentStory.mediaUrl}`}
              alt="Story"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Story Bottom Controls: Caption, Views, Reply & Reactions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 space-y-3">
          {currentStory.caption && (
            <p className="text-xs text-white font-medium text-center drop-shadow-md line-clamp-2">
              {currentStory.caption}
            </p>
          )}

          {isOwner ? (
            <div className="flex items-center justify-center space-x-1.5 text-xs text-white/90 py-1">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold">{currentStory.viewsCount || 0} views</span>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Quick Emojis */}
              <div className="flex items-center justify-around px-2 py-1 bg-black/40 rounded-2xl backdrop-blur-md border border-white/10">
                {['❤️', '🔥', '😂', '😮', '😢', '👏'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={(e) => { e.stopPropagation(); handleQuickReaction(emoji); }}
                    className="text-lg hover:scale-125 active:scale-95 transition-transform cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* DM Reply Bar */}
              <form
                onSubmit={handleSendReply}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  placeholder={`Reply to ${currentStory.username}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  className="flex-1 bg-white/10 border border-white/20 focus:border-cyan-400 rounded-full px-3.5 py-1.5 text-xs text-white placeholder-white/60 focus:outline-none backdrop-blur-md"
                />
                {replyText.trim() && (
                  <button
                    type="submit"
                    className="p-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Tap areas for prev / next */}
        <div className="absolute inset-y-16 left-0 w-1/3 z-10 cursor-pointer" onClick={handlePrev} />
        <div className="absolute inset-y-16 right-0 w-1/3 z-10 cursor-pointer" onClick={handleNext} />
      </div>

      {/* Desktop Navigation Arrows */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="hidden md:block absolute left-10 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}
      {currentIndex < stories.length - 1 && (
        <button
          onClick={handleNext}
          className="hidden md:block absolute right-10 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}
    </div>
  );
};
