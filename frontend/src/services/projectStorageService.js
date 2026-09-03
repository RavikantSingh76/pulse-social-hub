// Project Storage, Templates & Technical Interview Demo Project Service

const STORAGE_KEY = 'pulse_studio_projects_v2';
const ACTIVE_PROJECT_KEY = 'pulse_studio_active_project_id';

export const REEL_TEMPLATES = [
  {
    id: 'tpl_tech_product',
    name: 'Tech Product Launch',
    description: 'Hook → Product Demo → Architecture → Metrics → Final CTA',
    category: 'Product & Tech',
    aspectRatio: '9:16',
    coverUrl: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400',
    timelineClips: [
      {
        id: 'c1',
        title: 'The Hook',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-city-traffic-at-night-42261-large.mp4',
        mediaType: 'VIDEO',
        duration: 3.5,
        trimStart: 0,
        trimEnd: 3.5,
        filter: 'cyberpunk',
        scale: 100,
        rotation: 0,
        opacity: 100,
        transition: 'fade'
      },
      {
        id: 'c2',
        title: 'Core Engine',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-coding-on-a-laptop-in-a-dark-room-41885-large.mp4',
        mediaType: 'VIDEO',
        duration: 5.0,
        trimStart: 0,
        trimEnd: 5.0,
        filter: 'cinematic',
        scale: 100,
        rotation: 0,
        opacity: 100,
        transition: 'slide-left'
      },
      {
        id: 'c3',
        title: 'High Concurrency',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-modern-buildings-in-a-financial-district-42469-large.mp4',
        mediaType: 'VIDEO',
        duration: 4.5,
        trimStart: 0,
        trimEnd: 4.5,
        filter: 'cinematic',
        scale: 100,
        rotation: 0,
        opacity: 100,
        transition: 'zoom'
      },
      {
        id: 'c4',
        title: 'Join Community',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-sun-setting-over-the-ocean-horizon-41571-large.mp4',
        mediaType: 'VIDEO',
        duration: 4.0,
        trimStart: 0,
        trimEnd: 4.0,
        filter: 'warm',
        scale: 100,
        rotation: 0,
        opacity: 100,
        transition: 'dissolve'
      }
    ],
    textLayers: [
      { id: 't1', text: 'Stop Building Slow Apps ⚡', startTime: 0.5, duration: 2.8, color: '#f59e0b', fontSize: 32, isBold: true, hasBackground: true },
      { id: 't2', text: 'Sub-10ms Microservices 🚀', startTime: 4.0, duration: 4.2, color: '#06b6d4', fontSize: 30, isBold: true, hasBackground: true },
      { id: 't3', text: '50k Req/Sec Throughput 🔥', startTime: 9.0, duration: 3.8, color: '#10b981', fontSize: 32, isBold: true, hasBackground: true },
      { id: 't4', text: 'Try Pulse Social Hub Today 👑', startTime: 13.5, duration: 3.5, color: '#ec4899', fontSize: 32, isBold: true, hasBackground: true }
    ],
    backgroundMusic: {
      id: 'm1',
      title: 'Neon Cyberpunk Lofi',
      artist: 'Pulse Original Master',
      audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
      volume: 75,
      startTime: 0,
      autoDucking: true
    }
  },
  {
    id: 'tpl_portfolio',
    name: 'Developer Portfolio Showcase',
    description: 'Introduction → Projects → Tech Stack → Live Demo → Connect',
    category: 'Portfolio & Career',
    aspectRatio: '9:16',
    coverUrl: 'https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=400',
    timelineClips: [
      {
        id: 'p1',
        title: 'Developer Intro',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-coding-on-a-laptop-in-a-dark-room-41885-large.mp4',
        mediaType: 'VIDEO',
        duration: 4.0,
        trimStart: 0,
        trimEnd: 4.0,
        filter: 'cinematic',
        scale: 100
      },
      {
        id: 'p2',
        title: 'Project Architecture',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-city-traffic-at-night-42261-large.mp4',
        mediaType: 'VIDEO',
        duration: 5.0,
        trimStart: 0,
        trimEnd: 5.0,
        filter: 'cyberpunk',
        scale: 100
      }
    ],
    textLayers: [
      { id: 'pt1', text: 'Ravikant Singh · Full-Stack Architect', startTime: 0.5, duration: 3.2, color: '#38bdf8', fontSize: 28, isBold: true, hasBackground: true },
      { id: 'pt2', text: 'Spring Boot 3 + WebRTC + React 18', startTime: 4.5, duration: 4.0, color: '#a855f7', fontSize: 26, isBold: true, hasBackground: true }
    ],
    backgroundMusic: {
      id: 'm2',
      title: 'Deep Focus Coding Flow',
      artist: 'Aarav Sharma Beats',
      audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-hollidays-690.mp3',
      volume: 80,
      startTime: 0,
      autoDucking: true
    }
  },
  {
    id: 'tpl_travel',
    name: 'Wanderlust Travel Reel',
    description: 'Location Reveal → Scenic Cuts → Sound Design → Memory Note',
    category: 'Lifestyle & Travel',
    aspectRatio: '9:16',
    coverUrl: 'https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=400',
    timelineClips: [
      {
        id: 'tr1',
        title: 'Marine Drive Sunset',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-sun-setting-over-the-ocean-horizon-41571-large.mp4',
        mediaType: 'VIDEO',
        duration: 4.5,
        filter: 'warm',
        scale: 100
      },
      {
        id: 'tr2',
        title: 'Ocean Waves',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-waves-crashing-on-a-sandy-beach-42407-large.mp4',
        mediaType: 'VIDEO',
        duration: 4.5,
        filter: 'cool',
        scale: 100
      }
    ],
    textLayers: [
      { id: 'tt1', text: 'Monsoon Coastline Memories 🌊', startTime: 0.5, duration: 3.5, color: '#ffffff', fontSize: 30, isBold: true, hasBackground: true }
    ],
    backgroundMusic: {
      id: 'm4',
      title: 'Marine Drive Sunset',
      artist: 'Acoustic Soul',
      audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
      volume: 75,
      startTime: 0,
      autoDucking: false
    }
  }
];

export const projectStorageService = {
  // Get all saved projects
  getAllProjects() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const projects = data ? JSON.parse(data) : [];
      return Array.isArray(projects) ? projects : [];
    } catch (e) {
      return [];
    }
  },

  // Save or update a project
  saveProject(project) {
    try {
      const projects = this.getAllProjects();
      const updatedProject = {
        ...project,
        updatedAt: new Date().toISOString()
      };

      const existingIdx = projects.findIndex(p => p.id === project.id);
      if (existingIdx >= 0) {
        projects[existingIdx] = updatedProject;
      } else {
        projects.unshift(updatedProject);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      localStorage.setItem(ACTIVE_PROJECT_KEY, updatedProject.id);
      return updatedProject;
    } catch (e) {
      console.error('Failed to save project to localStorage:', e);
      return project;
    }
  },

  // Get project by ID
  getProjectById(id) {
    const projects = this.getAllProjects();
    return projects.find(p => p.id === id) || null;
  },

  // Delete a project
  deleteProject(id) {
    const projects = this.getAllProjects().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return true;
  },

  // Duplicate a project
  duplicateProject(id) {
    const orig = this.getProjectById(id);
    if (!orig) return null;

    const copy = {
      ...orig,
      id: `proj_${Date.now()}`,
      name: `${orig.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.saveProject(copy);
  },

  // Creates the Technical Interview Demo Project ready to present live
  createDemoProject() {
    const demo = {
      id: 'demo_technical_interview_v1',
      name: '🚀 Pulse Studio — Architecture Masterclass Demo',
      description: 'Technical Interview Live Demonstration Reel with Ken-Burns scale, auto-ducking audio, animated captions & transitions',
      aspectRatio: '9:16',
      resolution: '1080p',
      fps: 30,
      filterPreset: 'cinematic',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timelineClips: [
        {
          id: 'clip_demo_1',
          title: '01. The Problem Hook',
          url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-city-traffic-at-night-42261-large.mp4',
          mediaType: 'VIDEO',
          duration: 3.5,
          trimStart: 0,
          trimEnd: 3.5,
          filter: 'cyberpunk',
          scale: 105,
          rotation: 0,
          opacity: 100,
          transition: 'fade'
        },
        {
          id: 'clip_demo_2',
          title: '02. Spring Boot 3 Engine',
          url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-coding-on-a-laptop-in-a-dark-room-41885-large.mp4',
          mediaType: 'VIDEO',
          duration: 4.5,
          trimStart: 0,
          trimEnd: 4.5,
          filter: 'cinematic',
          scale: 100,
          rotation: 0,
          opacity: 100,
          transition: 'slide-left'
        },
        {
          id: 'clip_demo_3',
          title: '03. WebRTC & Reels Experience',
          url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-woman-recording-a-dance-with-her-phone-41489-large.mp4',
          mediaType: 'VIDEO',
          duration: 4.0,
          trimStart: 0,
          trimEnd: 4.0,
          filter: 'warm',
          scale: 105,
          rotation: 0,
          opacity: 100,
          transition: 'zoom'
        },
        {
          id: 'clip_demo_4',
          title: '04. High Concurrency Scaling',
          url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-modern-buildings-in-a-financial-district-42469-large.mp4',
          mediaType: 'VIDEO',
          duration: 4.5,
          trimStart: 0,
          trimEnd: 4.5,
          filter: 'cinematic',
          scale: 100,
          rotation: 0,
          opacity: 100,
          transition: 'slide-right'
        },
        {
          id: 'clip_demo_5',
          title: '05. Community & Final Call to Action',
          url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-sun-setting-over-the-ocean-horizon-41571-large.mp4',
          mediaType: 'VIDEO',
          duration: 4.0,
          trimStart: 0,
          trimEnd: 4.0,
          filter: 'warm',
          scale: 100,
          rotation: 0,
          opacity: 100,
          transition: 'dissolve'
        }
      ],
      textLayers: [
        { id: 'txt_demo_1', text: 'Stop Building Social Apps The Old Way ⚡', startTime: 0.5, duration: 2.8, color: '#facc15', fontSize: 30, isBold: true, hasBackground: true, animation: 'pop' },
        { id: 'txt_demo_2', text: 'Sub-10ms Microservices with Spring Boot 3 & React 🚀', startTime: 4.0, duration: 3.8, color: '#38bdf8', fontSize: 28, isBold: true, hasBackground: true, animation: 'typewriter' },
        { id: 'txt_demo_3', text: 'Instant WebRTC Video Calls & 9:16 Reels 🎥', startTime: 8.5, duration: 3.2, color: '#f472b6', fontSize: 28, isBold: true, hasBackground: true, animation: 'slide' },
        { id: 'txt_demo_4', text: 'Scaled with HikariCP & Kafka for 50,000 req/sec 🛡️', startTime: 12.5, duration: 3.8, color: '#34d399', fontSize: 28, isBold: true, hasBackground: true, animation: 'glow' },
        { id: 'txt_demo_5', text: 'Follow @ravikant & Join Pulse Today 👑', startTime: 17.0, duration: 3.2, color: '#e879f9', fontSize: 30, isBold: true, hasBackground: true, animation: 'bounce' }
      ],
      backgroundMusic: {
        id: 'm1',
        title: 'Neon Cyberpunk Lofi',
        artist: 'Pulse Original Master',
        audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
        volume: 75,
        startTime: 0,
        autoDucking: true
      },
      voiceoverTracks: [
        {
          id: 'vo_1',
          title: 'Narration Track',
          text: 'Welcome to Pulse Studio. Experience sub-10ms real-time video compositing and audio mixing.',
          startTime: 0.5,
          duration: 6.0,
          volume: 100
        }
      ],
      soundEffects: [
        { id: 'sfx_1', type: 'impact', startTime: 0.0, volume: 80 },
        { id: 'sfx_2', type: 'typing', startTime: 3.8, volume: 70 },
        { id: 'sfx_3', type: 'whoosh', startTime: 8.2, volume: 75 },
        { id: 'sfx_4', type: 'chime', startTime: 16.5, volume: 85 }
      ]
    };

    return this.saveProject(demo);
  }
};
