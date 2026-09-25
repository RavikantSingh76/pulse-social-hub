package com.socialmedia.service;

import com.socialmedia.util.TestVideoGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class VideoMetadataExtractorTest {

    private VideoMetadataExtractor extractor;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        extractor = new VideoMetadataExtractor();
    }

    @Test
    @DisplayName("Should accurately extract duration from a valid 15.5-second MP4")
    void testExtractDurationValidMp4() throws IOException {
        byte[] videoBytes = TestVideoGenerator.createMp4Video(15.5);
        File tempFile = tempDir.resolve("valid_15s.mp4").toFile();
        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            fos.write(videoBytes);
        }

        VideoMetadataExtractor.VideoMetadata metadata = extractor.extractMetadata(tempFile);
        assertNotNull(metadata);
        assertEquals(15.5, metadata.getDurationSeconds(), 0.1);
        assertEquals("MP4", metadata.getFormat());
        assertEquals("video/mp4", metadata.getMimeType());
        assertTrue(metadata.getFileSize() > 0);
    }

    @Test
    @DisplayName("Should extract duration from exact 20.0-second MP4")
    void testExtractDurationExact20Seconds() throws IOException {
        byte[] videoBytes = TestVideoGenerator.createMp4Video(20.0);
        File tempFile = tempDir.resolve("exact_20s.mp4").toFile();
        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            fos.write(videoBytes);
        }

        VideoMetadataExtractor.VideoMetadata metadata = extractor.extractMetadata(tempFile);
        assertNotNull(metadata);
        assertEquals(20.0, metadata.getDurationSeconds(), 0.1);
    }

    @Test
    @DisplayName("Should extract duration from 25.0-second MP4 for duration checker")
    void testExtractDurationOver20Seconds() throws IOException {
        byte[] videoBytes = TestVideoGenerator.createMp4Video(25.0);
        File tempFile = tempDir.resolve("over_20s.mp4").toFile();
        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            fos.write(videoBytes);
        }

        VideoMetadataExtractor.VideoMetadata metadata = extractor.extractMetadata(tempFile);
        assertNotNull(metadata);
        assertEquals(25.0, metadata.getDurationSeconds(), 0.1);
    }

    @Test
    @DisplayName("Should reject empty or zero-byte file")
    void testRejectEmptyFile() {
        File emptyFile = tempDir.resolve("empty.mp4").toFile();
        try {
            emptyFile.createNewFile();
        } catch (IOException ignored) {}

        assertThrows(IllegalArgumentException.class, () -> extractor.extractMetadata(emptyFile));
    }

    @Test
    @DisplayName("Should reject corrupt file with random non-video bytes")
    void testRejectCorruptFile() throws IOException {
        File corruptFile = tempDir.resolve("corrupt.mp4").toFile();
        try (FileOutputStream fos = new FileOutputStream(corruptFile)) {
            fos.write(new byte[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16});
        }

        assertThrows(IllegalArgumentException.class, () -> extractor.extractMetadata(corruptFile));
    }
}
