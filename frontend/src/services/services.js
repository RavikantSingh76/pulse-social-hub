import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

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
  getMe: () => api.get('/auth/me')
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
  getReels: (page = 1, limit = 10) => api.get(`/reels?page=${page}&limit=${limit}`),
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
  deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`),
  reportPost: (id, data) => api.post(`/posts/${id}/report`, data),
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
  deleteStory: (id) => api.delete(`/stories/${id}`),
  getHighlights: (username) => api.get(`/stories/highlights/${username}`),
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

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  listUsers: (page = 1, limit = 30) => api.get(`/admin/users?page=${page}&limit=${limit}`),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  verifyUser: (id, verified = true) => api.put(`/admin/users/${id}/verify?verified=${verified}`),
  warnUser: (id, message) => api.post(`/admin/users/${id}/warn`, { message }),
  listPosts: (page = 1, limit = 30) => api.get(`/admin/posts?page=${page}&limit=${limit}`),
  listReports: (status = 'PENDING') => api.get(`/admin/reports?status=${status}`),
  resolveReport: (id, status) => api.put(`/admin/reports/${id}/resolve`, { status })
};

export default api;
