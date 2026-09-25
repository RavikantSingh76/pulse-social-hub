package com.socialmedia.controller;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.security.CustomUserDetailsService.UserPrincipal;
import com.socialmedia.service.ReelService;
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
class ReelControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReelService reelService;

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
    @DisplayName("POST /api/reels - 201 Created for valid reel creation")
    void testCreateReel_Success() throws Exception {
        UserPrincipal principal = createPrincipal(1L, "ravikant");

        MockMultipartFile videoFile = new MockMultipartFile(
                "video",
                "sample.mp4",
                "video/mp4",
                new byte[]{1, 2, 3, 4}
        );

        ReelResponse expected = new ReelResponse();
        expected.setId(101L);
        expected.setVideoUrl("/uploads/reels/sample.mp4");
        expected.setDuration(15.0);
        expected.setCaption("Summer vibes");
        expected.setUser(UserResponse.builder().id(1L).username("ravikant").build());

        when(reelService.createReel(eq(1L), any(), any(), any(), any(), any(), any(), any(), any(), any())).thenReturn(expected);

        mockMvc.perform(multipart("/api/reels")
                        .file(videoFile)
                        .param("caption", "Summer vibes")
                        .with(user(principal)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(101))
                .andExpect(jsonPath("$.data.caption").value("Summer vibes"));
    }

    @Test
    @DisplayName("GET /api/reels - 200 OK returns paginated feed")
    void testGetReelsFeed() throws Exception {
        ReelResponse r1 = new ReelResponse();
        r1.setId(201L);
        r1.setCaption("Reel 1");

        ReelFeedResponse feedResp = ReelFeedResponse.builder()
                .reels(List.of(r1))
                .page(1)
                .limit(10)
                .total(1L)
                .hasMore(false)
                .build();

        when(reelService.getFeedReels(eq(1), eq(10), any())).thenReturn(feedResp);

        mockMvc.perform(get("/api/reels?page=1&limit=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.reels[0].id").value(201));
    }

    @Test
    @DisplayName("GET /api/reels/{id} - 200 OK returns single reel")
    void testGetReelById() throws Exception {
        ReelResponse r = new ReelResponse();
        r.setId(301L);
        r.setCaption("Single Reel");

        when(reelService.getReelById(eq(301L), any())).thenReturn(r);

        mockMvc.perform(get("/api/reels/301"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(301));
    }

    @Test
    @DisplayName("DELETE /api/reels/{id} - 200 OK deletes reel")
    void testDeleteReel() throws Exception {
        UserPrincipal principal = createPrincipal(1L, "ravikant");
        doNothing().when(reelService).deleteReel(301L, 1L);

        mockMvc.perform(delete("/api/reels/301").with(user(principal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("POST /api/reels/{id}/view - 200 OK records view")
    void testRecordView() throws Exception {
        doNothing().when(reelService).recordView(301L);

        mockMvc.perform(post("/api/reels/301/view"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
