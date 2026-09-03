import React, { useState, useEffect } from 'react';
import { closeFriendService, userService } from '../../services/services';
import { Avatar } from '../common/Avatar';
import { Star, Search, Plus, Trash2, X, Check, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CloseFriendsModal({ isOpen, onClose }) {
  const [closeFriends, setCloseFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadCloseFriends();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      userService.searchUsers(searchQuery, 6).then(res => {
        if (res.data?.success) {
          setSearchResults(res.data.data || []);
        }
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadCloseFriends = async () => {
    try {
      setLoading(true);
      const res = await closeFriendService.getCloseFriends();
      if (res.data?.success) {
        setCloseFriends(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (targetUser) => {
    try {
      const res = await closeFriendService.addCloseFriend(targetUser.id);
      if (res.data?.success) {
        setCloseFriends(prev => [targetUser, ...prev.filter(f => f.id !== targetUser.id)]);
        toast.success(`Added @${targetUser.username} to Close Friends ⭐️`);
      }
    } catch (err) {
      toast.error('Failed to add close friend');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await closeFriendService.removeCloseFriend(friendId);
      setCloseFriends(prev => prev.filter(f => f.id !== friendId));
      toast.success('Removed from Close Friends');
    } catch (err) {
      toast.error('Failed to remove friend');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-emerald-500" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Close Friends</h3>
              <p className="text-[11px] text-slate-400">Share private stories exclusively with these friends.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search to add */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search people to add..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 border-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Search suggestions */}
          {searchResults.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 divide-y divide-slate-100 dark:divide-slate-700 max-h-40 overflow-y-auto">
              {searchResults.map(u => {
                const isAlready = closeFriends.some(cf => cf.id === u.id);
                return (
                  <div key={u.id} className="p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar src={u.avatarUrl} username={u.username} size="sm" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{u.displayName}</p>
                        <p className="text-[10px] text-slate-400">@{u.username}</p>
                      </div>
                    </div>
                    {isAlready ? (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">
                        <Check className="w-3.5 h-3.5" /> Added
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAddFriend(u)}
                        className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Current close friends list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1 pb-1">
            <span>List Members ({closeFriends.length})</span>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400 text-center py-6">Loading Close Friends...</p>
          ) : closeFriends.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs space-y-2">
              <p>No close friends added yet.</p>
              <p className="text-[11px]">Search users above to add them to your private circle.</p>
            </div>
          ) : (
            closeFriends.map(f => (
              <div key={f.id} className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar src={f.avatarUrl} username={f.username} size="md" />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] text-white font-black ring-2 ring-white dark:ring-slate-900">
                      ★
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{f.displayName}</p>
                    <p className="text-[11px] text-slate-400">@{f.username}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveFriend(f.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                  title="Remove from close friends"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
