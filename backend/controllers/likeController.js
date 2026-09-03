const { query } = require('../config/db');

class LikeController {
  async toggleLikePost(req, res, next) {
    try {
      const { id: postId } = req.params;
      const userId = req.user.id;

      // Check if post exists
      const [postRows] = await query('SELECT id, user_id FROM posts WHERE id = ?', [postId]);
      if (postRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Post not found.' });
      }

      const postAuthorId = postRows[0].user_id;

      // Check existing like
      const [existing] = await query('SELECT id FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId]);
      let isLiked = false;

      if (existing.length > 0) {
        await query('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId]);
        isLiked = false;
      } else {
        await query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userId, postId]);
        isLiked = true;

        // Send notification if not liking own post
        if (Number(postAuthorId) !== Number(userId)) {
          await query(
            'INSERT INTO notifications (recipient_id, actor_id, type, entity_id, entity_type, message) VALUES (?, ?, "LIKE", ?, "POST", "liked your post.")',
            [postAuthorId, userId, postId]
          );
        }
      }

      // Count new likes
      const [countRows] = await query('SELECT COUNT(*) AS count FROM likes WHERE post_id = ?', [postId]);
      const likesCount = countRows[0].count;

      return res.status(200).json({
        success: true,
        data: {
          is_liked: isLiked,
          likes_count: likesCount,
          post_id: Number(postId)
        }
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async getPostLikes(req, res, next) {
    try {
      const { id: postId } = req.params;
      const currentUserId = req.user ? req.user.id : null;

      const [rows] = await query(
        `SELECT u.id, u.username, u.display_name, u.avatar_url, u.bio,
                (SELECT status FROM follows WHERE follower_id = ? AND following_id = u.id) AS my_follow_status
         FROM likes l
         JOIN users u ON u.id = l.user_id
         WHERE l.post_id = ? AND u.is_suspended = 0
         ORDER BY l.created_at DESC`,
        [currentUserId || 0, postId]
      );

      return res.status(200).json({ success: true, data: rows });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new LikeController();
