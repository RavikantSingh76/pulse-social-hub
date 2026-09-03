const { verifyToken } = require('../config/jwt');
const { query } = require('../config/db');

// Protect routes for logged in users
const protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid Bearer token.'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token.'
      });
    }

    const [rows] = await query('SELECT id, username, email, display_name, avatar_url, role, is_private, is_suspended FROM users WHERE id = ?', [decoded.id]);
    
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or removed.'
      });
    }

    const user = rows[0];

    if (user.is_suspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by platform administration.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication processing error.',
      error: error.message
    });
  }
};

// Optional auth (for public feeds where personalization like is_liked is enabled if logged in)
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        const [rows] = await query('SELECT id, username, email, display_name, avatar_url, role, is_private, is_suspended FROM users WHERE id = ?', [decoded.id]);
        if (rows.length > 0 && !rows[0].is_suspended) {
          req.user = rows[0];
        }
      }
    }
  } catch (err) {
    // Proceed as unauthenticated
  }
  next();
};

// Admin only authorization
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Platform Administrator privileges required.'
    });
  }
  next();
};

module.exports = {
  protect,
  optionalAuth,
  adminOnly
};
