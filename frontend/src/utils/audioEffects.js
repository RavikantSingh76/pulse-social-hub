// Modern Web Audio API sound synthesizer and Cinematic Sound Design Engine
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.userInteracted = false;
    this.speechSynth = typeof window !== 'undefined' ? window.speechSynthesis : null;

    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.userInteracted = true;
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };

      window.addEventListener('click', unlockAudio, { once: true, passive: true });
      window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
      window.addEventListener('keydown', unlockAudio, { once: true, passive: true });
    }
  }

  getAudioContext() {
    if (!this.userInteracted && !this.ctx) {
      return null; // Don't trigger browser autoplay warning before user interaction
    }
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch (e) {}
      }
    }
    if (this.ctx && this.ctx.state === 'suspended' && this.userInteracted) {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // 1. Double-tap Like Heart Pop Sound (Sweet harmonic chime)
  playLikePop() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  // 2. Cinematic Whoosh Transition Sound
  playWhoosh() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.25; // 250ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.12);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.25);
      filter.Q.value = 3.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.25);
    } catch (e) {}
  }

  // 3. Cinematic Deep Impact / Bass Drop for the Hook
  playImpactDrop() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.5);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {}
  }

  // 4. Camera Mechanical Shutter Click Sound
  playCameraShutter() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Click 1 (Mirror flip)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(1200, now);
      osc1.frequency.exponentialRampToValueAtTime(150, now + 0.03);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.03);

      // Click 2 (Curtain close)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(800, now + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(100, now + 0.09);
      gain2.gain.setValueAtTime(0.18, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.09);
    } catch (e) {}
  }

  // 5. Ending / CTA Notification Chime
  playChimeCTA() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Major arpeggio)
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch (e) {}
  }

  // 6. Multi-Reaction Bubble Pop
  playReactionBubble() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  // 7. Message Sent / Received Chime
  playMessageChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(587.33, now);
      osc2.frequency.setValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.15);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.3);
    } catch (e) {}
  }

  // 8. Story Swipe Tick
  playSwipeTick() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  // 9. Cinematic Tension Riser (Pitch ascending sweep before key reveals)
  playCinematicRiser() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 1.2);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(4000, now + 1.2);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 1.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.25);
    } catch (e) {}
  }

  // 10. Mechanical Keyboard Typing Sound Burst (ASMR)
  playKeyboardTyping() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // 4 rapid keystrokes with slight timing jitter
      [0, 0.08, 0.17, 0.26].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const tapTime = now + delay;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600 + Math.random() * 200, tapTime);
        osc.frequency.exponentialRampToValueAtTime(120, tapTime + 0.03);

        gain.gain.setValueAtTime(0.12, tapTime);
        gain.gain.exponentialRampToValueAtTime(0.001, tapTime + 0.035);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(tapTime);
        osc.stop(tapTime + 0.035);
      });
    } catch (e) {}
  }

  // 11. Crisp Notification Bell Ding (for real-time message / follow alerts)
  playNotificationDing() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5 (Bright bell)

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  }

  // 9. Natural Voice-Over Narrator with Auto-Ducking
  speakNarrator(text, onEnd = null) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05; // Natural conversational tempo
    utterance.pitch = 1.02; // Warm, confident pitch

    // Prefer high-quality English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v =>
      (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Neural') || v.name.includes('English')) && v.lang.startsWith('en')
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  stopNarrator() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export const soundFx = new SoundEngine();

// Curated Cinematic Soundtracks for Vertical Video Reels
export const REELS_AUDIO_TRACKS = [
  {
    title: 'Neon Cyber Lofi • Midnight Beats',
    artist: 'Pulse Original Master',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3'
  },
  {
    title: 'Bengaluru Skyline • Ambient Flow',
    artist: 'Aarav Sharma & AudioLabs',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-hip-hop-02-738.mp3'
  },
  {
    title: 'Coffee & Code • Deep Focus Beats',
    artist: 'DevLo-Fi Records',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-sleepy-cat-135.mp3'
  },
  {
    title: 'Future Horizons • Synthwave Pulse',
    artist: 'Digital India Soundscapes',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-game-level-music-689.mp3'
  },
  {
    title: 'Startup Energy • Inspiring Tech',
    artist: 'Kavya Nair Acoustic',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3'
  }
];
