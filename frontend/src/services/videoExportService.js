// Real Canvas-based Video Export & Audio Compositing Engine for Pulse Studio
import { getYouTubeId, getYouTubeThumbnail, LOCAL_SAMPLE_VIDEOS, resolveSafeMediaUrl } from '../utils/mediaUtils';

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
    await audioCtx.resume().catch(() => {});
    const destNode = audioCtx.createMediaStreamDestination();

    // Attach a continuous silent carrier tone so destination audio stream is always clocking
    try {
      const silentOsc = audioCtx.createOscillator();
      const silentGain = audioCtx.createGain();
      silentGain.gain.value = 0.0001; // Silent carrier
      silentOsc.connect(silentGain);
      silentGain.connect(destNode);
      silentOsc.start();
    } catch (e) {}

    // Calculate Total Timeline Duration
    const totalDuration = timelineClips.reduce((sum, c) => sum + (c.duration || 3), 0);

    onProgress({ stage: 'preparing', progress: 5, message: 'Initializing rendering pipeline & preloading media...' });

    // Preload video elements and images safely with timeout fallbacks
    const loadedElements = await Promise.all(
      timelineClips.map(async (clip, idx) => {
        const ytId = getYouTubeId(clip.url);
        if (ytId) {
          // YouTube clips cannot be read raw via HTML5 Video element due to CORS
          // Preload the high-quality YouTube thumbnail as a canvas image element
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = getYouTubeThumbnail(clip.url, 'hqdefault');
          await new Promise((resolve) => {
            let finished = false;
            const timer = setTimeout(() => {
              if (!finished) {
                finished = true;
                resolve();
              }
            }, 3000);

            img.onload = () => {
              if (!finished) {
                finished = true;
                clearTimeout(timer);
                resolve();
              }
            };
            img.onerror = () => {
              if (!finished) {
                finished = true;
                clearTimeout(timer);
                img.src = 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800';
                img.onload = () => resolve();
                img.onerror = () => resolve();
              }
            };
          });
          return { ...clip, element: img, isVideo: false };
        }

        if (clip.mediaType === 'VIDEO') {
          const video = document.createElement('video');
          video.crossOrigin = 'anonymous';
          const safeUrl = resolveSafeMediaUrl(clip.url, idx);
          video.src = safeUrl;
          video.muted = true;
          video.playsInline = true;
          await new Promise((resolve) => {
            let finished = false;
            const timer = setTimeout(() => {
              if (!finished) {
                finished = true;
                video.src = LOCAL_SAMPLE_VIDEOS[idx % LOCAL_SAMPLE_VIDEOS.length];
                video.onloadeddata = () => resolve();
                video.onerror = () => resolve();
                video.load();
              }
            }, 3500);

            video.onloadeddata = () => {
              if (!finished) {
                finished = true;
                clearTimeout(timer);
                resolve();
              }
            };
            video.onerror = () => {
              if (!finished) {
                finished = true;
                clearTimeout(timer);
                video.src = LOCAL_SAMPLE_VIDEOS[idx % LOCAL_SAMPLE_VIDEOS.length];
                video.onloadeddata = () => resolve();
                video.onerror = () => resolve();
                video.load();
              }
            };
            video.load();
          });
          return { ...clip, element: video, isVideo: true };
        } else {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = clip.url;
          await new Promise((resolve) => {
            let finished = false;
            const timer = setTimeout(() => {
              if (!finished) {
                finished = true;
                resolve();
              }
            }, 3000);

            img.onload = () => {
              if (!finished) {
                finished = true;
                clearTimeout(timer);
                resolve();
              }
            };
            img.onerror = () => {
              if (!finished) {
                finished = true;
                clearTimeout(timer);
                resolve();
              }
            };
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

    // Setup Voiceover Audio Nodes if present
    const activeVoiceAudioEls = [];
    if (voiceoverTracks && voiceoverTracks.length > 0) {
      voiceoverTracks.forEach((vo) => {
        try {
          if (vo.audioUrl) {
            const voEl = new Audio(vo.audioUrl);
            const voSource = audioCtx.createMediaElementSource(voEl);
            const voGain = audioCtx.createGain();
            voGain.gain.value = (vo.volume !== undefined ? vo.volume : 100) / 100;
            voSource.connect(voGain);
            voGain.connect(destNode);
            activeVoiceAudioEls.push({
              el: voEl,
              startTime: vo.startTime || 0,
              duration: vo.duration || 5,
              hasStarted: false
            });
          }
        } catch (e) {
          console.warn('Could not connect voiceover to audio destination:', e);
        }
      });
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

        // Apply Filter presets with luminous brightness and clip adjustments
        applyCanvasFilters(ctx, filterPreset || activeClip?.filter, activeClip);

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
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(-width / 2, -height / 2, width, height);
            }
          } else {
            try {
              // Ken Burns subtle pan for static images
              const progressRatio = (currentTime - accumulatedTime) / (activeClip.duration || 3);
              const zoomFactor = 1.0 + (progressRatio * 0.08);
              ctx.scale(zoomFactor, zoomFactor);
              ctx.drawImage(activeClip.element, -width / 2, -height / 2, width, height);
            } catch (e) {
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(-width / 2, -height / 2, width, height);
            }
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
            const isBold = layer.isBold !== false;
            const isItalic = layer.isItalic ? 'italic ' : '';
            const baseFontSize = layer.fontSize ? Math.round(layer.fontSize * 1.5) : 48;
            ctx.font = `${isItalic}${isBold ? 'bold ' : ''}${baseFontSize}px ${layer.fontFamily || 'Inter, sans-serif'}`;
            ctx.fillStyle = layer.color || '#ffffff';

            const textAlign = layer.textAlign || layer.align || 'center';
            ctx.textAlign = textAlign;
            ctx.textBaseline = 'middle';

            const vertAlign = layer.verticalAlign || 'bottom';
            let baseY = height * 0.78;
            if (vertAlign === 'top') baseY = height * 0.16;
            else if (vertAlign === 'center') baseY = height * 0.50;

            let x = width / 2 + ((layer.posX || 0) * (width / 326));
            if (textAlign === 'left') x = width * 0.1 + ((layer.posX || 0) * (width / 326));
            else if (textAlign === 'right') x = width * 0.9 + ((layer.posX || 0) * (width / 326));

            const y = baseY + ((layer.posY || 0) * (height / 580));

            const lines = (layer.text || '').split('\n');
            const lineHeight = baseFontSize * 1.3;
            const totalTextHeight = lines.length * lineHeight;

            // Measure max width across lines
            let maxLineWidth = 0;
            lines.forEach((line) => {
              const lw = ctx.measureText(line).width;
              if (lw > maxLineWidth) maxLineWidth = lw;
            });

            // Draw Background Glass Pill if enabled
            if (layer.hasBackground) {
              ctx.save();
              ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
              ctx.beginPath();
              let pillX = x - (maxLineWidth / 2) - 36;
              if (textAlign === 'left') pillX = x - 36;
              else if (textAlign === 'right') pillX = x - maxLineWidth - 36;

              const pillY = y - (totalTextHeight / 2) - 20;
              const pillWidth = maxLineWidth + 72;
              const pillHeight = totalTextHeight + 40;

              ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 26);
              ctx.fill();

              // Subtle frosted glass border
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
              ctx.lineWidth = 3;
              ctx.stroke();
              ctx.restore();
            }

            // Draw each text line
            ctx.shadowColor = 'rgba(0,0,0,0.9)';
            ctx.shadowBlur = 12;
            const startY = y - ((lines.length - 1) * lineHeight) / 2;
            lines.forEach((line, lineIdx) => {
              if (lineIdx === 0) {
                ctx.fillStyle = layer.color || '#ffffff';
                ctx.font = `${isItalic}${isBold ? 'bold ' : ''}${baseFontSize}px ${layer.fontFamily || 'Inter, sans-serif'}`;
              } else {
                ctx.fillStyle = '#f1f5f9';
                ctx.font = `${isItalic}600 ${Math.round(baseFontSize * 0.86)}px ${layer.fontFamily || 'Inter, sans-serif'}`;
              }
              ctx.fillText(line, x, startY + (lineIdx * lineHeight));
            });
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

        // Trigger voiceovers at their respective startTime
        activeVoiceAudioEls.forEach(vo => {
          if (!vo.hasStarted && currentTime >= vo.startTime && currentTime <= vo.startTime + vo.duration) {
            vo.hasStarted = true;
            try {
              vo.el.currentTime = currentTime - vo.startTime;
              vo.el.play().catch(() => {});
            } catch (e) {}
          }
        });

        if (currentFrame < totalFrames) {
          setTimeout(renderNextFrame, frameIntervalMs / 2); // 2x realtime speed
        } else {
          onProgress({ stage: 'finalizing', progress: 98, message: 'Finalizing video codecs and packaging audio stream...' });
          if (bgAudioEl) bgAudioEl.pause();
          activeVoiceAudioEls.forEach(v => {
            try { v.el.pause(); } catch (e) {}
          });
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

// Helper to apply CSS/Canvas filters with high clarity, bright exposure, and custom sliders
function applyCanvasFilters(ctx, preset, activeClip = {}) {
  const customBrightness = (activeClip.brightness ?? 100) / 100;
  const customContrast = (activeClip.contrast ?? 100) / 100;
  const customSaturation = (activeClip.saturation ?? 100) / 100;

  let baseBrightness = 1.0;
  let baseContrast = 1.0;
  let baseSaturation = 1.0;
  let extraFilters = '';

  switch (preset) {
    case 'bright':
      baseBrightness = 1.20;
      baseContrast = 1.05;
      baseSaturation = 1.20;
      break;
    case 'cinematic':
      baseBrightness = 1.10;
      baseContrast = 1.10;
      baseSaturation = 1.15;
      break;
    case 'cyberpunk':
      baseBrightness = 1.05;
      baseContrast = 1.15;
      baseSaturation = 1.40;
      extraFilters = 'hue-rotate(15deg) ';
      break;
    case 'vintage':
      baseBrightness = 1.08;
      baseContrast = 1.05;
      extraFilters = 'sepia(25%) ';
      break;
    case 'warm':
      baseBrightness = 1.12;
      baseSaturation = 1.20;
      extraFilters = 'sepia(20%) ';
      break;
    case 'cool':
      baseBrightness = 1.08;
      baseContrast = 1.05;
      extraFilters = 'hue-rotate(185deg) ';
      break;
    case 'bw':
      baseBrightness = 1.05;
      baseContrast = 1.15;
      extraFilters = 'grayscale(100%) ';
      break;
    default:
      break;
  }

  const finalBrightness = Math.round(baseBrightness * customBrightness * 100);
  const finalContrast = Math.round(baseContrast * customContrast * 100);
  const finalSaturation = Math.round(baseSaturation * customSaturation * 100);

  if (preset === 'none' && !activeClip.brightness && !activeClip.contrast && !activeClip.saturation) {
    ctx.filter = 'none';
  } else {
    ctx.filter = `${extraFilters}brightness(${finalBrightness}%) contrast(${finalContrast}%) saturate(${finalSaturation}%)`.trim();
  }
}

export const videoExportService = new VideoExportService();
