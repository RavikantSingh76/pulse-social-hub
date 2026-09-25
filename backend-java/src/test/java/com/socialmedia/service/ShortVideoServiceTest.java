package com.socialmedia.service;

import com.socialmedia.dto.Dtos.ShortVideoResponse;
import com.socialmedia.entity.ShortVideo;
import com.socialmedia.entity.User;
import com.socialmedia.repository.ShortVideoRepository;
import com.socialmedia.repository.UserRepository;
import com.socialmedia.util.TestVideoGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ShortVideoServiceTest {

    @Mock
    private ShortVideoRepository shortVideoRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VideoStorageService videoStorageService;

    @Mock
    private VideoMetadataExtractor videoMetadataExtractor;

    @InjectMocks
    private ShortVideoService shortVideoService;

    @TempDir
    Path tempDir;

    private User testUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        ReflectionTestUtils.setField(shortVideoService, "maxDurationSeconds", 20.0);
        ReflectionTestUtils.setField(shortVideoService, "maxFileSizeMb", 50L);
        ReflectionTestUtils.setField(shortVideoService, "allowedMimeTypes", "video/mp4,video/webm");

        testUser = User.builder()
                .id(1L)
                .username("ravikant")
                .email("ravikant@test.com")
                .role(User.Role.USER)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
    }

    @Test
    @DisplayName("Should accept valid video under 20 seconds")
    void testUploadValidVideoUnder20Seconds() throws Exception {
        byte[] videoBytes = TestVideoGenerator.createMp4Video(10.5);
        MockMultipartFile file = new MockMultipartFile("video", "test_10s.mp4", "video/mp4", videoBytes);

        File physicalFile = tempDir.resolve("uuid-1.mp4").toFile();
        try (FileOutputStream fos = new FileOutputStream(physicalFile)) {
            fos.write(videoBytes);
        }

        VideoStorageService.StoredVideoFile stored = VideoStorageService.StoredVideoFile.builder()
                .videoId("uuid-test-1")
                .filename("uuid-test-1.mp4")
                .fileUrl("/uploads/videos/uuid-test-1.mp4")
                .storagePath(physicalFile.getAbsolutePath())
                .file(physicalFile)
                .fileSize((long) videoBytes.length)
                .checksumSha256("dummy-hash-1")
                .build();

        when(videoStorageService.storeVideo(any())).thenReturn(stored);
        when(videoMetadataExtractor.extractMetadata(any())).thenReturn(
                VideoMetadataExtractor.VideoMetadata.builder()
                        .durationSeconds(10.5)
                        .format("MP4")
                        .mimeType("video/mp4")
                        .fileSize(videoBytes.length)
                        .build()
        );
        when(shortVideoRepository.findByChecksumSha256AndUser(any(), any())).thenReturn(Optional.empty());

        ShortVideo savedEntity = ShortVideo.builder()
                .id(100L)
                .videoId("uuid-test-1")
                .user(testUser)
                .fileUrl("/uploads/videos/uuid-test-1.mp4")
                .storagePath(physicalFile.getAbsolutePath())
                .duration(10.5)
                .fileSize((long) videoBytes.length)
                .mimeType("video/mp4")
                .status(ShortVideo.VideoStatus.UPLOADED)
                .createdAt(LocalDateTime.now())
                .build();

        when(shortVideoRepository.save(any())).thenReturn(savedEntity);

        ShortVideoResponse response = shortVideoService.uploadShortVideo(1L, file);

        assertNotNull(response);
        assertEquals("uuid-test-1", response.getVideoId());
        assertEquals(10.5, response.getDuration());
        assertEquals("UPLOADED", response.getStatus());
        verify(shortVideoRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should accept exactly 20.0-second video")
    void testUploadExact20SecondsVideo() throws Exception {
        byte[] videoBytes = TestVideoGenerator.createMp4Video(20.0);
        MockMultipartFile file = new MockMultipartFile("video", "test_20s.mp4", "video/mp4", videoBytes);

        File physicalFile = tempDir.resolve("uuid-2.mp4").toFile();
        try (FileOutputStream fos = new FileOutputStream(physicalFile)) {
            fos.write(videoBytes);
        }

        VideoStorageService.StoredVideoFile stored = VideoStorageService.StoredVideoFile.builder()
                .videoId("uuid-test-2")
                .fileUrl("/uploads/videos/uuid-test-2.mp4")
                .storagePath(physicalFile.getAbsolutePath())
                .file(physicalFile)
                .fileSize((long) videoBytes.length)
                .checksumSha256("dummy-hash-2")
                .build();

        when(videoStorageService.storeVideo(any())).thenReturn(stored);
        when(videoMetadataExtractor.extractMetadata(any())).thenReturn(
                VideoMetadataExtractor.VideoMetadata.builder()
                        .durationSeconds(20.0)
                        .format("MP4")
                        .mimeType("video/mp4")
                        .fileSize(videoBytes.length)
                        .build()
        );

        ShortVideo savedEntity = ShortVideo.builder()
                .id(101L)
                .videoId("uuid-test-2")
                .user(testUser)
                .fileUrl("/uploads/videos/uuid-test-2.mp4")
                .storagePath(physicalFile.getAbsolutePath())
                .duration(20.0)
                .fileSize((long) videoBytes.length)
                .mimeType("video/mp4")
                .status(ShortVideo.VideoStatus.UPLOADED)
                .build();

        when(shortVideoRepository.save(any())).thenReturn(savedEntity);

        ShortVideoResponse response = shortVideoService.uploadShortVideo(1L, file);

        assertNotNull(response);
        assertEquals(20.0, response.getDuration());
    }

    @Test
    @DisplayName("Should reject video exceeding 20.0 seconds with HTTP 400 Bad Request exception")
    void testRejectVideoExceeding20Seconds() throws Exception {
        byte[] videoBytes = TestVideoGenerator.createMp4Video(24.5);
        MockMultipartFile file = new MockMultipartFile("video", "test_24s.mp4", "video/mp4", videoBytes);

        File physicalFile = tempDir.resolve("uuid-3.mp4").toFile();
        try (FileOutputStream fos = new FileOutputStream(physicalFile)) {
            fos.write(videoBytes);
        }

        VideoStorageService.StoredVideoFile stored = VideoStorageService.StoredVideoFile.builder()
                .videoId("uuid-test-3")
                .storagePath(physicalFile.getAbsolutePath())
                .file(physicalFile)
                .fileSize((long) videoBytes.length)
                .build();

        when(videoStorageService.storeVideo(any())).thenReturn(stored);
        when(videoMetadataExtractor.extractMetadata(any())).thenReturn(
                VideoMetadataExtractor.VideoMetadata.builder()
                        .durationSeconds(24.5)
                        .format("MP4")
                        .mimeType("video/mp4")
                        .fileSize(videoBytes.length)
                        .build()
        );

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> shortVideoService.uploadShortVideo(1L, file));

        assertTrue(exception.getMessage().contains("exceeds maximum allowed limit of 20.0 seconds"));
        verify(videoStorageService, times(1)).deleteFile(physicalFile.getAbsolutePath());
    }

    @Test
    @DisplayName("Should reject empty video file")
    void testRejectEmptyFile() {
        MockMultipartFile emptyFile = new MockMultipartFile("video", "empty.mp4", "video/mp4", new byte[0]);
        assertThrows(IllegalArgumentException.class, () -> shortVideoService.uploadShortVideo(1L, emptyFile));
    }

    @Test
    @DisplayName("Should reject corrupt video file and delete temporary storage")
    void testRejectCorruptVideoFile() throws Exception {
        byte[] garbage = new byte[]{0, 1, 2, 3, 4, 5, 6, 7};
        MockMultipartFile file = new MockMultipartFile("video", "corrupt.mp4", "video/mp4", garbage);

        File physicalFile = tempDir.resolve("uuid-corrupt.mp4").toFile();
        try (FileOutputStream fos = new FileOutputStream(physicalFile)) {
            fos.write(garbage);
        }

        VideoStorageService.StoredVideoFile stored = VideoStorageService.StoredVideoFile.builder()
                .videoId("uuid-corrupt")
                .storagePath(physicalFile.getAbsolutePath())
                .file(physicalFile)
                .fileSize((long) garbage.length)
                .build();

        when(videoStorageService.storeVideo(any())).thenReturn(stored);
        when(videoMetadataExtractor.extractMetadata(any())).thenThrow(new IllegalArgumentException("Corrupt video file"));

        assertThrows(IllegalArgumentException.class, () -> shortVideoService.uploadShortVideo(1L, file));
        verify(videoStorageService, times(1)).deleteFile(physicalFile.getAbsolutePath());
    }

    @Test
    @DisplayName("Should prevent unauthorized user from deleting another user's video")
    void testUnauthorizedVideoDeletion() {
        ShortVideo video = ShortVideo.builder()
                .id(1L)
                .videoId("uuid-123")
                .user(testUser) // Owner is userId 1
                .storagePath("/path/to/vid.mp4")
                .build();

        when(shortVideoRepository.findByVideoId("uuid-123")).thenReturn(Optional.of(video));

        User otherUser = User.builder()
                .id(2L)
                .role(User.Role.USER)
                .build();
        when(userRepository.findById(2L)).thenReturn(Optional.of(otherUser));

        assertThrows(SecurityException.class, () -> shortVideoService.deleteShortVideo(2L, "uuid-123"));
    }
}
