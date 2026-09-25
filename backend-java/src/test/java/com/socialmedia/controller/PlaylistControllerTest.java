package com.socialmedia.controller;

import com.socialmedia.security.JwtTokenProvider;
import com.socialmedia.dto.Dtos.*;
import com.socialmedia.security.CustomUserDetailsService;
import com.socialmedia.service.PlaylistService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = PlaylistController.class)
@AutoConfigureMockMvc(addFilters = false)
public class PlaylistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PlaylistService playlistService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("GET /api/playlists - List Playlists")
    void testGetPlaylists() throws Exception {
        PlaylistResponse p1 = PlaylistResponse.builder()
                .id(1L)
                .name("Top Hits")
                .videoCount(12)
                .visibility("PUBLIC")
                .build();

        when(playlistService.getAccessiblePlaylists(any(), eq(1), eq(20))).thenReturn(List.of(p1));

        mockMvc.perform(get("/api/playlists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("GET /api/playlists/{id} - Get Playlist By Id")
    void testGetPlaylistById() throws Exception {
        PlaylistResponse p1 = PlaylistResponse.builder()
                .id(1L)
                .name("Top Hits")
                .videoCount(12)
                .visibility("PUBLIC")
                .build();

        when(playlistService.getPlaylistById(eq(1L), any())).thenReturn(p1);

        mockMvc.perform(get("/api/playlists/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Top Hits"));
    }
}
