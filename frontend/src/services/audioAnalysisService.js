// Audio Analysis & Beat Detection Service using Web Audio API

class AudioAnalysisService {
  constructor() {
    this.audioContext = null;
  }

  getAudioContext() {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
    return this.audioContext;
  }

  // Analyzes an audio buffer or URL to detect strong rhythm beat timestamps
  async detectBeats(audioUrl, sensitivity = 1.25) {
    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const ctx = this.getAudioContext();
      if (!ctx) return this.generateFallbackBeats(120, 30); // 120 bpm fallback

      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      const duration = audioBuffer.duration;

      const bufferSize = 1024;
      const numWindows = Math.floor(channelData.length / bufferSize);
      const energies = [];

      // Calculate instantaneous energy for each window
      for (let i = 0; i < numWindows; i++) {
        let sum = 0;
        const start = i * bufferSize;
        for (let j = 0; j < bufferSize; j++) {
          const val = channelData[start + j] || 0;
          sum += val * val;
        }
        energies.push(Math.sqrt(sum / bufferSize));
      }

      // Detect peaks comparing to local average energy
      const beats = [];
      const windowRadius = 25; // ~0.5 sec local window
      const minBeatDistanceSec = 0.35; // Minimum time between consecutive beats
      let lastBeatTime = -1;

      for (let i = windowRadius; i < energies.length - windowRadius; i++) {
        let localSum = 0;
        for (let j = i - windowRadius; j <= i + windowRadius; j++) {
          localSum += energies[j];
        }
        const localAvg = localSum / (windowRadius * 2 + 1);
        const timeSec = (i * bufferSize) / sampleRate;

        if (energies[i] > localAvg * sensitivity && energies[i] > 0.08) {
          if (lastBeatTime === -1 || (timeSec - lastBeatTime) >= minBeatDistanceSec) {
            beats.push({
              time: parseFloat(timeSec.toFixed(2)),
              intensity: Math.min(1.0, energies[i] / (localAvg * 2))
            });
            lastBeatTime = timeSec;
          }
        }
      }

      return beats.length > 0 ? beats : this.generateFallbackBeats(110, duration);
    } catch (err) {
      console.warn('Beat detection fallback activated:', err);
      return this.generateFallbackBeats(120, 30);
    }
  }

  generateFallbackBeats(bpm = 120, duration = 30) {
    const interval = 60 / bpm;
    const beats = [];
    for (let t = 0; t <= duration; t += interval) {
      beats.push({
        time: parseFloat(t.toFixed(2)),
        intensity: (t % (interval * 4) === 0) ? 1.0 : 0.6
      });
    }
    return beats;
  }
}

export const audioAnalysisService = new AudioAnalysisService();
