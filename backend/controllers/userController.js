const userService = require('../services/userService');

class UserController {
  async getProfile(req, res, next) {
    try {
      const { username } = req.params;
      const currentUserId = req.user ? req.user.id : null;
      const profile = await userService.getProfileByUsername(username, currentUserId);
      return res.status(200).json({ success: true, data: profile });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }

  async updateProfile(req, res, next) {
    try {
      const updated = await userService.updateProfile(req.user.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully!',
        data: updated
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async uploadAvatar(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file uploaded.' });
      }
      const avatarUrl = `/uploads/${req.file.filename}`;
      const updated = await userService.updateProfile(req.user.id, { avatar_url: avatarUrl });
      return res.status(200).json({
        success: true,
        message: 'Avatar updated successfully!',
        data: { avatar_url: avatarUrl, user: updated }
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async uploadCover(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file uploaded.' });
      }
      const coverUrl = `/uploads/${req.file.filename}`;
      const updated = await userService.updateProfile(req.user.id, { cover_url: coverUrl });
      return res.status(200).json({
        success: true,
        message: 'Cover photo updated successfully!',
        data: { cover_url: coverUrl, user: updated }
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async follow(req, res, next) {
    try {
      const { id } = req.params;
      const result = await userService.followUser(req.user.id, id);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async unfollow(req, res, next) {
    try {
      const { id } = req.params;
      const result = await userService.unfollowUser(req.user.id, id);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async getFollowers(req, res, next) {
    try {
      const { id } = req.params;
      const currentUserId = req.user ? req.user.id : null;
      const followers = await userService.getFollowers(id, currentUserId);
      return res.status(200).json({ success: true, data: followers });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async getFollowing(req, res, next) {
    try {
      const { id } = req.params;
      const currentUserId = req.user ? req.user.id : null;
      const following = await userService.getFollowing(id, currentUserId);
      return res.status(200).json({ success: true, data: following });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async getFollowRequests(req, res, next) {
    try {
      const requests = await userService.getFollowRequests(req.user.id);
      return res.status(200).json({ success: true, data: requests });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async acceptRequest(req, res, next) {
    try {
      const { requesterId } = req.params;
      const result = await userService.acceptFollowRequest(req.user.id, requesterId);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async rejectRequest(req, res, next) {
    try {
      const { requesterId } = req.params;
      const result = await userService.rejectFollowRequest(req.user.id, requesterId);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async searchUsers(req, res, next) {
    try {
      const { q, limit } = req.query;
      const currentUserId = req.user ? req.user.id : null;
      const users = await userService.searchUsers(q, currentUserId, limit || 20);
      return res.status(200).json({ success: true, data: users });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async getSuggestions(req, res, next) {
    try {
      const limit = req.query.limit || 5;
      const suggestions = await userService.getSuggestions(req.user.id, limit);
      return res.status(200).json({ success: true, data: suggestions });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async blockUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await userService.blockUser(req.user.id, id);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async unblockUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await userService.unblockUser(req.user.id, id);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new UserController();
