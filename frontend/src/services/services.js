import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post(`/auth/forgot-password?email=${encodeURIComponent(email)}`),
  resetPassword: (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword })
};

export const userService = {
  getProfile: (username) => api.get(`/users/profile/${username}`),
  updateProfile: (data) => api.put('/users/profile', data),
  searchUsers: (query, limit = 5) => api.get(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`),
  getSuggestions: (limit = 5) => api.get(`/users/suggestions?limit=${limit}`),
  followUser: (id) => api.post(`/users/${id}/follow`),
  unfollowUser: (id) => api.delete(`/users/${id}/follow`),
  getFollowers: (id) => api.get(`/users/${id}/followers`),
  getFollowing: (id) => api.get(`/users/${id}/following`),
  getFollowRequests: () => api.get('/users/requests'),
  acceptRequest: (requesterId) => api.post(`/users/requests/${requesterId}/accept`),
  rejectRequest: (requesterId) => api.delete(`/users/requests/${requesterId}/reject`),
  blockUser: (id) => api.post(`/users/${id}/block`),
  unblockUser: (id) => api.delete(`/users/${id}/block`),
  getMutualFollowers: (id) => api.get(`/users/${id}/mutual`)
};

export const postService = {
  getFeed: (type = 'FOR_YOU', page = 1, limit = 10) => api.get(`/posts/feed?type=${type}&page=${page}&limit=${limit}`),
  getExplore: (page = 1, limit = 20) => api.get(`/posts/explore?page=${page}&limit=${limit}`),
  getReels: (page = 1, limit = 12) => api.get(`/posts/reels?page=${page}&limit=${limit}`),
  getHashtagPosts: (tag, page = 1, limit = 20) => api.get(`/posts/hashtag/${tag}?page=${page}&limit=${limit}`),
  getUserPosts: (username, tab = 'posts', page = 1, limit = 20) => api.get(`/posts/user/${username}?tab=${tab}&page=${page}&limit=${limit}`),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (data) => api.post('/posts', data),
  createPostWithMedia: (formData) => api.post('/posts/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deletePost: (id) => api.delete(`/posts/${id}`),
  toggleLike: (id) => api.post(`/posts/${id}/like`),
  toggleReaction: (id, reactionType) => api.post(`/posts/${id}/reactions`, { reactionType }),
  toggleSave: (id, collectionId = null) => api.post(`/posts/${id}/save${collectionId ? `?collectionId=${collectionId}` : ''}`),
  markNotInterested: (id, reason = 'Not relevant') => api.post(`/posts/${id}/not-interested?reason=${encodeURIComponent(reason)}`),
  getComments: (postId) => api.get(`/posts/${postId}/comments`),
  addComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  createComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  deleteComment: (postId, commentId) => api.delete(`/comments/${commentId}`),
  toggleCommentLike: (commentId) => api.post(`/comments/${commentId}/like`),
  reportPost: (id, data) => api.post(`/posts/${id}/report`),
  getCollections: () => api.get('/posts/collections'),
  createCollection: (data) => api.post('/posts/collections', data),
  deleteCollection: (id) => api.delete(`/posts/collections/${id}`)
};

export const storyService = {
  getActiveStories: () => api.get('/stories'),
  createStory: (formData) => api.post('/stories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  createTextStory: (data) => api.post('/stories/text', data),
  recordView: (id) => api.post(`/stories/${id}/view`),
  reactToStory: (id, emoji) => api.post(`/stories/${id}/react?emoji=${encodeURIComponent(emoji)}`),
  replyToStory: (id, text) => api.post(`/stories/${id}/reply`, { text }),
  getHighlights: (username) => api.get(`/stories/highlights/${username}`),
  getUserHighlights: (username) => api.get(`/stories/highlights/${username}`),
  createHighlight: (data) => api.post('/stories/highlights', data),
  deleteHighlight: (id) => api.delete(`/stories/highlights/${id}`)
};

export const messageService = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId) => api.get(`/messages/${conversationId}`),
  sendMessage: (data) => api.post('/messages', data),
  sendMessageWithMedia: (formData) => api.post('/messages/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  reactToMessage: (messageId, reactionType) => api.post(`/messages/${messageId}/reactions`, { reactionType }),
  deleteForEveryone: (messageId) => api.delete(`/messages/${messageId}/everyone`),
  searchMessages: (conversationId, query) => api.get(`/messages/${conversationId}/search?q=${encodeURIComponent(query)}`),
  createGroup: (data) => api.post('/messages/groups', data),
  addMemberToGroup: (convId, memberId) => api.post(`/messages/groups/${convId}/members/${memberId}`),
  leaveGroup: (convId) => api.delete(`/messages/groups/${convId}/leave`)
};

export const searchService = {
  search: (query, tab = 'all', page = 1, limit = 20) => api.get(`/search?q=${encodeURIComponent(query)}&tab=${tab}&page=${page}&limit=${limit}`),
  clearHistory: () => api.delete('/search/history'),
  getSuggestedUsers: (limit = 5) => api.get(`/search/suggested?limit=${limit}`)
};

export const hashtagService = {
  getDetail: (tag) => api.get(`/hashtags/${tag}`),
  followHashtag: (tag) => api.post(`/hashtags/${tag}/follow`),
  unfollowHashtag: (tag) => api.delete(`/hashtags/${tag}/follow`)
};

export const closeFriendService = {
  getCloseFriends: () => api.get('/close-friends'),
  addCloseFriend: (friendId) => api.post(`/close-friends/${friendId}`),
  removeCloseFriend: (friendId) => api.delete(`/close-friends/${friendId}`)
};

export const creatorStudioService = {
  getOverview: () => api.get('/creator/studio')
};

export const settingsService = {
  updatePrivacy: (data) => api.put('/settings/privacy', data),
  changePassword: (data) => api.post('/settings/change-password', data),
  getActivity: () => api.get('/settings/activity')
};

export const analyticsService = {
  getCreatorAnalytics: (username) => api.get(`/analytics/creator/${username}`)
};

export const notificationService = {
  getNotifications: (page = 1, limit = 20) => api.get(`/notifications?page=${page}&limit=${limit}`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data) => api.put('/notifications/preferences', data)
};

export const reelService = {
  getReels: (page = 1, limit = 10) => api.get(`/reels?page=${page}&limit=${limit}`),
  getReel: (id) => api.get(`/reels/${id}`),
  createReel: (formData, onUploadProgress) => api.post('/reels', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  }),
  updateReel: (id, data) => api.put(`/reels/${id}`, data),
  deleteReel: (id) => api.delete(`/reels/${id}`),
  recordView: (id) => api.post(`/reels/${id}/view`),
  toggleLike: (id) => api.post(`/reels/${id}/like`)
};

export const audioService = {
  getAudioList: (page = 1, limit = 20) => api.get(`/audio?page=${page}&limit=${limit}`),
  searchAudio: (query, page = 1, limit = 20) => api.get(`/audio/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`),
  getTrendingAudio: (page = 1, limit = 20) => api.get(`/audio/trending?page=${page}&limit=${limit}`),
  getRecentAudio: (page = 1, limit = 20) => api.get(`/audio/recent?page=${page}&limit=${limit}`),
  getAudio: (id) => api.get(`/audio/${id}`),
  uploadAudio: (formData) => api.post('/audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAudio: (id) => api.delete(`/audio/${id}`)
};

export const playlistService = {
  getPlaylists: (userId, page = 1, limit = 20) => api.get(`/playlists?${userId ? `user_id=${userId}&` : ''}page=${page}&limit=${limit}`),
  getPlaylist: (id) => api.get(`/playlists/${id}`),
  createPlaylist: (data) => api.post('/playlists', data),
  updatePlaylist: (id, data) => api.put(`/playlists/${id}`, data),
  deletePlaylist: (id) => api.delete(`/playlists/${id}`),
  addVideos: (playlistId, videoIds, videoId) => api.post(`/playlists/${playlistId}/videos`, { videoIds, videoId }),
  removeVideo: (playlistId, videoId) => api.delete(`/playlists/${playlistId}/videos/${videoId}`),
  reorderVideos: (playlistId, videoIds) => api.put(`/playlists/${playlistId}/videos/reorder`, { videoIds })
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  listUsers: (page = 1, limit = 30) => api.get(`/admin/users?page=${page}&limit=${limit}`),
  listPosts: (page = 1, limit = 30) => api.get(`/admin/posts?page=${page}&limit=${limit}`),
  listReports: (status = 'PENDING') => api.get(`/admin/reports?status=${status}`),
  toggleUserStatus: (userId) => api.put(`/admin/users/${userId}/toggle-status`),
  verifyUser: (userId, isVerified) => api.put(`/admin/users/${userId}/verify`, { isVerified }),
  warnUser: (userId, message) => api.post(`/admin/users/${userId}/warn`, { message }),
  resolveReport: (reportId, status) => api.put(`/admin/reports/${reportId}`, { status }),
  deletePost: (postId) => api.delete(`/admin/posts/${postId}`)
};

export default api;
