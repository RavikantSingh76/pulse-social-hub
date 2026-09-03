const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const { username, email, password, display_name } = req.body;
      const result = await authService.register({ username, email, password, display_name });
      return res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        data: result
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async login(req, res, next) {
    try {
      const { identifier, password } = req.body;
      const result = await authService.login({ identifier, password });
      return res.status(200).json({
        success: true,
        message: 'Welcome back!',
        data: result
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user.id);
      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new AuthController();
