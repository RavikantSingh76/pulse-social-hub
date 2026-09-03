// Real Canvas-based Video Export & Audio Compositing Engine for Pulse Studio

class VideoExportService {
  constructor() {
    this.isExporting = false;
    this.recorder = null;
    this.abortController = null;
  }

  // Renders the timeline into a real downloadable video blob
  async exportTimeline({
    timelineClips = [],
    textLayers = [],
    backgroundMusic = null,
    voiceoverTracks = [],
    aspectRatio = '9:16', // '9:16' | '1:1' | '16:9'
    resolution = '1080p', // '1080p' | '720p' | '4K'
    fps = 30,
    filterPreset = 'none',
    onProgress = () => {}
  }) {
    if (this.isExporting) throw new Error('An export is already in progress.');
    if (timelineClips.length === 0) throw new Error('Cannot export an empty timeline. Please add at least one video or image clip.');

    this.isExporting = true;
    this.abortController = new AbortController();

    // 1. Determine Dimensions
    let width = 1080;
    let height = 1920;

    if (aspectRatio === '1:1') {
      width = 1080;
      height = 1080;
    } else if (aspectRatio === '16:9') {
      width = 1920;
      height = 1080;
    }

    if (resolution === '720p') {
      width = Math.round(width * 0.666);
      height = Math.round(height * 0.666);
    }

    // 2. Setup Offscreen Canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // 3. Setup Audio Compositor via Web Audio API
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioCtx();
    const destNode = audioCtx.createMediaStreamDestination();

    // Calculate Total Timeline Duration
    const totalDuration = timelineClips.reduce((sum, c) => sum + (c.duration || 3), 0);

    onProgress({ stage: 'preparing', progress: 5, message: 'Initializing rendering pipeline & preloading media...' });

    // Preload video elements and images
    const loadedElements = await Promise.all(
      timelineClips.map(async (clip) => {
        if (clip.mediaType === 'VIDEO') {
          const video = document.createElement('video');
          video.crossOrigin = 'anonymous';
          video.src = clip.url;
          video.muted = true;
          video.playsInline = true;
          await new Promise((resolve) => {
            video.onloadeddata = () => resolve();
            video.onerror = () => resolve();
            video.load();
          });
          return { ...clip, element: video, isVideo: true };
        } else {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = clip.url;
          await new Promise((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
          return { ...clip, element: img, isVideo: false };
        }
      })
    );

    // Setup Background Music Node if present
    let bgAudioEl = null;
    if (backgroundMusic && backgroundMusic.audioUrl) {
      try {
        bgAudioEl = new Audio(backgroundMusic.audioUrl);
        bgAudioEl.crossOrigin = 'anonymous';
        const bgSource = audioCtx.createMediaElementSource(bgAudioEl);
        const bgGain = audioCtx.createGain();
        bgGain.gain.value = (backgroundMusic.volume || 75) / 100;
        bgSource.connect(bgGain);
        bgGain.connect(destNode);
      } catch (e) {
        console.warn('Could not connect background music to audio destination:', e);
      }
    }

    onProgress({ stage: 'rendering', progress: 15, message: 'Compositing video frames & text animations...' });

    // 4. Combine Canvas Stream & Audio Stream
    const canvasStream = canvas.captureStream(fps);
    const combinedStream = new MediaStream();

    canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
    destNode.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));

    // Choose supported MIME type
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
    }

    const mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: 6000000 // 6 Mbps high quality
    });

    const recordedChunks = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    return new Promise(async (resolve, reject) => {
      mediaRecorder.onstop = () => {
        this.isExporting = false;
        const blob = new Blob(recordedChunks, { type: mimeType });
        const videoUrl = URL.createObjectURL(blob);
        onProgress({ stage: 'completed', progress: 100, message: 'Video rendered successfully! Ready to download.' });
        resolve({
          blob,
          videoUrl,
          duration: totalDuration,
          resolution: `${width}x${height}`,
          sizeBytes: blob.size
        });
      };

      mediaRecorder.onerror = (err) => {
        this.isExporting = false;
        reject(err);
      };

      mediaRecorder.start(200);
      if (bgAudioEl) bgAudioEl.play().catch(() => {});

      // 5. Render Loop through Timeline
      const totalFrames = Math.max(1, Math.round(totalDuration * fps));
      let currentFrame = 0;
      const frameIntervalMs = 1000 / fps;

      const renderNextFrame = async () => {
        if (this.abortController.signal.aborted) {
          mediaRecorder.stop();
          reject(new Error('Export cancelled by user'));
          return;
        }

        const currentTime = (currentFrame / totalFrames) * totalDuration;

        // Locate active clip at currentTime
        let accumulatedTime = 0;
        let activeClip = loadedElements[0];
        let clipLocalTime = 0;

        for (const item of loadedElements) {
          const clipDur = item.duration || 3;
          if (currentTime >= accumulatedTime && currentTime < accumulatedTime + clipDur) {
            activeClip = item;
            clipLocalTime = (currentTime - accumulatedTime) + (item.trimStart || 0);
            break;
          }
          accumulatedTime += clipDur;
        }

        // Draw Background
        ctx.fillStyle = '#05070f';
        ctx.fillRect(0, 0, width, height);

        // Apply Filter presets
        applyCanvasFilters(ctx, filterPreset || activeClip?.filter);

        // Draw Active Clip
        if (activeClip && activeClip.element) {
          ctx.save();
          const scale = (activeClip.scale || 100) / 100;
          const rotation = ((activeClip.rotation || 0) * Math.PI) / 180;
          const opacity = (activeClip.opacity ?? 100) / 100;

          ctx.globalAlpha = opacity;
          ctx.translate(width / 2 + (activeClip.posX || 0), height / 2 + (activeClip.posY || 0));
          ctx.rotate(rotation);
          ctx.scale(scale, scale);

          if (activeClip.isVideo) {
            try {
              if (activeClip.element.fastSeek) activeClip.element.fastSeek(clipLocalTime);
              else activeClip.element.currentTime = clipLocalTime;
              ctx.drawImage(activeClip.element, -width / 2, -height / 2, width, height);
            } catch (e) {
              ctx.drawImage(activeClip.element, -width / 2, -height / 2, width, height);
            }
          } else {
            // Ken Burns subtle pan for static images
            const progressRatio = (currentTime - accumulatedTime) / (activeClip.duration || 3);
            const zoomFactor = 1.0 + (progressRatio * 0.08);
            ctx.scale(zoomFactor, zoomFactor);
            ctx.drawImage(activeClip.element, -width / 2, -height / 2, width, height);
          }
          ctx.restore();
        }

        // Reset Filter
        ctx.filter = 'none';

        // Draw Active Text Layers
        textLayers.forEach((layer) => {
          const lStart = layer.startTime || 0;
          const lEnd = lStart + (layer.duration || 3);

          if (currentTime >= lStart && currentTime <= lEnd) {
            ctx.save();
            ctx.font = `${layer.isBold ? 'bold ' : ''}${layer.fontSize || 36}px ${layer.fontFamily || 'Inter, sans-serif'}`;
            ctx.fillStyle = layer.color || '#ffffff';
            ctx.textAlign = layer.align || 'center';
            ctx.textBaseline = 'middle';

            const x = width / 2 + (layer.posX || 0);
            const y = (height * 0.75) + (layer.posY || 0);

            // Draw Background Pill if enabled
            if (layer.hasBackground) {
              const textWidth = ctx.measureText(layer.text).width;
              ctx.fillStyle = 'rgba(0,0,0,0.75)';
              ctx.beginPath();
              ctx.roundRect(x - (textWidth / 2) - 16, y - 24, textWidth + 32, 48, 12);
              ctx.fill();
              ctx.fillStyle = layer.color || '#ffffff';
            }

            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 8;
            ctx.fillText(layer.text, x, y);
            ctx.restore();
          }
        });

        currentFrame++;
        const pct = Math.min(95, Math.round(15 + ((currentFrame / totalFrames) * 80)));
        if (currentFrame % 10 === 0) {
          onProgress({
            stage: 'rendering',
            progress: pct,
            message: `Rendering frame ${currentFrame}/${totalFrames} (${Math.round((currentTime / totalDuration) * 100)}%)`
          });
        }

        if (currentFrame < totalFrames) {
          setTimeout(renderNextFrame, frameIntervalMs / 2); // 2x realtime speed
        } else {
          onProgress({ stage: 'finalizing', progress: 98, message: 'Finalizing video codecs and packaging audio stream...' });
          if (bgAudioEl) bgAudioEl.pause();
          setTimeout(() => {
            mediaRecorder.stop();
          }, 300);
        }
      };

      renderNextFrame();
    });
  }

  cancelExport() {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.isExporting = false;
  }
}

// Helper to apply CSS/Canvas filters
function applyCanvasFilters(ctx, preset) {
  switch (preset) {
    case 'cinematic':
      ctx.filter = 'contrast(120%) brightness(95%) saturate(110%)';
      break;
    case 'cyberpunk':
      ctx.filter = 'contrast(135%) saturate(160%) hue-rotate(15deg)';
      break;
    case 'vintage':
      ctx.filter = 'sepia(40%) contrast(110%) brightness(90%)';
      break;
    case 'warm':
      ctx.filter = 'sepia(25%) saturate(125%) brightness(105%)';
      break;
    case 'cool':
      ctx.filter = 'hue-rotate(185deg) contrast(105%)';
      break;
    case 'bw':
      ctx.filter = 'grayscale(100%) contrast(125%)';
      break;
    default:
      ctx.filter = 'none';
      break;
  }
}

export const videoExportService = new VideoExportService();
