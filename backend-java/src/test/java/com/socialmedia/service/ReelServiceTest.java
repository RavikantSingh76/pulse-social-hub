package com.socialmedia.service;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.entity.AudioTrack;
import com.socialmedia.entity.Reel;
import com.socialmedia.entity.User;
import com.socialmedia.repository.AudioTrackRepository;
import com.socialmedia.repository.ReelRepository;
import com.socialmedia.repository.UserRepository;
import com.socialmedia.util.TestVideoGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReelServiceTest {

    @Mock
    private ReelRepository reelRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AudioTrackRepository audioTrackRepository;

    @Mock
    private VideoStorageService videoStorageService;

    @Mock
    private VideoMetadataExtractor metadataExtractor;

    @Mock
    private AudioTrackService audioTrackService;

    @Mock
    private AuthService authService;

    @Mock
    private FFmpegAudioMixerService ffmpegAudioMixerService;

    @InjectMocks
    private ReelService reelService;

    private User testUser;
    private AudioTrack testTrack;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testcreator");
        testUser.setDisplayName("Test Creator");

        testTrack = new AudioTrack();
        testTrack.setId(50L);
        testTrack.setTitle("Neon Drift");
        testTrack.setArtist("Kavinsky");
        testTrack.setAudioUrl("/uploads/audio/neon.mp3");
        testTrack.setDuration(120.0);
        testTrack.setUsageCount(10L);

        lenient().when(authService.mapToUserResponse(any(), any()))
                .thenReturn(UserResponse.builder().id(1L).username("testcreator").build());
    }

    @Test
    @DisplayName("Should accept and process valid video <= 20.0 seconds")
    void testCreateReel_ValidVideo() throws IOException {
        byte[] mp4Bytes = TestVideoGenerator.createMp4Video(15.0);
        MockMultipartFile videoFile = new MockMultipartFile("video", "clip.mp4", "video/mp4", mp4Bytes);

        VideoStorageService.StoredVideoFile stored = VideoStorageService.StoredVideoFile.builder()
                .videoId("v123")
                .filename("v123.mp4")
                .fileUrl("/uploads/videos/v123.mp4")
                .storagePath("uploads/videos/v123.mp4")
                .file(new File("uploads/videos/v123.mp4"))
                .fileSize(mp4Bytes.length)
                .checksumSha256("sha256dummy")
                .build();

        VideoMetadataExtractor.VideoMetadata meta = VideoMetadataExtractor.VideoMetadata.builder()
                .durationSeconds(15.0)
                .format("mp4")
                .fileSize((long) mp4Bytes.length)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(videoStorageService.storeVideo(videoFile)).thenReturn(stored);
        when(metadataExtractor.extractMetadata(stored.getFile())).thenReturn(meta);
        when(reelRepository.save(any(Reel.class))).thenAnswer(inv -> {
            Reel r = inv.getArgument(0);
            r.setId(500L);
            return r;
        });

        ReelResponse response = reelService.createReel(1L, videoFile, "Awesome short reel #viral", null, 0.0, 20.0, 100, 80, null, null);

        assertNotNull(response);
        assertEquals(500L, response.getId());
        assertEquals("Awesome short reel #viral", response.getCaption());
        assertEquals("testcreator", response.getUser().getUsername());
        verify(reelRepository, atLeastOnce()).save(any(Reel.class));
    }

    @Test
    @DisplayName("Should accept exact 20.0 seconds video")
    void testCreateReel_Exact20Seconds() throws IOException {
        byte[] mp4Bytes = TestVideoGenerator.createMp4Video(20.0);
        MockMultipartFile videoFile = new MockMultipartFile("video", "twenty_sec.mp4", "video/mp4", mp4Bytes);

        VideoStorageService.StoredVideoFile stored = VideoStorageService.StoredVideoFile.builder()
                .videoId("v124")
                .filename("v124.mp4")
                .fileUrl("/uploads/videos/v124.mp4")
                .storagePath("uploads/videos/v124.mp4")
                .file(new File("uploads/videos/v124.mp4"))
                .fileSize(mp4Bytes.length)
                .checksumSha256("sha256dummy")
                .build();

        VideoMetadataExtractor.VideoMetadata meta = VideoMetadataExtractor.VideoMetadata.builder()
                .durationSeconds(20.0)
                .format("mp4")
                .fileSize((long) mp4Bytes.length)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(videoStorageService.storeVideo(videoFile)).thenReturn(stored);
        when(metadataExtractor.extractMetadata(stored.getFile())).thenReturn(meta);
        when(reelRepository.save(any(Reel.class))).thenAnswer(inv -> {
            Reel r = inv.getArgument(0);
            r.setId(501L);
            return r;
        });

        ReelResponse response = reelService.createReel(1L, videoFile, "Exact 20s video", null, 0.0, 20.0, 100, 80, null, null);

        assertNotNull(response);
        assertEquals(501L, response.getId());
    }

    @Test
    @DisplayName("Should reject video > 20.0 seconds with IllegalArgumentException")
    void testCreateReel_RejectOver20Seconds() throws IOException {
        byte[] mp4Bytes = TestVideoGenerator.createMp4Video(20.5);
        MockMultipartFile videoFile = new MockMultipartFile("video", "long.mp4", "video/mp4", mp4Bytes);

        VideoStorageService.StoredVideoFile stored = VideoStorageService.StoredVideoFile.builder()
                .videoId("v125")
                .filename("v125.mp4")
                .fileUrl("/uploads/videos/v125.mp4")
                .storagePath("uploads/videos/v125.mp4")
                .file(new File("uploads/videos/v125.mp4"))
                .fileSize(mp4Bytes.length)
                .checksumSha256("sha256dummy")
                .build();

        VideoMetadataExtractor.VideoMetadata meta = VideoMetadataExtractor.VideoMetadata.builder()
                .durationSeconds(20.5)
                .format("mp4")
                .fileSize((long) mp4Bytes.length)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(videoStorageService.storeVideo(videoFile)).thenReturn(stored);
        when(metadataExtractor.extractMetadata(stored.getFile())).thenReturn(meta);

        assertThrows(IllegalArgumentException.class, () ->
                reelService.createReel(1L, videoFile, "Too long video", null, 0.0, 20.0, 100, 80, null, null));

        verify(videoStorageService, times(1)).deleteFile(stored.getStoragePath());
    }

    @Test
    @DisplayName("Should reject empty video file")
    void testCreateReel_RejectEmpty() {
        MockMultipartFile emptyFile = new MockMultipartFile("video", "empty.mp4", "video/mp4", new byte[0]);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        assertThrows(IllegalArgumentException.class, () ->
                reelService.createReel(1L, emptyFile, null, null, 0.0, 20.0, 100, 80, null, null));
    }

    @Test
    @DisplayName("Should reject unsupported non-video format")
    void testCreateReel_RejectUnsupportedFormat() {
        MockMultipartFile textFile = new MockMultipartFile("video", "test.txt", "text/plain", "hello world".getBytes());

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        assertThrows(IllegalArgumentException.class, () ->
                reelService.createReel(1L, textFile, null, null, 0.0, 20.0, 100, 80, null, null));
    }

    @Test
    @DisplayName("Should attach audio track and increment usage count")
    void testCreateReel_WithAudioTrack() throws IOException {
        byte[] mp4Bytes = TestVideoGenerator.createMp4Video(10.0);
        MockMultipartFile videoFile = new MockMultipartFile("video", "clip.mp4", "video/mp4", mp4Bytes);

        VideoStorageService.StoredVideoFile stored = VideoStorageService.StoredVideoFile.builder()
                .videoId("v126")
                .filename("v126.mp4")
                .fileUrl("/uploads/videos/v126.mp4")
                .storagePath("uploads/videos/v126.mp4")
                .file(new File("uploads/videos/v126.mp4"))
                .fileSize(mp4Bytes.length)
                .checksumSha256("sha256dummy")
                .build();

        VideoMetadataExtractor.VideoMetadata meta = VideoMetadataExtractor.VideoMetadata.builder()
                .durationSeconds(10.0)
                .format("mp4")
                .fileSize((long) mp4Bytes.length)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(videoStorageService.storeVideo(videoFile)).thenReturn(stored);
        when(metadataExtractor.extractMetadata(stored.getFile())).thenReturn(meta);
        when(audioTrackRepository.findById(50L)).thenReturn(Optional.of(testTrack));
        when(reelRepository.save(any(Reel.class))).thenAnswer(inv -> {
            Reel r = inv.getArgument(0);
            r.setId(505L);
            return r;
        });

        ReelResponse response = reelService.createReel(1L, videoFile, "With Soundtrack", 50L, 15.0, 20.0, 80, 90, null, null);

        assertNotNull(response);
        assertEquals(505L, response.getId());
        verify(audioTrackService, times(1)).incrementUsage(50L);
    }

    @Test
    @DisplayName("Should allow owner to delete reel and reject non-owner")
    void testDeleteReel_Authorization() {
        Reel sampleReel = new Reel();
        sampleReel.setId(600L);
        sampleReel.setUser(testUser);
        sampleReel.setStoragePath("uploads/videos/v600.mp4");

        when(reelRepository.findById(600L)).thenReturn(Optional.of(sampleReel));

        // Owner deletes
        reelService.deleteReel(600L, 1L);
        verify(reelRepository, times(1)).delete(sampleReel);
        verify(videoStorageService, times(1)).deleteFile("uploads/videos/v600.mp4");

        // Non-owner fails
        assertThrows(IllegalStateException.class, () -> reelService.deleteReel(600L, 999L));
    }

    @Test
    @DisplayName("Should increment view count for reel")
    void testRecordView() {
        reelService.recordView(600L);
        verify(reelRepository, times(1)).incrementViewCount(600L);
    }
}
