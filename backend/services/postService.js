const { query } = require('../config/db');

class PostService {
  extractHashtags(text) {
    if (!text) return [];
    const matches = text.match(/#([a-zA-Z0-9_]+)/g);
    if (!matches) return [];
    return [...new Set(matches.map(m => m.slice(1).toLowerCase()))];
  }

  extractMentions(text) {
    if (!text) return [];
    const matches = text.match(/@([a-zA-Z0-9_]+)/g);
    if (!matches) return [];
    return [...new Set(matches.map(m => m.slice(1).toLowerCase()))];
  }

  async createPost(userId, { caption = '', visibility = 'PUBLIC', post_type = 'POST', title = null, mediaItems = [] }) {
    // 1. Insert post record
    const [pRes] = await query(
      `INSERT INTO posts (user_id, caption, visibility, post_type, title)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, caption, visibility, post_type, title]
    );
    const postId = pRes.insertId;

    // 2. Insert media items
    if (mediaItems && mediaItems.length > 0) {
      for (let i = 0; i < mediaItems.length; i++) {
        const item = mediaItems[i];
        await query(
          `INSERT INTO post_media (post_id, media_url, media_type, order_index)
           VALUES (?, ?, ?, ?)`,
          [postId, item.url, item.type || 'IMAGE', i]
        );
      }
    }

    // 3. Process Hashtags
    const hashtags = this.extractHashtags(caption);
    for (const tag of hashtags) {
      let tagId;
      const [existing] = await query('SELECT id FROM hashtags WHERE tag = ?', [tag]);
      if (existing.length > 0) {
        tagId = existing[0].id;
      } else {
        const [tagRes] = await query('INSERT INTO hashtags (tag) VALUES (?)', [tag]);
        tagId = tagRes.insertId;
      }
      await query('INSERT OR IGNORE INTO post_hashtags (post_id, hashtag_id) VALUES (?, ?)', [postId, tagId]);
    }

    // 4. Process Mentions
    const mentions = this.extractMentions(caption);
    for (const username of mentions) {
      const [userRows] = await query('SELECT id FROM users WHERE LOWER(username) = LOWER(?)', [username]);
      if (userRows.length > 0) {
        const mentionedId = userRows[0].id;
        await query(
          'INSERT INTO mentions (post_id, mentioned_user_id) VALUES (?, ?)',
          [postId, mentionedId]
        );
        if (Number(mentionedId) !== Number(userId)) {
          await query(
            'INSERT INTO notifications (recipient_id, actor_id, type, entity_id, entity_type, message) VALUES (?, ?, "MENTION", ?, "POST", "mentioned you in a post.")',
            [mentionedId, userId, postId]
          );
        }
      }
    }

    return this.getPostById(postId, userId);
  }

  async getPostById(postId, currentUserId = null) {
    const [rows] = await query(
      `SELECT p.id, p.user_id, p.caption, p.visibility, p.post_type, p.title, p.view_count, p.created_at, p.updated_at,
              u.username, u.display_name, u.avatar_url, u.is_private,
              (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count,
              (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) AS is_liked,
              (SELECT COUNT(*) FROM saved_posts WHERE post_id = p.id AND user_id = ?) AS is_saved
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE p.id = ? AND u.is_suspended = 0`,
      [currentUserId || 0, currentUserId || 0, postId]
    );

    if (rows.length === 0) throw new Error('Post not found or removed.');

    const post = rows[0];
    post.is_liked = Boolean(post.is_liked);
    post.is_saved = Boolean(post.is_saved);

    // Fetch media
    const [media] = await query(
      'SELECT id, media_url, media_type, order_index FROM post_media WHERE post_id = ? ORDER BY order_index ASC',
      [postId]
    );
    post.media = media;

    // Fetch hashtags
    const [tags] = await query(
      `SELECT h.tag FROM post_hashtags ph JOIN hashtags h ON h.id = ph.hashtag_id WHERE ph.post_id = ?`,
      [postId]
    );
    post.hashtags = tags.map(t => t.tag);

    return post;
  }

  async getFeed(currentUserId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    // Fetch feed posts: from users the current user follows, or current user's posts, or public posts
    let sql;
    let params;

    if (currentUserId) {
      sql = `
        SELECT p.id, p.user_id, p.caption, p.visibility, p.post_type, p.title, p.view_count, p.created_at, p.updated_at,
               u.username, u.display_name, u.avatar_url, u.is_private,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
               (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) AS is_liked,
               (SELECT COUNT(*) FROM saved_posts WHERE post_id = p.id AND user_id = ?) AS is_saved
        FROM posts p
        JOIN users u ON u.id = p.user_id
        WHERE u.is_suspended = 0
          AND (
            p.user_id = ?
            OR (p.visibility = 'PUBLIC')
            OR (p.visibility = 'FOLLOWERS' AND p.user_id IN (SELECT following_id FROM follows WHERE follower_id = ? AND status = 'ACCEPTED'))
          )
          AND p.user_id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = ?)
          AND p.user_id NOT IN (SELECT blocker_id FROM blocks WHERE blocked_id = ?)
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `;
      params = [currentUserId, currentUserId, currentUserId, currentUserId, currentUserId, currentUserId, Number(limit), Number(offset)];
    } else {
      sql = `
        SELECT p.id, p.user_id, p.caption, p.visibility, p.post_type, p.title, p.view_count, p.created_at, p.updated_at,
               u.username, u.display_name, u.avatar_url, u.is_private,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
               (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count,
               0 AS is_liked,
               0 AS is_saved
        FROM posts p
        JOIN users u ON u.id = p.user_id
        WHERE u.is_suspended = 0 AND p.visibility = 'PUBLIC'
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `;
      params = [Number(limit), Number(offset)];
    }

    const [rows] = await query(sql, params);

    // Attach media to each post
    for (const post of rows) {
      post.is_liked = Boolean(post.is_liked);
      post.is_saved = Boolean(post.is_saved);
      const [media] = await query(
        'SELECT id, media_url, media_type, order_index FROM post_media WHERE post_id = ? ORDER BY order_index ASC',
        [post.id]
      );
      post.media = media;
    }

    return { posts: rows, page: Number(page), limit: Number(limit) };
  }

  async getUserPosts(username, currentUserId = null, tab = 'posts', page = 1, limit = 12) {
    const offset = (page - 1) * limit;

    const [userRows] = await query('SELECT id, is_private FROM users WHERE LOWER(username) = LOWER(?) AND is_suspended = 0', [username]);
    if (userRows.length === 0) throw new Error('User not found.');

    const targetUser = userRows[0];
    const isSelf = currentUserId && Number(currentUserId) === Number(targetUser.id);

    // If private and not self and not accepted follower -> return empty with private flag
    if (targetUser.is_private && !isSelf) {
      let isFollower = false;
      if (currentUserId) {
        const [fRows] = await query('SELECT id FROM follows WHERE follower_id = ? AND following_id = ? AND status = "ACCEPTED"', [currentUserId, targetUser.id]);
        isFollower = fRows.length > 0;
      }
      if (!isFollower) {
        return { posts: [], is_private_restricted: true };
      }
    }

    let sql;
    let params;

    if (tab === 'saved' && isSelf) {
      sql = `
        SELECT p.id, p.user_id, p.caption, p.visibility, p.post_type, p.title, p.view_count, p.created_at,
               u.username, u.display_name, u.avatar_url,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
               (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) AS is_liked,
               1 AS is_saved
        FROM saved_posts sp
        JOIN posts p ON p.id = sp.post_id
        JOIN users u ON u.id = p.user_id
        WHERE sp.user_id = ?
        ORDER BY sp.created_at DESC
        LIMIT ? OFFSET ?
      `;
      params = [currentUserId, currentUserId, Number(limit), Number(offset)];
    } else if (tab === 'videos') {
      sql = `
        SELECT p.id, p.user_id, p.caption, p.visibility, p.post_type, p.title, p.view_count, p.created_at,
               u.username, u.display_name, u.avatar_url,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
               (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) AS is_liked,
               (SELECT COUNT(*) FROM saved_posts WHERE post_id = p.id AND user_id = ?) AS is_saved
        FROM posts p
        JOIN users u ON u.id = p.user_id
        WHERE p.user_id = ? AND p.post_type = 'VIDEO'
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `;
      params = [currentUserId || 0, currentUserId || 0, targetUser.id, Number(limit), Number(offset)];
    } else {
      sql = `
        SELECT p.id, p.user_id, p.caption, p.visibility, p.post_type, p.title, p.view_count, p.created_at,
               u.username, u.display_name, u.avatar_url,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
               (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) AS is_liked,
               (SELECT COUNT(*) FROM saved_posts WHERE post_id = p.id AND user_id = ?) AS is_saved
        FROM posts p
        JOIN users u ON u.id = p.user_id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `;
      params = [currentUserId || 0, currentUserId || 0, targetUser.id, Number(limit), Number(offset)];
    }

    const [rows] = await query(sql, params);

    for (const post of rows) {
      post.is_liked = Boolean(post.is_liked);
      post.is_saved = Boolean(post.is_saved);
      const [media] = await query(
        'SELECT id, media_url, media_type, order_index FROM post_media WHERE post_id = ? ORDER BY order_index ASC',
        [post.id]
      );
      post.media = media;
    }

    return { posts: rows, page: Number(page), limit: Number(limit) };
  }

  async getExplorePosts(currentUserId = null, page = 1, limit = 18) {
    const offset = (page - 1) * limit;

    const [posts] = await query(
      `SELECT p.id, p.user_id, p.caption, p.visibility, p.post_type, p.title, p.view_count, p.created_at,
              u.username, u.display_name, u.avatar_url,
              (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count,
              (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) AS is_liked,
              (SELECT COUNT(*) FROM saved_posts WHERE post_id = p.id AND user_id = ?) AS is_saved
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE u.is_suspended = 0 AND p.visibility = 'PUBLIC'
       ORDER BY (likes_count * 2 + comments_count * 3 + p.view_count) DESC, p.created_at DESC
       LIMIT ? OFFSET ?`,
      [currentUserId || 0, currentUserId || 0, Number(limit), Number(offset)]
    );

    for (const post of posts) {
      post.is_liked = Boolean(post.is_liked);
      post.is_saved = Boolean(post.is_saved);
      const [media] = await query(
        'SELECT id, media_url, media_type, order_index FROM post_media WHERE post_id = ? ORDER BY order_index ASC',
        [post.id]
      );
      post.media = media;
    }

    // Also fetch trending hashtags
    const [trendingTags] = await query(
      `SELECT h.tag, COUNT(ph.post_id) AS post_count
       FROM hashtags h
       JOIN post_hashtags ph ON ph.hashtag_id = h.id
       GROUP BY h.id, h.tag
       ORDER BY post_count DESC
       LIMIT 8`
    );

    return { posts, trendingTags };
  }

  async getHashtagPosts(tag, currentUserId = null, page = 1, limit = 18) {
    const offset = (page - 1) * limit;
    const cleanTag = tag.replace('#', '').toLowerCase();

    const [posts] = await query(
      `SELECT p.id, p.user_id, p.caption, p.visibility, p.post_type, p.title, p.view_count, p.created_at,
              u.username, u.display_name, u.avatar_url,
              (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count,
              (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) AS is_liked,
              (SELECT COUNT(*) FROM saved_posts WHERE post_id = p.id AND user_id = ?) AS is_saved
       FROM posts p
       JOIN users u ON u.id = p.user_id
       JOIN post_hashtags ph ON ph.post_id = p.id
       JOIN hashtags h ON h.id = ph.hashtag_id
       WHERE h.tag = ? AND u.is_suspended = 0 AND p.visibility = 'PUBLIC'
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [currentUserId || 0, currentUserId || 0, cleanTag, Number(limit), Number(offset)]
    );

    for (const post of posts) {
      post.is_liked = Boolean(post.is_liked);
      post.is_saved = Boolean(post.is_saved);
      const [media] = await query(
        'SELECT id, media_url, media_type, order_index FROM post_media WHERE post_id = ? ORDER BY order_index ASC',
        [post.id]
      );
      post.media = media;
    }

    return { tag: cleanTag, posts };
  }

  async updatePost(postId, userId, { caption, visibility }) {
    const [rows] = await query('SELECT user_id FROM posts WHERE id = ?', [postId]);
    if (rows.length === 0) throw new Error('Post not found.');

    if (Number(rows[0].user_id) !== Number(userId)) {
      throw new Error('Unauthorized: You can only edit your own posts.');
    }

    const updates = [];
    const params = [];
    if (caption !== undefined) {
      updates.push('caption = ?');
      params.push(caption);
    }
    if (visibility !== undefined) {
      updates.push('visibility = ?');
      params.push(visibility);
    }

    if (updates.length > 0) {
      params.push(postId);
      await query(`UPDATE posts SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    return this.getPostById(postId, userId);
  }

  async deletePost(postId, userId, userRole = 'USER') {
    const [rows] = await query('SELECT user_id FROM posts WHERE id = ?', [postId]);
    if (rows.length === 0) throw new Error('Post not found.');

    if (Number(rows[0].user_id) !== Number(userId) && userRole !== 'ADMIN') {
      throw new Error('Unauthorized: You can only delete your own posts.');
    }

    await query('DELETE FROM posts WHERE id = ?', [postId]);
    return { success: true, message: 'Post deleted successfully.' };
  }

  async toggleSavePost(userId, postId) {
    const [existing] = await query('SELECT id FROM saved_posts WHERE user_id = ? AND post_id = ?', [userId, postId]);
    if (existing.length > 0) {
      await query('DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?', [userId, postId]);
      return { is_saved: false, message: 'Post removed from saved.' };
    } else {
      await query('INSERT INTO saved_posts (user_id, post_id) VALUES (?, ?)', [userId, postId]);
      return { is_saved: true, message: 'Post saved.' };
    }
  }

  async reportPost(reporterId, postId, reason, details) {
    await query(
      'INSERT INTO reports (reporter_id, reported_post_id, reason, details) VALUES (?, ?, ?, ?)',
      [reporterId, postId, reason || 'INAPPROPRIATE', details || '']
    );
    return { success: true, message: 'Report submitted for review.' };
  }
}

module.exports = new PostService();
