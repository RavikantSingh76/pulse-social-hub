const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/profile/:username', optionalAuth, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.post('/avatar', protect, upload.single('avatar'), userController.uploadAvatar);
router.post('/cover', protect, upload.single('cover'), userController.uploadCover);

router.get('/search', optionalAuth, userController.searchUsers);
router.get('/suggestions', protect, userController.getSuggestions);
router.get('/requests', protect, userController.getFollowRequests);

router.post('/:id/follow', protect, userController.follow);
router.delete('/:id/follow', protect, userController.unfollow);
router.post('/requests/:requesterId/accept', protect, userController.acceptRequest);
router.delete('/requests/:requesterId/reject', protect, userController.rejectRequest);

router.get('/:id/followers', optionalAuth, userController.getFollowers);
router.get('/:id/following', optionalAuth, userController.getFollowing);

router.post('/:id/block', protect, userController.blockUser);
router.delete('/:id/block', protect, userController.unblockUser);

module.exports = router;
