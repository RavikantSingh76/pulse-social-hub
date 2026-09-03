import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storyService } from '../../services/services';
import { StoryViewerModal } from './StoryViewerModal';
import { CreateStoryModal } from './CreateStoryModal';
import CloseFriendsModal from '../profile/CloseFriendsModal';
import { Plus, Star } from 'lucide-react';

export const StoryTray = ({ onOpenTextStory }) => {
  const { user, isAuthenticated } = useAuth();
  const [stories, setStories] = useState([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCloseFriendsOpen, setIsCloseFriendsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const res = await storyService.getActiveStories();
      if (res.data?.success && res.data.data) {
        setStories(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 p-4 mb-6 shadow-sm overflow-hidden">
      <div className="flex items-center space-x-4 overflow-x-auto scrollbar-none py-1">
        {/* Add Story Button */}
        {isAuthenticated && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex flex-col items-center space-y-1.5 flex-shrink-0 group focus:outline-none cursor-pointer"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full p-[2px] border-2 border-dashed border-slate-300 dark:border-slate-700 group-hover:border-primary-500 transition-colors flex items-center justify-center">
                <img
                  src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
                  alt="Your story"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="absolute bottom-0 right-0 p-1 rounded-full bg-gradient-to-tr from-primary-600 to-pink-500 text-white shadow-md group-hover:scale-110 transition-transform">
                <Plus className="w-3.5 h-3.5" />
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[64px]">
              Your Story
            </span>
          </button>
        )}

        {/* Close Friends Manager Button */}
        {isAuthenticated && (
          <button
            onClick={() => setIsCloseFriendsOpen(true)}
            className="flex flex-col items-center space-y-1.5 flex-shrink-0 group focus:outline-none cursor-pointer"
            title="Manage Close Friends"
          >
            <div className="w-16 h-16 rounded-full p-[2px] border-2 border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
              <Star className="w-7 h-7 fill-emerald-500" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-[64px]">
              Close Circle
            </span>
          </button>
        )}

        {/* Stories List */}
        {stories.map((story, index) => {
          const isCloseFriendStory = story.audience === 'CLOSE_FRIENDS';
          const ringGradient = isCloseFriendStory
            ? 'bg-gradient-to-tr from-emerald-400 via-green-500 to-teal-500 ring-2 ring-emerald-500/30'
            : story.isViewed
            ? 'border-2 border-slate-300 dark:border-slate-700'
            : 'bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600';

          return (
            <button
              key={story.id}
              onClick={() => setActiveStoryIndex(index)}
              className="flex flex-col items-center space-y-1.5 flex-shrink-0 group focus:outline-none cursor-pointer"
            >
              <div className={`w-16 h-16 rounded-full p-[2.5px] transition-transform group-hover:scale-105 ${ringGradient}`}>
                <div className="w-full h-full rounded-full p-[2px] bg-white dark:bg-slate-900 relative">
                  <img
                    src={story.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${story.username}`}
                    alt={story.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                  {isCloseFriendStory && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[9px] font-black ring-2 ring-white dark:ring-slate-900" title="Close Friends Story">
                      ★
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[64px]">
                {story.username}
              </span>
            </button>
          );
        })}
      </div>

      {/* Story Viewer Modal */}
      {activeStoryIndex !== null && (
        <StoryViewerModal
          stories={stories}
          initialIndex={activeStoryIndex}
          onClose={() => {
            setActiveStoryIndex(null);
            loadStories();
          }}
        />
      )}

      {/* Create Story Modal */}
      {isCreateOpen && (
        <CreateStoryModal
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            loadStories();
          }}
        />
      )}

      {/* Close Friends Modal */}
      {isCloseFriendsOpen && (
        <CloseFriendsModal
          isOpen={isCloseFriendsOpen}
          onClose={() => setIsCloseFriendsOpen(false)}
        />
      )}
    </div>
  );
};
