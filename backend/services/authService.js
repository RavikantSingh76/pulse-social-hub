const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { generateToken } = require('../config/jwt');

class AuthService {
  async register({ username, email, password, display_name }) {
    if (!username || !email || !password || !display_name) {
      throw new Error('All registration fields (username, email, password, display_name) are required.');
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
    if (cleanUsername.length < 3) {
      throw new Error('Username must be at least 3 characters long and alphanumeric.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    // Check existing
    const [existing] = await query('SELECT id, username, email FROM users WHERE username = ? OR email = ?', [cleanUsername, email.trim().toLowerCase()]);
    if (existing.length > 0) {
      if (existing[0].username === cleanUsername) {
        throw new Error('Username is already taken.');
      }
      throw new Error('An account with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`;

    const [result] = await query(
      `INSERT INTO users (username, email, password_hash, display_name, avatar_url, role, is_private)
       VALUES (?, ?, ?, ?, ?, 'USER', 0)`,
      [cleanUsername, email.trim().toLowerCase(), password_hash, display_name.trim(), defaultAvatar]
    );

    const user = {
      id: result.insertId,
      username: cleanUsername,
      email: email.trim().toLowerCase(),
      display_name: display_name.trim(),
      avatar_url: defaultAvatar,
      cover_url: null,
      bio: null,
      role: 'USER',
      is_private: 0
    };

    const token = generateToken({ id: user.id, username: user.username, role: user.role });
    return { user, token };
  }

  async login({ identifier, password }) {
    if (!identifier || !password) {
      throw new Error('Please provide your username/email and password.');
    }

    const idClean = identifier.trim().toLowerCase();
    const [rows] = await query(
      'SELECT id, username, email, password_hash, display_name, avatar_url, cover_url, bio, website, role, is_private, is_suspended FROM users WHERE username = ? OR email = ?',
      [idClean, idClean]
    );

    if (rows.length === 0) {
      throw new Error('Invalid credentials. User does not exist.');
    }

    const user = rows[0];

    if (user.is_suspended) {
      throw new Error('This account has been suspended by platform administration.');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid credentials. Incorrect password.');
    }

    delete user.password_hash;
    const token = generateToken({ id: user.id, username: user.username, role: user.role });
    return { user, token };
  }

  async getMe(userId) {
    const [rows] = await query(
      `SELECT u.id, u.username, u.email, u.display_name, u.avatar_url, u.cover_url, u.bio, u.website, u.role, u.is_private, u.created_at,
              (SELECT COUNT(*) FROM follows WHERE following_id = u.id AND status = 'ACCEPTED') AS followers_count,
              (SELECT COUNT(*) FROM follows WHERE follower_id = u.id AND status = 'ACCEPTED') AS following_count,
              (SELECT COUNT(*) FROM posts WHERE user_id = u.id) AS posts_count,
              (SELECT COUNT(*) FROM notifications WHERE recipient_id = u.id AND is_read = 0) AS unread_notifications_count,
              (SELECT COUNT(DISTINCT m.conversation_id) 
               FROM messages m 
               JOIN conversation_members cm ON cm.conversation_id = m.conversation_id 
               WHERE cm.user_id = u.id AND m.sender_id != u.id AND m.is_read = 0) AS unread_messages_count
       FROM users u WHERE u.id = ?`,
      [userId]
    );

    if (rows.length === 0) throw new Error('User not found.');
    return rows[0];
  }
}

module.exports = new AuthService();
