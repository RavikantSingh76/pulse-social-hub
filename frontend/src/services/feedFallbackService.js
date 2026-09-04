// Guaranteed high-definition fallback posts with working video and image streams

export const FALLBACK_FEED_POSTS = [
  {
    id: 'f_vid_1',
    userId: 1,
    username: 'ravikant',
    displayName: 'Ravikant Singh',
    avatarUrl: '/uploads/ravikant_avatar.jpg',
    isVerified: true,
    visibility: 'PUBLIC',
    caption: 'Building high-throughput real-time video compositing and Web Audio synthesizers on Pulse Studio! ⚡ Sub-10ms response times #springboot #react #developer #systemdesign',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    likesCount: 3420,
    commentsCount: 142,
    sharesCount: 89,
    isLiked: false,
    isSaved: false,
    currentReaction: null,
    media: [
      {
        id: 'm_v1',
        type: 'VIDEO',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-coding-on-a-laptop-in-a-dark-room-41885-large.mp4',
        thumbnailUrl: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800'
      }
    ]
  },
  {
    id: 'f_vid_2',
    userId: 2,
    username: 'aarav.sharma',
    displayName: 'Aarav Sharma',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=aarav.sharma',
    isVerified: true,
    visibility: 'PUBLIC',
    caption: 'Late night city lights and distributed systems debugging across microservices in Bengaluru 🌃 #tech #city #nightlights #engineering',
    createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    likesCount: 2890,
    commentsCount: 96,
    sharesCount: 54,
    isLiked: false,
    isSaved: false,
    currentReaction: null,
    media: [
      {
        id: 'm_v2',
        type: 'VIDEO',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-city-traffic-at-night-42261-large.mp4',
        thumbnailUrl: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800'
      }
    ]
  },
  {
    id: 'f_img_1',
    userId: 3,
    username: 'ananya.verma',
    displayName: 'Ananya Verma',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ananya.verma',
    isVerified: true,
    visibility: 'PUBLIC',
    caption: 'Clean workspace setup, hot espresso, and shipping high-concurrency features on Pulse! What are you building today? ☕💻 #productivity #developer #workspace',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    likesCount: 1940,
    commentsCount: 78,
    sharesCount: 32,
    isLiked: false,
    isSaved: false,
    currentReaction: null,
    media: [
      {
        id: 'm_img1',
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    id: 'f_vid_3',
    userId: 4,
    username: 'shreya.acoustic',
    displayName: 'Shreya Collective',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=shreya.acoustic',
    isVerified: true,
    visibility: 'PUBLIC',
    caption: 'Sunset waves on the western coastline 🌊 Live acoustic sessions with Bansuri and Lo-fi beat sync #music #acoustic #sunset #peace',
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    likesCount: 4210,
    commentsCount: 185,
    sharesCount: 120,
    isLiked: false,
    isSaved: false,
    currentReaction: null,
    media: [
      {
        id: 'm_v3',
        type: 'VIDEO',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-sun-setting-over-the-ocean-horizon-41571-large.mp4',
        thumbnailUrl: 'https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=800'
      }
    ]
  },
  {
    id: 'f_vid_4',
    userId: 5,
    username: 'patna.beats',
    displayName: 'Bhojpuri Electro Lab',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=patna.beats',
    isVerified: true,
    visibility: 'PUBLIC',
    caption: 'High-energy Bhojpuri Dholak Electro Fusion beats producing in Varanasi Studio 🪘✨ #bhojpuri #electro #folk #musicproduction',
    createdAt: new Date(Date.now() - 1000 * 60 * 450).toISOString(),
    likesCount: 5630,
    commentsCount: 310,
    sharesCount: 240,
    isLiked: false,
    isSaved: false,
    currentReaction: null,
    media: [
      {
        id: 'm_v4',
        type: 'VIDEO',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-hands-typing-on-a-laptop-keyboard-41589-large.mp4',
        thumbnailUrl: 'https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=800'
      }
    ]
  }
];

export const feedFallbackService = {
  getFallbackPosts(feedType = 'FOR_YOU') {
    if (feedType === 'VIDEOS') {
      return FALLBACK_FEED_POSTS.filter(p => p.media?.some(m => m.type === 'VIDEO'));
    }
    if (feedType === 'PHOTOS') {
      return FALLBACK_FEED_POSTS.filter(p => p.media?.some(m => m.type === 'IMAGE'));
    }
    return FALLBACK_FEED_POSTS;
  }
};
