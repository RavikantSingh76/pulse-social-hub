package com.socialmedia.controller;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.entity.User;
import com.socialmedia.repository.UserRepository;
import com.socialmedia.service.ReelService;
import com.socialmedia.util.TestVideoGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class ReelIntegrationAndStressTest {

    @Autowired
    private ReelService reelService;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private byte[] sample15SecMp4;

    @BeforeEach
    void setUp() throws IOException {
        testUser = userRepository.findByUsernameIgnoreCase("reel_stress_tester").orElseGet(() -> {
            User u = User.builder()
                    .username("reel_stress_tester")
                    .email("reel_stress@pulse.in")
                    .password("Password@123")
                    .displayName("Reel Stress Tester")
                    .role(User.Role.USER)
                    .build();
            return userRepository.save(u);
        });

        sample15SecMp4 = TestVideoGenerator.createMp4Video(15.0);
    }

    @Test
    @DisplayName("Stress Test: 50 Concurrent 20-Second Reel Uploads without OOM or Race Conditions")
    void testConcurrentReelUploads() throws InterruptedException {
        int totalRequests = 50;
        int threadPoolSize = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadPoolSize);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(totalRequests);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger errorCount = new AtomicInteger(0);
        List<Long> createdReelIds = new CopyOnWriteArrayList<>();

        for (int i = 0; i < totalRequests; i++) {
            final int index = i;
            executor.submit(() -> {
                try {
                    startLatch.await(); // wait for all threads to align
                    MockMultipartFile file = new MockMultipartFile(
                            "video",
                            "concurrent_reel_" + index + ".mp4",
                            "video/mp4",
                            sample15SecMp4
                    );

                    ReelResponse resp = reelService.createReel(
                            testUser.getId(),
                            file,
                            "Concurrent 20s Reel #" + index,
                            null,
                            0.0,
                            20.0,
                            100,
                            80,
                            null,
                            null
                    );
                    if (resp != null && resp.getId() != null) {
                        successCount.incrementAndGet();
                        createdReelIds.add(resp.getId());
                    } else {
                        errorCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    errorCount.incrementAndGet();
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        // Trigger concurrent execution
        startLatch.countDown();
        boolean completed = doneLatch.await(60, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(completed, "All 50 uploads should complete within 60 seconds");
        assertEquals(50, successCount.get(), "All 50 uploads should succeed");
        assertEquals(0, errorCount.get(), "There should be zero upload errors");
        assertEquals(50, createdReelIds.size(), "50 unique reels should be created in DB");

        // Verify distinct IDs
        long distinctIds = createdReelIds.stream().distinct().count();
        assertEquals(50, distinctIds, "All created reel IDs should be unique");
    }
}
