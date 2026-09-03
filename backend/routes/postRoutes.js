const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, upload.array('media', 10), postController.createPost);
router.get('/feed', optionalAuth, postController.getFeed);
router.get('/explore', optionalAuth, postController.getExplorePosts);
router.get('/hashtags/:tag', optionalAuth, postController.getHashtagPosts);
router.get('/user/:username', optionalAuth, postController.getUserPosts);

router.get('/:id', optionalAuth, postController.getPostById);
router.put('/:id', protect, postController.updatePost);
router.delete('/:id', protect, postController.deletePost);

router.post('/:id/save', protect, postController.toggleSave);
router.post('/:id/report', protect, postController.reportPost);

module.exports = router;
