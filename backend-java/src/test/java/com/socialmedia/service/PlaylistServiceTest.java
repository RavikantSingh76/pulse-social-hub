package com.socialmedia.service;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.entity.Playlist;
import com.socialmedia.entity.PlaylistVideo;
import com.socialmedia.entity.User;
import com.socialmedia.repository.PlaylistRepository;
import com.socialmedia.repository.PlaylistVideoRepository;
import com.socialmedia.repository.ReelRepository;
import com.socialmedia.repository.ShortVideoRepository;
import com.socialmedia.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PlaylistServiceTest {

    @Mock
    private PlaylistRepository playlistRepository;

    @Mock
    private PlaylistVideoRepository playlistVideoRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ReelRepository reelRepository;

    @Mock
    private ShortVideoRepository shortVideoRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private PlaylistService playlistService;

    private User testUser;
    private Playlist testPlaylist;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(playlistService, "maxVideosPerPlaylist", 100);

        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .role(User.Role.USER)
                .build();

        testPlaylist = Playlist.builder()
                .id(10L)
                .user(testUser)
                .name("My Reels Playlist")
                .description("Awesome 20s short clips")
                .visibility(Playlist.Visibility.PUBLIC)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Create Playlist - Success")
    void testCreatePlaylist() {
        CreatePlaylistRequest req = CreatePlaylistRequest.builder()
                .name("Dance Highlights")
                .description("Top viral dances")
                .visibility("PUBLIC")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(playlistRepository.save(any(Playlist.class))).thenReturn(testPlaylist);
        when(playlistRepository.findById(10L)).thenReturn(Optional.of(testPlaylist));
        when(playlistVideoRepository.findByPlaylistIdOrderByPositionAsc(10L)).thenReturn(Collections.emptyList());

        PlaylistResponse res = playlistService.createPlaylist(1L, req);

        assertNotNull(res);
        assertEquals("My Reels Playlist", res.getName());
        verify(playlistRepository, times(1)).save(any(Playlist.class));
    }

    @Test
    @DisplayName("Add Video to Playlist - Success")
    void testAddSingleVideo() {
        when(playlistRepository.findById(10L)).thenReturn(Optional.of(testPlaylist));
        when(playlistVideoRepository.countByPlaylistId(10L)).thenReturn(0L);
        when(playlistVideoRepository.findMaxPositionByPlaylistId(10L)).thenReturn(0);
        when(playlistVideoRepository.existsByPlaylistIdAndVideoId(10L, "video-1")).thenReturn(false);
        when(playlistVideoRepository.findByPlaylistIdOrderByPositionAsc(10L)).thenReturn(Collections.emptyList());

        PlaylistResponse res = playlistService.addVideosToPlaylist(10L, 1L, List.of("video-1"));

        assertNotNull(res);
        verify(playlistVideoRepository, times(1)).save(any(PlaylistVideo.class));
    }

    @Test
    @DisplayName("Reject Duplicate Video in Playlist")
    void testDuplicateVideoBlocked() {
        when(playlistRepository.findById(10L)).thenReturn(Optional.of(testPlaylist));
        when(playlistVideoRepository.countByPlaylistId(10L)).thenReturn(5L);
        when(playlistVideoRepository.existsByPlaylistIdAndVideoId(10L, "video-duplicate")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            playlistService.addVideosToPlaylist(10L, 1L, List.of("video-duplicate"));
        });

        assertTrue(ex.getMessage().contains("Duplicate videos are not allowed") || ex.getMessage().contains("already present"));
    }

    @Test
    @DisplayName("Support up to Exactly 100 Videos and Reject 101st Video")
    void test100VideoLimitCap() {
        when(playlistRepository.findById(10L)).thenReturn(Optional.of(testPlaylist));
        when(playlistVideoRepository.countByPlaylistId(10L)).thenReturn(99L);
        when(playlistVideoRepository.findMaxPositionByPlaylistId(10L)).thenReturn(99);
        when(playlistVideoRepository.existsByPlaylistIdAndVideoId(10L, "video-100")).thenReturn(false);
        when(playlistVideoRepository.findByPlaylistIdOrderByPositionAsc(10L)).thenReturn(Collections.emptyList());

        // 1. Adding 100th video succeeds
        PlaylistResponse res = playlistService.addVideosToPlaylist(10L, 1L, List.of("video-100"));
        assertNotNull(res);

        // 2. Adding 101st video fails with limit error
        when(playlistVideoRepository.countByPlaylistId(10L)).thenReturn(100L);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            playlistService.addVideosToPlaylist(10L, 1L, List.of("video-101"));
        });

        assertTrue(ex.getMessage().contains("exceeded") || ex.getMessage().contains("100"));
    }

    @Test
    @DisplayName("Bulk Add Videos - Exceeding 100 Videos Rejected Safely")
    void testBulkAddExceedingLimit() {
        when(playlistRepository.findById(10L)).thenReturn(Optional.of(testPlaylist));
        when(playlistVideoRepository.countByPlaylistId(10L)).thenReturn(95L);

        List<String> bulkVideos = List.of("v1", "v2", "v3", "v4", "v5", "v6"); // 95 + 6 = 101

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            playlistService.addVideosToPlaylist(10L, 1L, bulkVideos);
        });

        assertTrue(ex.getMessage().contains("limit") || ex.getMessage().contains("100"));
    }

    @Test
    @DisplayName("Remove Video and Re-index Positions")
    void testRemoveVideoFromPlaylist() {
        PlaylistVideo pv = PlaylistVideo.builder()
                .id(101L)
                .playlist(testPlaylist)
                .videoId("video-rem")
                .position(2)
                .build();

        PlaylistVideo remaining1 = PlaylistVideo.builder().id(100L).playlist(testPlaylist).videoId("video-1").position(1).build();
        PlaylistVideo remaining3 = PlaylistVideo.builder().id(102L).playlist(testPlaylist).videoId("video-3").position(3).build();

        when(playlistRepository.findById(10L)).thenReturn(Optional.of(testPlaylist));
        when(playlistVideoRepository.findByPlaylistIdAndVideoId(10L, "video-rem")).thenReturn(Optional.of(pv));
        when(playlistVideoRepository.findByPlaylistIdOrderByPositionAsc(10L))
                .thenReturn(List.of(remaining1, remaining3));

        PlaylistResponse res = playlistService.removeVideoFromPlaylist(10L, 1L, "video-rem");

        assertNotNull(res);
        verify(playlistVideoRepository, times(1)).delete(pv);
        // remaining3 should be updated to position 2
        assertEquals(2, remaining3.getPosition());
    }

    @Test
    @DisplayName("Reorder 100 Videos in Playlist")
    void testReorderPlaylistVideos() {
        List<PlaylistVideo> existing = new ArrayList<>();
        List<String> newOrder = new ArrayList<>();

        for (int i = 1; i <= 100; i++) {
            String vid = "vid-" + i;
            existing.add(PlaylistVideo.builder()
                    .id((long) i)
                    .playlist(testPlaylist)
                    .videoId(vid)
                    .position(i)
                    .build());
        }

        // Reverse order
        for (int i = 100; i >= 1; i--) {
            newOrder.add("vid-" + i);
        }

        when(playlistRepository.findById(10L)).thenReturn(Optional.of(testPlaylist));
        when(playlistVideoRepository.findByPlaylistIdOrderByPositionAsc(10L)).thenReturn(existing);

        PlaylistResponse res = playlistService.reorderVideos(10L, 1L, newOrder);

        assertNotNull(res);
        // First video in newOrder ("vid-100") should now have position 1
        assertEquals(1, existing.get(99).getPosition());
    }

    @Test
    @DisplayName("Unauthorized Modification Prevented")
    void testUnauthorizedModification() {
        when(playlistRepository.findById(10L)).thenReturn(Optional.of(testPlaylist));
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            playlistService.addVideosToPlaylist(10L, 999L, List.of("vid-x"));
        });

        assertTrue(ex.getMessage().contains("Unauthorized"));
    }
}
