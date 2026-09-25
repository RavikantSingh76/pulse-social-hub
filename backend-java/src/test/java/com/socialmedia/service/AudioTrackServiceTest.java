package com.socialmedia.service;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.entity.AudioTrack;
import com.socialmedia.entity.User;
import com.socialmedia.repository.AudioTrackRepository;
import com.socialmedia.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.mock.web.MockMultipartFile;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AudioTrackServiceTest {

    @Mock
    private AudioTrackRepository audioTrackRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AudioTrackService audioTrackService;

    private User sampleUser;
    private AudioTrack sampleTrack;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(10L);
        sampleUser.setUsername("testuser");
        sampleUser.setDisplayName("Test User");

        sampleTrack = new AudioTrack();
        sampleTrack.setId(100L);
        sampleTrack.setTitle("Midnight City Beat");
        sampleTrack.setArtist("SynthMaster");
        sampleTrack.setGenre("Synthwave");
        sampleTrack.setAudioUrl("/uploads/audio/synth.mp3");
        sampleTrack.setDuration(180.0);
        sampleTrack.setUsageCount(25L);
        sampleTrack.setSourceType(AudioTrack.SourceType.USER_UPLOADED);
        sampleTrack.setLicenseType(AudioTrack.LicenseType.ROYALTY_FREE);
        sampleTrack.setCreatedBy(sampleUser);
    }

    @Test
    @DisplayName("Should search audio tracks with keyword")
    void testSearchTracks() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<AudioTrack> page = new PageImpl<>(List.of(sampleTrack), pageable, 1);

        when(audioTrackRepository.searchTracks(eq("SynthMaster"), any(Pageable.class))).thenReturn(page);

        List<AudioTrackResponse> result = audioTrackService.searchAudio("SynthMaster", 1, 10);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Midnight City Beat", result.get(0).getTitle());
        assertEquals("SynthMaster", result.get(0).getArtist());
    }

    @Test
    @DisplayName("Should fetch trending audio tracks")
    void testGetTrendingTracks() {
        Pageable pageable = PageRequest.of(0, 5);
        Page<AudioTrack> page = new PageImpl<>(List.of(sampleTrack), pageable, 1);

        when(audioTrackRepository.findTrendingTracks(any(Pageable.class))).thenReturn(page);

        List<AudioTrackResponse> result = audioTrackService.getTrendingAudio(1, 5);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(25L, result.get(0).getUsageCount());
    }

    @Test
    @DisplayName("Should get track by ID")
    void testGetTrackById() {
        when(audioTrackRepository.findById(100L)).thenReturn(Optional.of(sampleTrack));

        AudioTrackResponse res = audioTrackService.getAudioById(100L);

        assertNotNull(res);
        assertEquals("Midnight City Beat", res.getTitle());
    }

    @Test
    @DisplayName("Should throw exception when track not found")
    void testGetTrackById_NotFound() {
        when(audioTrackRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> audioTrackService.getAudioById(999L));
    }

    @Test
    @DisplayName("Should upload audio track successfully")
    void testUploadTrack() {
        MockMultipartFile file = new MockMultipartFile(
                "audioFile",
                "beat.mp3",
                "audio/mpeg",
                new byte[]{1, 2, 3, 4}
        );

        when(userRepository.findById(10L)).thenReturn(Optional.of(sampleUser));
        when(audioTrackRepository.save(any(AudioTrack.class))).thenAnswer(inv -> {
            AudioTrack t = inv.getArgument(0);
            t.setId(200L);
            return t;
        });

        AudioTrackResponse res = audioTrackService.uploadAudioTrack(
                10L,
                "Cyber Groove",
                "DJ Pulse",
                120.0,
                "EDM",
                "PLATFORM_LICENSED",
                "ROYALTY_FREE",
                "Pulse",
                file,
                null
        );

        assertNotNull(res);
        assertEquals("Cyber Groove", res.getTitle());
        assertEquals("DJ Pulse", res.getArtist());
        verify(audioTrackRepository, times(1)).save(any(AudioTrack.class));
    }

    @Test
    @DisplayName("Should delete track by creator")
    void testDeleteTrack_ByCreator() {
        when(audioTrackRepository.findById(100L)).thenReturn(Optional.of(sampleTrack));

        audioTrackService.deleteAudioTrack(100L, 10L);

        assertFalse(sampleTrack.getIsActive());
        verify(audioTrackRepository, times(1)).save(sampleTrack);
    }

    @Test
    @DisplayName("Should throw exception when unauthorized user tries to delete track")
    void testDeleteTrack_Unauthorized() {
        when(audioTrackRepository.findById(100L)).thenReturn(Optional.of(sampleTrack));

        assertThrows(IllegalStateException.class, () -> audioTrackService.deleteAudioTrack(100L, 999L));
    }
}
