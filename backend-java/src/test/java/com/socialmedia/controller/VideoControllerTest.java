package com.socialmedia.controller;

import com.socialmedia.dto.Dtos.ShortVideoResponse;
import com.socialmedia.security.CustomUserDetailsService.UserPrincipal;
import com.socialmedia.service.PostService;
import com.socialmedia.service.ShortVideoService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class VideoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ShortVideoService shortVideoService;

    @MockBean
    private PostService postService;

    private UserPrincipal createPrincipal(Long id, String username) {
        return new UserPrincipal(
                id,
                username,
                username + "@test.com",
                "password",
                false,
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }

    @Test
    @DisplayName("POST /api/videos/upload - 201 Created for valid video <= 20s")
    void testUploadVideoSuccess() throws Exception {
        UserPrincipal principal = createPrincipal(1L, "ravikant");

        MockMultipartFile file = new MockMultipartFile(
                "video",
                "short_clip.mp4",
                "video/mp4",
                new byte[]{1, 2, 3, 4}
        );

        ShortVideoResponse responseDto = ShortVideoResponse.builder()
                .videoId("uuid-video-123")
                .status("UPLOADED")
                .duration(14.5)
                .fileSize(1024L)
                .fileUrl("/uploads/videos/uuid-video-123.mp4")
                .build();

        when(shortVideoService.uploadShortVideo(eq(1L), any())).thenReturn(responseDto);

        mockMvc.perform(multipart("/api/videos/upload")
                        .file(file)
                        .with(user(principal)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.videoId").value("uuid-video-123"))
                .andExpect(jsonPath("$.data.duration").value(14.5))
                .andExpect(jsonPath("$.data.status").value("UPLOADED"));
    }

    @Test
    @DisplayName("POST /api/videos/upload - 400 Bad Request when video duration exceeds 20.0 seconds")
    void testUploadVideoExceedingDuration() throws Exception {
        UserPrincipal principal = createPrincipal(1L, "ravikant");

        MockMultipartFile file = new MockMultipartFile(
                "video",
                "long_clip.mp4",
                "video/mp4",
                new byte[]{1, 2, 3, 4}
        );

        when(shortVideoService.uploadShortVideo(eq(1L), any()))
                .thenThrow(new IllegalArgumentException("Video duration (25.40s) exceeds maximum allowed limit of 20.0 seconds"));

        mockMvc.perform(multipart("/api/videos/upload")
                        .file(file)
                        .with(user(principal)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Video duration (25.40s) exceeds maximum allowed limit of 20.0 seconds"));
    }

    @Test
    @DisplayName("POST /api/videos/upload - 401/403 Unauthorized when no authentication token provided")
    void testUploadVideoUnauthorized() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "video",
                "test.mp4",
                "video/mp4",
                new byte[]{1, 2, 3, 4}
        );

        mockMvc.perform(multipart("/api/videos/upload")
                        .file(file))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("GET /api/videos/{videoId}/status - 200 OK")
    void testGetVideoStatus() throws Exception {
        ShortVideoResponse responseDto = ShortVideoResponse.builder()
                .videoId("uuid-video-123")
                .status("READY")
                .duration(18.0)
                .build();

        when(shortVideoService.getVideoByVideoId("uuid-video-123")).thenReturn(responseDto);

        mockMvc.perform(get("/api/videos/uuid-video-123/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("READY"))
                .andExpect(jsonPath("$.data.duration").value(18.0));
    }

    @Test
    @DisplayName("DELETE /api/videos/{videoId} - 200 OK")
    void testDeleteVideo() throws Exception {
        UserPrincipal principal = createPrincipal(1L, "ravikant");

        doNothing().when(shortVideoService).deleteShortVideo(1L, "uuid-video-123");

        mockMvc.perform(delete("/api/videos/uuid-video-123")
                        .with(user(principal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Video deleted successfully"));
    }
}
