import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { userService } from '../../services/services';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const FollowListModal = ({ isOpen, onClose, userId, type = 'followers' }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      const fetchFn = type === 'followers' ? userService.getFollowers(userId) : userService.getFollowing(userId);
      fetchFn
        .then(res => {
          if (res.success && res.data) setUsers(res.data);
        })
        .catch(() => toast.error('Failed to load list'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, userId, type]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={type === 'followers' ? 'Followers' : 'Following'} maxWidth="max-w-sm">
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {loading ? (
          <p className="text-xs text-center text-gray-400 py-4">Loading list...</p>
        ) : users.length === 0 ? (
          <p className="text-xs text-center text-gray-400 py-4">No users found.</p>
        ) : (
          users.map(u => (
            <div key={u.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-colors">
              <Link to={`/profile/${u.username}`} onClick={onClose} className="flex items-center space-x-3 min-w-0">
                <Avatar src={u.avatarUrl} username={u.username} size="sm" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{u.displayName}</p>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">@{u.username}</p>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};
