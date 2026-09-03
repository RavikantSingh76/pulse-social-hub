const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const { protect, optionalAuth } = require('../middleware/auth');

router.post('/:id/like', protect, likeController.toggleLikePost);
router.get('/:id/likes', optionalAuth, likeController.getPostLikes);

module.exports = router;
