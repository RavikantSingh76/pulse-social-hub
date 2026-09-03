// Music Library Service with Hindi, Bhojpuri, Trending, Romantic, Sad, Party, Devotional, Lo-fi & Instrumental tracks

export const MUSIC_CATEGORIES = [
  { id: 'all', name: '🔥 All Tracks', badge: 'All' },
  { id: 'hindi', name: '🎵 Hindi', badge: 'Hindi' },
  { id: 'bhojpuri', name: '🪘 Bhojpuri', badge: 'Bhojpuri' },
  { id: 'trending', name: '⚡ Trending', badge: 'Trending' },
  { id: 'romantic', name: '❤️ Romantic', badge: 'Romantic' },
  { id: 'sad', name: '🌧️ Sad', badge: 'Sad' },
  { id: 'party', name: '🎉 Party', badge: 'Party' },
  { id: 'devotional', name: '🕉️ Devotional', badge: 'Devotional' },
  { id: 'lofi', name: '☕ Lo-fi', badge: 'Lo-fi' },
  { id: 'instrumental', name: '🎻 Instrumental', badge: 'Instrumental' }
];

export const COMPREHENSIVE_MUSIC_LIBRARY = [
  // 1. HINDI
  {
    id: 'hi_1',
    title: 'Dil Se Desi (Acoustic Folk)',
    artist: 'Kabir & Shreya Collective',
    category: 'hindi',
    genre: 'Hindi Acoustic',
    duration: 132,
    bpm: 88,
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
    coverUrl: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: ['hindi', 'acoustic', 'bollywood', 'warm', 'romantic']
  },
  {
    id: 'hi_2',
    title: 'Banaras Ki Galiyan (Sitar & Beats)',
    artist: 'Ustad Ravi & Pulse Studio',
    category: 'hindi',
    genre: 'Hindi Fusion',
    duration: 140,
    bpm: 96,
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-delightful-4.mp3',
    coverUrl: 'https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: ['hindi', 'sitar', 'banaras', 'fusion', 'instrumental']
  },
  {
    id: 'hi_3',
    title: 'Raat Baki (Midnight Hindi Lofi)',
    artist: 'Pulse Hindi Lofi Lab',
    category: 'hindi',
    genre: 'Hindi Lo-Fi',
    duration: 125,
    bpm: 82,
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-hollidays-690.mp3',
    coverUrl: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: ['hindi', 'lofi', 'chill', 'night', 'coding']
  },

  // 2. BHOJPURI
  {
    id: 'bh_1',
    title: 'Bhojpuriya Dholak Groove (Electro Folk)',
    artist: 'Dehati Dholak Masters',
    category: 'bhojpuri',
    genre: 'Bhojpuri Folk EDM',
    duration: 118,
    bpm: 126,
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
    coverUrl: 'https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: ['bhojpuri', 'dholak', 'party', 'folk', 'dance']
  },
  {
    id: 'bh_2',
    title: 'Patna Se Chapra Express (Festival Beat)',
    artist: 'Bhojpuri Beats Network',
    category: 'bhojpuri',
    genre: 'Bhojpuri Celebration',
    duration: 105,
    bpm: 130,
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-game-level-music-689.mp3',
    coverUrl: 'https://images.pexels.com/photos/2603464/pexels-photo-2603464.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: ['bhojpuri', 'celebration', 'party', 'energy', 'patna']
  },
  {
    id: 'bh_3',
    title: 'Ganga Kinare Shehnai & Flute',
    artist: 'Varanasi Folk Ensemble',
    category: 'bhojpuri',
    genre: 'Bhojpuri Traditional',
    duration: 148,
    bpm: 76,
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
    coverUrl: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: ['bhojpuri', 'traditional', 'shehnai', 'flute', 'ganga']
  },

  // 3. TRENDING
  {
    id: 'tr_1',
    title: 'Neon Cyberpunk Lofi Master',
    artist: 'Pulse Original Master',
    category: 'trending',
    genre: 'Cyberpunk',
    duration: 120,
    bpm: 90,
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
    coverUrl: 'https://images.pexels.com/photos/2603464/pexels-photo-2603464.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: ['trending', 'cyberpunk', 'viral', 'synthwave']
  },
  {
    id: 'tr_2',
    title: 'Future Bass Rush (Viral Drop)',
    artist: 'Neon Synthetics',
    category: 'trending',
    genre: 'EDM / Bass',
    duration: 98,
    bpm: 128,
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-game-level-music-689.mp3',
    coverUrl: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: ['trending', 'edm', 'bass', 'drop', 'energy']
  },

  // 4. ROMANTIC
  {
    id: 'ro_1',
    title: 'Marine Drive Sunset Romance',
    artist: 'Acoustic Soul',
    category: 'romantic',
    genre: 'Acoustic Love',
    duration: 135,
    bpm: 78,
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
    coverUrl: 'https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: ['romantic', 'love', 'sunset', 'acoustic', 'chill']
  },
  {
    id: 'ro_2',
    title: 'Pehli Nazar (Soulful Piano)',
    artist: 'Aman Kapoor Melody',
    category: 'romantic',
    genre: 'Piano Romance',
    duration: 122,
    bpm: 75,
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-hollidays-690.mp3',
    coverUrl: 'https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: ['romantic', 'piano', 'soulful', 'slow']
  },

  // 5. SAD / EMOTIONAL
  {
    id: 'sd_1',
    title: 'Alvida (Melancholic Cello & Rain)',
    artist: 'Nostalgia Soundscapes',
    category: 'sad',
    genre: 'Emotional Cello',
    duration: 140,
    bpm: 68,
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-hollidays-690.mp3',
    coverUrl: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: ['sad', 'emotional', 'rain', 'cello', 'heartbreak']
  },
  {
    id: 'sd_2',
    title: 'Tanhayi (Slow Piano Echo)',
    artist: 'Rahul Sen Records',
    category: 'sad',
    genre: 'Sad Piano',
    duration: 115,
    bpm: 70,
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
    coverUrl: 'https://images.pexels.com/photos/373912/pexels-photo-373912.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: ['sad', 'lonely', 'piano', 'ambient']
  },

  // 6. PARTY
  {
    id: 'pt_1',
    title: 'Desi Dholak Bass Drop',
    artist: 'DJ Akhil & Pulse Studio',
    category: 'party',
    genre: 'Club Dance',
    duration: 110,
    bpm: 132,
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-game-level-music-689.mp3',
    coverUrl: 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: ['party', 'dance', 'club', 'dholak', 'bass']
  },
  {
    id: 'pt_2',
    title: 'Mumbai Electro High-Energy',
    artist: 'Electro Bollywood',
    category: 'party',
    genre: 'EDM Party',
    duration: 128,
    bpm: 128,
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
    coverUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: ['party', 'edm', 'mumbai', 'high energy']
  },

  // 7. DEVOTIONAL
  {
    id: 'dv_1',
    title: 'Om Namah Shivaya (Trance Flute & Bells)',
    artist: 'Vedic Sanatan Sound',
    category: 'devotional',
    genre: 'Spiritual Bhakti',
    duration: 160,
    bpm: 72,
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
    coverUrl: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: ['devotional', 'shiva', 'flute', 'spiritual', 'peace']
  },
  {
    id: 'dv_2',
    title: 'Krishna Flute & Temple Conch Meditation',
    artist: 'Pandit Hari Prasad Ambience',
    category: 'devotional',
    genre: 'Bansuri Meditation',
    duration: 155,
    bpm: 65,
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-delightful-4.mp3',
    coverUrl: 'https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: ['devotional', 'krishna', 'bansuri', 'meditation', 'kashi']
  },

  // 8. LO-FI
  {
    id: 'lf_1',
    title: 'Deep Focus Coding Flow',
    artist: 'Aarav Sharma Beats',
    category: 'lofi',
    genre: 'Chillhop / Lofi',
    duration: 145,
    bpm: 85,
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-hollidays-690.mp3',
    coverUrl: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: ['lofi', 'chill', 'focus', 'coding', 'beats']
  },
  {
    id: 'lf_2',
    title: 'Bengaluru Midnight Coffee',
    artist: 'Urban Lofi Collective',
    category: 'lofi',
    genre: 'Lo-Fi Jazz',
    duration: 112,
    bpm: 92,
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-delightful-4.mp3',
    coverUrl: 'https://images.pexels.com/photos/373912/pexels-photo-373912.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: ['lofi', 'coffee', 'jazz', 'bengaluru']
  },

  // 9. INSTRUMENTAL
  {
    id: 'ins_1',
    title: 'Classical Sitar & Tabla Tarang',
    artist: 'Pandit Alok Kumar Trio',
    category: 'instrumental',
    genre: 'Indian Classical',
    duration: 150,
    bpm: 95,
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-delightful-4.mp3',
    coverUrl: 'https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: ['instrumental', 'sitar', 'tabla', 'classical']
  },
  {
    id: 'ins_2',
    title: 'Sub-Bass Impact Drop & Riser',
    artist: 'Ravikant Studio FX',
    category: 'instrumental',
    genre: 'Cinematic Trailer',
    duration: 65,
    bpm: 110,
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-raising-me-higher-34.mp3',
    coverUrl: 'https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: ['instrumental', 'cinematic', 'riser', 'trailer', 'impact']
  }
];

export const musicLibraryService = {
  getCategories() {
    return MUSIC_CATEGORIES;
  },

  getAllSongs() {
    return COMPREHENSIVE_MUSIC_LIBRARY;
  },

  filterSongs({ category = 'all', query = '' }) {
    let list = COMPREHENSIVE_MUSIC_LIBRARY;

    if (category && category !== 'all') {
      list = list.filter(s => s.category === category);
    }

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        s =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.genre.toLowerCase().includes(q) ||
          (s.tags && s.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    return list;
  }
};
