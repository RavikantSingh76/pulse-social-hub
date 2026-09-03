import React, { useState, useEffect } from 'react';
import { messageService, userService } from '../../services/services';
import { Users, X, Check, Image as ImageIcon } from 'lucide-react';

export default function GroupChatModal({ onClose, onCreated }) {
  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await userService.searchUsers('');
      if (res.data?.success) {
        setUsers(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelectUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedUserIds.length === 0) return;

    try {
      setSubmitting(true);
      const res = await messageService.createGroup({
        groupName: groupName.trim(),
        groupAvatarUrl: groupAvatar || null,
        memberIds: selectedUserIds,
      });
      if (res.data?.success) {
        onCreated && onCreated(res.data.data);
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create group chat');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">Create Group Chat</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Design Team, Friends, Project Alpha"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 mb-2 block">
              Select Members ({selectedUserIds.length} selected)
            </label>
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {users.map((u) => {
                const isSelected = selectedUserIds.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => toggleSelectUser(u.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors border ${
                      isSelected
                        ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-500'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                        alt={u.displayName}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          {u.displayName || u.username}
                        </p>
                        <p className="text-[10px] text-slate-500">@{u.username}</p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                        isSelected ? 'bg-primary-600 border-primary-600 text-white' : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !groupName.trim() || selectedUserIds.length === 0}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-md shadow-primary-500/25 cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
