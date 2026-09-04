import React, { useState, useEffect } from 'react';
import { adminService } from '../services/services';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/common/Avatar';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  FileText,
  Video,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  Lock,
  Unlock,
  AlertOctagon,
  X
} from 'lucide-react';
import { PulseLogo } from '../components/common/PulseLogo';
import toast from 'react-hot-toast';

export const AdminDashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [postsList, setPostsList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  // Warning Modal
  const [warnUserTarget, setWarnUserTarget] = useState(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [sendingWarning, setSendingWarning] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, postsRes, reportsRes] = await Promise.all([
        adminService.getStats(),
        adminService.listUsers(1, 30),
        adminService.listPosts(1, 30),
        adminService.listReports('PENDING')
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (usersRes.data?.success) setUsersList(usersRes.data.data || []);
      if (postsRes.data?.success) setPostsList(postsRes.data.data || []);
      if (reportsRes.data?.success) setReportsList(reportsRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await adminService.toggleUserStatus(userId);
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, isSuspended: res.data?.data?.isSuspended } : u));
      toast.success('User status updated');
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleToggleVerification = async (userId, currentVerified) => {
    try {
      const res = await adminService.verifyUser(userId, !currentVerified);
      if (res.data?.success) {
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, isVerified: !currentVerified } : u));
        toast.success(!currentVerified ? 'User verified with official badge! 🛡️' : 'Verification removed');
      }
    } catch (err) {
      toast.error('Failed to update verification');
    }
  };

  const handleSendWarning = async (e) => {
    e.preventDefault();
    if (!warningMessage.trim() || !warnUserTarget) return;

    try {
      setSendingWarning(true);
      await adminService.warnUser(warnUserTarget.id, warningMessage.trim());
      toast.success(`Official warning sent to @${warnUserTarget.username}`);
      setWarnUserTarget(null);
      setWarningMessage('');
    } catch (err) {
      toast.error('Failed to send warning');
    } finally {
      setSendingWarning(false);
    }
  };

  const handleResolveReport = async (reportId, status) => {
    try {
      await adminService.resolveReport(reportId, status);
      setReportsList(prev => prev.filter(r => r.id !== reportId));
      toast.success(`Report marked as ${status}`);
    } catch (err) {
      toast.error('Failed to resolve report');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">Admin Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Platform Administration</h1>
          <p className="text-xs text-slate-300">Oversee platform safety, verification badges, user warnings, and content moderation.</p>
        </div>

        <PulseLogo variant="sidebar" size="md" to="/" />
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'stats', label: '📊 Overview' },
          { id: 'users', label: `👥 Users (${usersList.length})` },
          { id: 'posts', label: `📝 Content (${postsList.length})` },
          { id: 'reports', label: `🚨 Reports (${reportsList.length})` }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Stats */}
      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-1">
            <Users className="w-5 h-5 text-primary-500 mb-2" />
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.totalUsers}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Registered Users</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-1">
            <CheckCircle className="w-5 h-5 text-emerald-500 mb-2" />
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.activeUsers}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Active Non-Suspended Users</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-1">
            <FileText className="w-5 h-5 text-purple-500 mb-2" />
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.totalPosts}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Posts Created</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-1">
            <Video className="w-5 h-5 text-pink-500 mb-2" />
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.totalVideos}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Video Posts & Reels</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-1">
            <AlertTriangle className="w-5 h-5 text-amber-500 mb-2" />
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.totalReports}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Content Reports</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-1">
            <AlertTriangle className="w-5 h-5 text-rose-500 mb-2" />
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.pendingReports}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pending Review</p>
          </div>
        </div>
      )}

      {/* Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {usersList.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-4 flex items-center space-x-3">
                      <Avatar src={u.avatarUrl} username={u.username} size="sm" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                          {u.displayName}
                          {u.isVerified && <span className="text-primary-600">✓</span>}
                        </p>
                        <p className="text-[11px] text-slate-400">@{u.username}</p>
                      </div>
                    </td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleVerification(u.id, u.isVerified)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                          u.isVerified
                            ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/50 hover:bg-rose-50 hover:text-rose-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-primary-50 hover:text-primary-600'
                        }`}
                      >
                        {u.isVerified ? '✓ Verified' : '+ Grant Badge'}
                      </button>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.isSuspended ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'
                      }`}>
                        {u.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {u.role !== 'ADMIN' && (
                        <>
                          <button
                            onClick={() => setWarnUserTarget(u)}
                            className="px-3 py-1.5 rounded-xl font-bold text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-600 hover:bg-amber-100 cursor-pointer"
                          >
                            Warn
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                              u.isSuspended
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-rose-600 text-white hover:bg-rose-700'
                            }`}
                          >
                            {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Posts Moderation */}
      {activeTab === 'posts' && (
        <div className="space-y-3">
          {postsList.map(p => (
            <div key={p.id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0 pr-4">
                <Avatar src={p.avatarUrl} username={p.username} size="sm" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {p.displayName} <span className="text-slate-400 font-normal">@{p.username}</span>
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-md">{p.caption || 'Media post'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Link to={`/posts/${p.id}`} className="text-xs font-semibold text-primary-600 underline">View</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reports Queue */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reportsList.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200/70 dark:border-slate-800">
              No pending reports to moderate! Everything is clean.
            </div>
          ) : (
            reportsList.map(r => (
              <div key={r.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/70 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">Reason: {r.reason}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">{r.status}</span>
                </div>
                {r.details && <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{r.details}"</p>}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400">Reported by @{r.reporter?.username || 'User'}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleResolveReport(r.id, 'RESOLVED')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                    >
                      Resolve & Action
                    </button>
                    <button
                      onClick={() => handleResolveReport(r.id, 'DISMISSED')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* User Warning Modal */}
      {warnUserTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-amber-500" />
                Issue Official Warning
              </h3>
              <button onClick={() => setWarnUserTarget(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Sending an administrative policy warning to <strong>@{warnUserTarget.username}</strong> ({warnUserTarget.displayName}).
            </p>

            <form onSubmit={handleSendWarning} className="space-y-4">
              <textarea
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                placeholder="Describe reason for warning (e.g. inappropriate content, spamming, harassment)..."
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-primary-500 border-none"
                required
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWarnUserTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingWarning || !warningMessage.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-md disabled:opacity-50"
                >
                  {sendingWarning ? 'Sending...' : 'Send Warning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
