import React, { useState, useEffect } from 'react';
import { notificationService, userService } from '../services/services';
import { Avatar } from '../components/common/Avatar';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Sparkles,
  CheckCheck,
  Settings2,
  X,
  Sliders
} from 'lucide-react';
import toast from 'react-hot-toast';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    notifyLikes: true,
    notifyComments: true,
    notifyFollowers: true,
    notifyMessages: true,
    notifyMentions: true,
    notifyStories: true
  });
  const [savingPref, setSavingPref] = useState(false);

  useEffect(() => {
    loadData();
    loadPreferences();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications(1, 40);
      if (res.data?.success && res.data.data) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const res = await notificationService.getPreferences();
      if (res.data?.success && res.data.data) {
        setPreferences(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePref = async (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    try {
      setSavingPref(true);
      await notificationService.updatePreferences(updated);
      toast.success('Notification preferences updated');
    } catch (err) {
      toast.error('Failed to update preference');
    } finally {
      setSavingPref(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark notifications');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'LIKE':
      case 'REACTION':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'COMMENT':
      case 'REPLY':
        return <MessageCircle className="w-4 h-4 text-primary-500" />;
      case 'FOLLOW':
      case 'FOLLOW_ACCEPT':
        return <UserPlus className="w-4 h-4 text-emerald-500" />;
      case 'MENTION':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-primary-50 dark:bg-primary-950 text-primary-600 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">Notifications</h1>
            <p className="text-[11px] text-slate-400">Activity and interactions across your posts & network.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreferences(true)}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Notification Preferences"
          >
            <Sliders className="w-4 h-4" />
          </button>
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Mark all read</span>
          </button>
        </div>
      </div>

      {/* Grouped Notifications List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden">
        {loading ? (
          <p className="p-12 text-xs text-center text-slate-400 animate-pulse">Loading activity...</p>
        ) : notifications.length === 0 ? (
          <div className="p-14 text-center text-slate-400 text-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
              🔔
            </div>
            <p className="font-bold text-slate-700 dark:text-slate-300">All caught up!</p>
            <p className="text-[11px] max-w-xs mx-auto">When creators like, comment, or interact with your posts, you'll see grouped alerts here.</p>
          </div>
        ) : (
          notifications.map((notif, idx) => (
            <div
              key={notif.groupKey || idx}
              className={`p-4 sm:p-5 flex items-center justify-between transition-colors ${
                !notif.isRead ? 'bg-primary-50/40 dark:bg-primary-950/20' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
              }`}
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                {/* Overlapping Avatars if multiple */}
                <div className="relative flex-shrink-0">
                  {notif.actors && notif.actors.length > 1 ? (
                    <div className="flex -space-x-3">
                      {notif.actors.slice(0, 2).map((act, i) => (
                        <Avatar key={i} src={act.avatarUrl} username={act.username} size="sm" />
                      ))}
                    </div>
                  ) : (
                    <Avatar src={notif.primaryActor?.avatarUrl} username={notif.primaryActor?.username} size="md" />
                  )}
                  <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white dark:bg-slate-900 shadow-sm">
                    {getIcon(notif.type)}
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-snug break-words">
                    {notif.formattedMessage}
                  </p>
                  <span className="text-[11px] text-slate-400">
                    {notif.latestTimestamp ? formatDistanceToNow(new Date(notif.latestTimestamp), { addSuffix: true }) : 'Just now'}
                  </span>
                </div>
              </div>

              {notif.entityType === 'POST' && notif.entityId && (
                <Link
                  to={`/posts/${notif.entityId}`}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-50 flex-shrink-0 ml-2"
                >
                  View
                </Link>
              )}
            </div>
          ))
        )}
      </div>

      {/* Notification Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary-500" />
                Notification Preferences
              </h3>
              <button onClick={() => setShowPreferences(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">Choose which notifications you wish to receive.</p>

            <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { key: 'notifyLikes', label: 'Likes & Reactions' },
                { key: 'notifyComments', label: 'Comments & Replies' },
                { key: 'notifyFollowers', label: 'New Followers' },
                { key: 'notifyMessages', label: 'Direct & Group Messages' },
                { key: 'notifyMentions', label: 'Mentions in Content' },
                { key: 'notifyStories', label: 'Story Interactions' }
              ].map(item => (
                <div key={item.key} className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.label}</span>
                  <button
                    onClick={() => handleTogglePref(item.key)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      preferences[item.key] ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        preferences[item.key] ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-5 py-2 rounded-xl bg-primary-600 text-white text-xs font-bold hover:bg-primary-700 cursor-pointer"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
