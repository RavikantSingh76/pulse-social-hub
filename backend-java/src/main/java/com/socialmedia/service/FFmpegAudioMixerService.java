package com.socialmedia.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class FFmpegAudioMixerService {

    private static final Logger log = LoggerFactory.getLogger(FFmpegAudioMixerService.class);

    @Value("${reel.ffmpeg.enabled:true}")
    private boolean ffmpegEnabled;

    @Value("${reel.ffmpeg.path:ffmpeg}")
    private String ffmpegPath;

    public boolean isFFmpegAvailable() {
        if (!ffmpegEnabled) return false;
        try {
            Process process = new ProcessBuilder(ffmpegPath, "-version")
                    .redirectErrorStream(true)
                    .start();
            boolean finished = process.waitFor(2, TimeUnit.SECONDS);
            if (finished && process.exitValue() == 0) {
                return true;
            }
        } catch (Exception e) {
            log.debug("FFmpeg is not available on host system: {}", e.getMessage());
        }
        return false;
    }

    /**
     * Mixes video with soundtrack segment using FFmpeg if available.
     * Returns the output file path or null if skipped/failed.
     */
    public String mixVideoWithAudio(
            String inputVideoPath,
            String inputAudioPath,
            Double audioStartTime,
            Double targetDuration,
            int originalVolumePercent,
            int musicVolumePercent) {

        if (!isFFmpegAvailable()) {
            log.info("FFmpeg not available; preserving native video and dual-track metadata without mixing.");
            return null;
        }

        Path videoFile = Paths.get(inputVideoPath);
        Path audioFile = Paths.get(inputAudioPath);

        if (!Files.exists(videoFile) || !Files.exists(audioFile)) {
            log.warn("Input video or audio file not found on disk for FFmpeg mixing.");
            return null;
        }

        try {
            Path outputDir = videoFile.getParent();
            String mixedFileName = "mixed_" + UUID.randomUUID() + ".mp4";
            Path outputFile = outputDir.resolve(mixedFileName);

            double origVol = Math.max(0.0, Math.min(1.0, originalVolumePercent / 100.0));
            double musVol = Math.max(0.0, Math.min(1.0, musicVolumePercent / 100.0));
            double startSec = audioStartTime != null ? Math.max(0.0, audioStartTime) : 0.0;
            double durSec = targetDuration != null && targetDuration > 0 ? Math.min(20.0, targetDuration) : 20.0;

            // Build complex filter command
            // [0:a]volume=origVol[a0];[1:a]volume=musVol[a1];[a0][a1]amix=inputs=2:duration=first:dropout_transition=2[aout]
            String filterComplex = String.format(
                    "[0:a]volume=%.2f[a0];[1:a]atrim=start=%.2f:duration=%.2f,asetpts=PTS-STARTPTS,volume=%.2f[a1];[a0][a1]amix=inputs=2:duration=first[aout]",
                    origVol, startSec, durSec, musVol
            );

            ProcessBuilder pb = new ProcessBuilder(
                    ffmpegPath,
                    "-y",
                    "-i", videoFile.toAbsolutePath().toString(),
                    "-i", audioFile.toAbsolutePath().toString(),
                    "-filter_complex", filterComplex,
                    "-map", "0:v",
                    "-map", "[aout]",
                    "-c:v", "copy",
                    "-c:a", "aac",
                    "-b:a", "192k",
                    "-shortest",
                    outputFile.toAbsolutePath().toString()
            );

            pb.redirectErrorStream(true);
            Process process = pb.start();
            boolean finished = process.waitFor(15, TimeUnit.SECONDS);

            if (finished && process.exitValue() == 0 && Files.exists(outputFile) && Files.size(outputFile) > 0) {
                log.info("FFmpeg audio-video mixing completed: {}", outputFile.getFileName());
                return outputFile.toAbsolutePath().toString();
            } else {
                log.warn("FFmpeg process timed out or returned non-zero exit code.");
                if (Files.exists(outputFile)) {
                    Files.deleteIfExists(outputFile);
                }
            }
        } catch (Exception e) {
            log.error("FFmpeg mixing error: {}", e.getMessage());
        }

        return null;
    }
}
