import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { settingsService } from '../services/services';
import { Shield, Lock, Activity, Eye, KeyRound, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function SettingsPage() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('privacy');

  // Privacy State
  const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(user?.showOnlineStatus !== false);
  const [allowMessagesFrom, setAllowMessagesFrom] = useState(user?.allowMessagesFrom || 'EVERYONE');
  const [privacySaved, setPrivacySaved] = useState(false);

  // Security State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ text: '', isError: false });
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const handleUpdatePrivacy = async () => {
    try {
      const res = await settingsService.updatePrivacy({
        isPrivate,
        showOnlineStatus,
        allowMessagesFrom,
      });
      if (res.data?.success) {
        setPrivacySaved(true);
        setTimeout(() => setPrivacySaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match', isError: true });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'Password must be at least 6 characters', isError: true });
      return;
    }

    try {
      setSubmittingPassword(true);
      setPasswordMsg({ text: '', isError: false });
      const res = await settingsService.changePassword({ oldPassword, newPassword });
      if (res.data?.success) {
        setPasswordMsg({ text: 'Password changed successfully! 🔒', isError: false });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordMsg({ text: err.response?.data?.message || 'Failed to update password', isError: true });
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary-600" />
          Settings & Account Center
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage privacy preferences, security credentials, and activity logs
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'privacy'
              ? 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Privacy</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'security'
              ? 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security & Password</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'activity'
              ? 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Activity Log</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'privacy' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Private Account</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                When enabled, only accepted followers can view your posts and stories
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-5">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Show Activity & Online Status</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Allow people to see when you are active on the platform
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlineStatus}
                onChange={(e) => setShowOnlineStatus(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Allow Direct Messages From</h3>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {[
                { id: 'EVERYONE', label: 'Everyone' },
                { id: 'FOLLOWERS', label: 'Followers Only' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAllowMessagesFrom(opt.id)}
                  className={`p-3 rounded-2xl border text-sm font-semibold transition-all text-left ${
                    allowMessagesFrom === opt.id
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {privacySaved ? (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Changes saved successfully!
              </span>
            ) : <span />}

            <button
              onClick={handleUpdatePrivacy}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-primary-500/25 cursor-pointer"
            >
              Save Privacy Preferences
            </button>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary-600" />
              Change Password
            </h3>

            {passwordMsg.text && (
              <div
                className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                  passwordMsg.isError ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'
                }`}
              >
                {passwordMsg.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submittingPassword}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-primary-500/25 cursor-pointer disabled:opacity-50"
            >
              {submittingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          {/* Session Management */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Active Login Sessions</h3>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Current Browser Session (Windows / Chrome)</p>
                <p className="text-[10px] text-emerald-600 font-medium mt-0.5">● Active Now</p>
              </div>
              <span className="text-xs text-slate-400">Authenticated with JWT</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white">Your Activity History</h3>
          <p className="text-xs text-slate-500">Recent posts, comments, and interactions on your account.</p>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <div className="text-xs text-slate-600 dark:text-slate-300">
              Account created and running on pulse social platform with full real-time WebSocket sync.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
