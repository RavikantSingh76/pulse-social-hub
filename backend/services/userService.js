const { query } = require('../config/db');

class UserService {
  async getProfileByUsername(username, currentUserId = null) {
    const [rows] = await query(
      `SELECT u.id, u.username, u.email, u.display_name, u.avatar_url, u.cover_url, u.bio, u.website, u.role, u.is_private, u.created_at,
              (SELECT COUNT(*) FROM follows WHERE following_id = u.id AND status = 'ACCEPTED') AS followers_count,
              (SELECT COUNT(*) FROM follows WHERE follower_id = u.id AND status = 'ACCEPTED') AS following_count,
              (SELECT COUNT(*) FROM posts WHERE user_id = u.id) AS posts_count
       FROM users u WHERE LOWER(u.username) = LOWER(?) AND u.is_suspended = 0`,
      [username.trim()]
    );

    if (rows.length === 0) {
      throw new Error('User profile not found.');
    }

    const profile = rows[0];
    profile.is_self = currentUserId ? Number(currentUserId) === Number(profile.id) : false;
    profile.follow_status = 'NONE'; // 'NONE', 'ACCEPTED', 'PENDING'
    profile.is_follower = false;
    profile.is_blocked = false;

    if (currentUserId && !profile.is_self) {
      // Check follow status
      const [followRows] = await query(
        'SELECT status FROM follows WHERE follower_id = ? AND following_id = ?',
        [currentUserId, profile.id]
      );
      if (followRows.length > 0) {
        profile.follow_status = followRows[0].status;
      }

      // Check if they follow me
      const [followerRows] = await query(
        'SELECT status FROM follows WHERE follower_id = ? AND following_id = ? AND status = "ACCEPTED"',
        [profile.id, currentUserId]
      );
      profile.is_follower = followerRows.length > 0;

      // Check if blocked
      const [blockRows] = await query(
        'SELECT id FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)',
        [currentUserId, profile.id, profile.id, currentUserId]
      );
      profile.is_blocked = blockRows.length > 0;
    }

    return profile;
  }

  async updateProfile(userId, data) {
    const { display_name, bio, website, is_private, avatar_url, cover_url } = data;
    const updates = [];
    const params = [];

    if (display_name !== undefined) {
      updates.push('display_name = ?');
      params.push(display_name.trim());
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      params.push(bio);
    }
    if (website !== undefined) {
      updates.push('website = ?');
      params.push(website.trim());
    }
    if (is_private !== undefined) {
      updates.push('is_private = ?');
      params.push(is_private ? 1 : 0);
    }
    if (avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      params.push(avatar_url);
    }
    if (cover_url !== undefined) {
      updates.push('cover_url = ?');
      params.push(cover_url);
    }

    if (updates.length > 0) {
      params.push(userId);
      await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [rows] = await query('SELECT id, username, email, display_name, avatar_url, cover_url, bio, website, role, is_private FROM users WHERE id = ?', [userId]);
    return rows[0];
  }

  async followUser(followerId, targetUserId) {
    if (Number(followerId) === Number(targetUserId)) {
      throw new Error('You cannot follow yourself.');
    }

    const [targetRows] = await query('SELECT id, username, is_private FROM users WHERE id = ? AND is_suspended = 0', [targetUserId]);
    if (targetRows.length === 0) throw new Error('Target user not found.');

    const targetUser = targetRows[0];

    // Check if blocked
    const [blocks] = await query('SELECT id FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)', [followerId, targetUserId, targetUserId, followerId]);
    if (blocks.length > 0) {
      throw new Error('Cannot perform this action due to user privacy restrictions.');
    }

    // Check existing follow
    const [existing] = await query('SELECT status FROM follows WHERE follower_id = ? AND following_id = ?', [followerId, targetUserId]);
    if (existing.length > 0) {
      return { status: existing[0].status, message: 'Already following or requested.' };
    }

    const newStatus = targetUser.is_private ? 'PENDING' : 'ACCEPTED';
    await query('INSERT INTO follows (follower_id, following_id, status) VALUES (?, ?, ?)', [followerId, targetUserId, newStatus]);

    // Create Notification
    const notifType = newStatus === 'PENDING' ? 'FOLLOW_REQUEST' : 'FOLLOW';
    const notifMsg = newStatus === 'PENDING' ? 'requested to follow you.' : 'started following you.';
    await query(
      'INSERT INTO notifications (recipient_id, actor_id, type, entity_id, entity_type, message) VALUES (?, ?, ?, ?, ?, ?)',
      [targetUserId, followerId, notifType, followerId, 'USER', notifMsg]
    );

    return { status: newStatus, message: newStatus === 'PENDING' ? 'Follow request sent.' : 'Followed successfully.' };
  }

  async unfollowUser(followerId, targetUserId) {
    await query('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [followerId, targetUserId]);
    return { success: true, message: 'Unfollowed successfully.' };
  }

  async getFollowers(userId, currentUserId = null) {
    const [rows] = await query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, u.bio, u.is_private,
              (SELECT status FROM follows WHERE follower_id = ? AND following_id = u.id) AS my_follow_status
       FROM follows f
       JOIN users u ON u.id = f.follower_id
       WHERE f.following_id = ? AND f.status = 'ACCEPTED' AND u.is_suspended = 0
       ORDER BY f.created_at DESC`,
      [currentUserId || 0, userId]
    );
    return rows;
  }

  async getFollowing(userId, currentUserId = null) {
    const [rows] = await query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, u.bio, u.is_private,
              (SELECT status FROM follows WHERE follower_id = ? AND following_id = u.id) AS my_follow_status
       FROM follows f
       JOIN users u ON u.id = f.following_id
       WHERE f.follower_id = ? AND f.status = 'ACCEPTED' AND u.is_suspended = 0
       ORDER BY f.created_at DESC`,
      [currentUserId || 0, userId]
    );
    return rows;
  }

  async getFollowRequests(userId) {
    const [rows] = await query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, u.bio, f.created_at
       FROM follows f
       JOIN users u ON u.id = f.follower_id
       WHERE f.following_id = ? AND f.status = 'PENDING' AND u.is_suspended = 0
       ORDER BY f.created_at DESC`,
      [userId]
    );
    return rows;
  }

  async acceptFollowRequest(userId, requesterId) {
    const [res] = await query(
      'UPDATE follows SET status = "ACCEPTED" WHERE follower_id = ? AND following_id = ? AND status = "PENDING"',
      [requesterId, userId]
    );

    if (res.affectedRows > 0) {
      await query(
        'INSERT INTO notifications (recipient_id, actor_id, type, entity_id, entity_type, message) VALUES (?, ?, "FOLLOW_ACCEPT", ?, "USER", "accepted your follow request.")',
        [requesterId, userId, userId]
      );
      return { success: true, message: 'Follow request accepted.' };
    }
    throw new Error('Follow request not found or already processed.');
  }

  async rejectFollowRequest(userId, requesterId) {
    await query(
      'DELETE FROM follows WHERE follower_id = ? AND following_id = ? AND status = "PENDING"',
      [requesterId, userId]
    );
    return { success: true, message: 'Follow request rejected.' };
  }

  async searchUsers(searchQuery, currentUserId = null, limit = 20) {
    if (!searchQuery || !searchQuery.trim()) return [];
    const term = `%${searchQuery.trim()}%`;
    const [rows] = await query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, u.bio, u.is_private,
              (SELECT COUNT(*) FROM follows WHERE following_id = u.id AND status = 'ACCEPTED') AS followers_count,
              (SELECT status FROM follows WHERE follower_id = ? AND following_id = u.id) AS my_follow_status
       FROM users u
       WHERE (u.username LIKE ? OR u.display_name LIKE ? OR u.bio LIKE ?)
         AND u.is_suspended = 0
       LIMIT ?`,
      [currentUserId || 0, term, term, term, Number(limit)]
    );
    return rows;
  }

  async getSuggestions(currentUserId, limit = 5) {
    const [rows] = await query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, u.bio,
              (SELECT COUNT(*) FROM follows WHERE following_id = u.id AND status = 'ACCEPTED') AS followers_count
       FROM users u
       WHERE u.id != ?
         AND u.is_suspended = 0
         AND u.id NOT IN (SELECT following_id FROM follows WHERE follower_id = ?)
       ORDER BY followers_count DESC, u.created_at DESC
       LIMIT ?`,
      [currentUserId, currentUserId, Number(limit)]
    );
    return rows;
  }

  async blockUser(blockerId, blockedId) {
    if (Number(blockerId) === Number(blockedId)) throw new Error('Cannot block yourself.');
    await query('INSERT OR IGNORE INTO blocks (blocker_id, blocked_id) VALUES (?, ?)', [blockerId, blockedId]);
    // Remove follows both ways
    await query('DELETE FROM follows WHERE (follower_id = ? AND following_id = ?) OR (follower_id = ? AND following_id = ?)', [blockerId, blockedId, blockedId, blockerId]);
    return { success: true, message: 'User blocked.' };
  }

  async unblockUser(blockerId, blockedId) {
    await query('DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?', [blockerId, blockedId]);
    return { success: true, message: 'User unblocked.' };
  }
}

module.exports = new UserService();
