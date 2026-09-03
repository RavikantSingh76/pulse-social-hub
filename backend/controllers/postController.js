const postService = require('../services/postService');

class PostController {
  async createPost(req, res, next) {
    try {
      const { caption, visibility, post_type, title } = req.body;
      let mediaItems = [];

      // If media files uploaded via Multer
      if (req.files && req.files.length > 0) {
        mediaItems = req.files.map(file => ({
          url: `/uploads/${file.filename}`,
          type: file.mimetype.startsWith('video') ? 'VIDEO' : 'IMAGE'
        }));
      } else if (req.body.media_url) {
        // Direct media URL provided (e.g. video / external link)
        mediaItems = [{
          url: req.body.media_url,
          type: req.body.media_type || (req.body.media_url.endsWith('.mp4') ? 'VIDEO' : 'IMAGE')
        }];
      }

      const post = await postService.createPost(req.user.id, {
        caption,
        visibility: visibility || 'PUBLIC',
        post_type: post_type || (mediaItems.some(m => m.type === 'VIDEO') ? 'VIDEO' : 'POST'),
        title,
        mediaItems
      });

      return res.status(201).json({
        success: true,
        message: 'Post created successfully!',
        data: post
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async getFeed(req, res, next) {
    try {
      const { page, limit } = req.query;
      const currentUserId = req.user ? req.user.id : null;
      const feed = await postService.getFeed(currentUserId, page || 1, limit || 10);
      return res.status(200).json({ success: true, data: feed });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async getPostById(req, res, next) {
    try {
      const { id } = req.params;
      const currentUserId = req.user ? req.user.id : null;
      const post = await postService.getPostById(id, currentUserId);
      return res.status(200).json({ success: true, data: post });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }

  async getUserPosts(req, res, next) {
    try {
      const { username } = req.params;
      const { tab, page, limit } = req.query;
      const currentUserId = req.user ? req.user.id : null;
      const result = await postService.getUserPosts(username, currentUserId, tab || 'posts', page || 1, limit || 12);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async getExplorePosts(req, res, next) {
    try {
      const { page, limit } = req.query;
      const currentUserId = req.user ? req.user.id : null;
      const explore = await postService.getExplorePosts(currentUserId, page || 1, limit || 18);
      return res.status(200).json({ success: true, data: explore });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async getHashtagPosts(req, res, next) {
    try {
      const { tag } = req.params;
      const { page, limit } = req.query;
      const currentUserId = req.user ? req.user.id : null;
      const result = await postService.getHashtagPosts(tag, currentUserId, page || 1, limit || 18);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async updatePost(req, res, next) {
    try {
      const { id } = req.params;
      const { caption, visibility } = req.body;
      const updated = await postService.updatePost(id, req.user.id, { caption, visibility });
      return res.status(200).json({
        success: true,
        message: 'Post updated successfully.',
        data: updated
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async deletePost(req, res, next) {
    try {
      const { id } = req.params;
      const result = await postService.deletePost(id, req.user.id, req.user.role);
      return res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async toggleSave(req, res, next) {
    try {
      const { id } = req.params;
      const result = await postService.toggleSavePost(req.user.id, id);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async reportPost(req, res, next) {
    try {
      const { id } = req.params;
      const { reason, details } = req.body;
      const result = await postService.reportPost(req.user.id, id, reason, details);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new PostController();
