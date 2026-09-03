const { query } = require('../config/db');

class CommentService {
  async getCommentsByPostId(postId, currentUserId = null) {
    const [rows] = await query(
      `SELECT c.id, c.post_id, c.user_id, c.parent_id, c.content, c.created_at, c.updated_at,
              u.username, u.display_name, u.avatar_url,
              (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) AS likes_count,
              (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id AND user_id = ?) AS is_liked
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.post_id = ? AND u.is_suspended = 0
       ORDER BY c.created_at ASC`,
      [currentUserId || 0, postId]
    );

    const commentMap = {};
    const rootComments = [];

    // First pass: instantiate comment items with empty replies
    for (const r of rows) {
      r.is_liked = Boolean(r.is_liked);
      r.replies = [];
      commentMap[r.id] = r;
    }

    // Second pass: nest replies into parents
    for (const r of rows) {
      if (r.parent_id && commentMap[r.parent_id]) {
        commentMap[r.parent_id].replies.push(r);
      } else if (!r.parent_id) {
        rootComments.push(r);
      }
    }

    return rootComments;
  }

  async createComment(userId, postId, content, parentId = null) {
    if (!content || !content.trim()) {
      throw new Error('Comment content cannot be empty.');
    }

    // Validate post
    const [postRows] = await query('SELECT id, user_id FROM posts WHERE id = ?', [postId]);
    if (postRows.length === 0) throw new Error('Post not found.');
    const postOwnerId = postRows[0].user_id;

    // Validate parent comment if provided
    let parentCommentOwnerId = null;
    if (parentId) {
      const [parentRows] = await query('SELECT id, user_id FROM comments WHERE id = ? AND post_id = ?', [parentId, postId]);
      if (parentRows.length === 0) throw new Error('Parent comment not found.');
      parentCommentOwnerId = parentRows[0].user_id;
    }

    const [res] = await query(
      `INSERT INTO comments (post_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)`,
      [postId, userId, parentId || null, content.trim()]
    );
    const commentId = res.insertId;

    // Send Notification
    if (parentId && parentCommentOwnerId && Number(parentCommentOwnerId) !== Number(userId)) {
      await query(
        'INSERT INTO notifications (recipient_id, actor_id, type, entity_id, entity_type, message) VALUES (?, ?, "REPLY", ?, "POST", "replied to your comment.")',
        [parentCommentOwnerId, userId, postId]
      );
    } else if (Number(postOwnerId) !== Number(userId)) {
      await query(
        'INSERT INTO notifications (recipient_id, actor_id, type, entity_id, entity_type, message) VALUES (?, ?, "COMMENT", ?, "POST", "commented on your post.")',
        [postOwnerId, userId, postId]
      );
    }

    // Fetch created comment
    const [createdRows] = await query(
      `SELECT c.id, c.post_id, c.user_id, c.parent_id, c.content, c.created_at,
              u.username, u.display_name, u.avatar_url,
              0 AS likes_count, 0 AS is_liked
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.id = ?`,
      [commentId]
    );

    const newComment = createdRows[0];
    newComment.replies = [];
    newComment.is_liked = false;
    return newComment;
  }

  async deleteComment(commentId, userId, userRole = 'USER') {
    const [rows] = await query(
      `SELECT c.id, c.user_id, p.user_id AS post_author_id
       FROM comments c
       JOIN posts p ON p.id = c.post_id
       WHERE c.id = ?`,
      [commentId]
    );

    if (rows.length === 0) throw new Error('Comment not found.');

    const isCommentAuthor = Number(rows[0].user_id) === Number(userId);
    const isPostAuthor = Number(rows[0].post_author_id) === Number(userId);
    const isAdmin = userRole === 'ADMIN';

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      throw new Error('Unauthorized to delete this comment.');
    }

    await query('DELETE FROM comments WHERE id = ?', [commentId]);
    return { success: true, message: 'Comment deleted.' };
  }

  async toggleCommentLike(userId, commentId) {
    const [existing] = await query('SELECT id FROM comment_likes WHERE user_id = ? AND comment_id = ?', [userId, commentId]);
    let isLiked = false;

    if (existing.length > 0) {
      await query('DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?', [userId, commentId]);
      isLiked = false;
    } else {
      await query('INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)', [userId, commentId]);
      isLiked = true;
    }

    const [countRows] = await query('SELECT COUNT(*) AS count FROM comment_likes WHERE comment_id = ?', [commentId]);
    return { is_liked: isLiked, likes_count: countRows[0].count, comment_id: Number(commentId) };
  }
}

module.exports = new CommentService();
