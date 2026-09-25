package com.socialmedia.controller;

import com.socialmedia.dto.Dtos.ShortVideoResponse;
import com.socialmedia.entity.User;
import com.socialmedia.repository.UserRepository;
import com.socialmedia.service.ShortVideoService;
import com.socialmedia.util.TestVideoGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class ShortVideoIntegrationAndStressTest {

    @Autowired
    private ShortVideoService shortVideoService;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = userRepository.findByUsernameIgnoreCase("stress_tester").orElseGet(() -> {
            User u = User.builder()
                    .username("stress_tester")
                    .email("stress_tester@pulse.in")
                    .password("Password@123")
                    .displayName("Stress Test User")
                    .role(User.Role.USER)
                    .build();
            return userRepository.save(u);
        });
    }

    @Test
    @DisplayName("Stress Test: Concurrently upload 100 short videos without OOM or crash")
    void test100ConcurrentUploadsStressScenario() throws InterruptedException, ExecutionException {
        int totalUploads = 100;
        int threadPoolSize = 16;
        ExecutorService executor = Executors.newFixedThreadPool(threadPoolSize);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch endLatch = new CountDownLatch(totalUploads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);
        List<Future<ShortVideoResponse>> futures = new ArrayList<>();

        for (int i = 0; i < totalUploads; i++) {
            final int index = i;
            futures.add(executor.submit(() -> {
                try {
                    startLatch.await(); // Synchronize starting burst
                    double duration = 5.0 + (index % 15); // durations range from 5s to 19s
                    byte[] videoBytes = TestVideoGenerator.createMp4Video(duration, index);
                    MockMultipartFile file = new MockMultipartFile("video", "stress_" + index + ".mp4", "video/mp4", videoBytes);

                    ShortVideoResponse response = shortVideoService.uploadShortVideo(testUser.getId(), file);
                    if (response != null && response.getVideoId() != null) {
                        successCount.incrementAndGet();
                    } else {
                        failureCount.incrementAndGet();
                    }
                    return response;
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                    return null;
                } finally {
                    endLatch.countDown();
                }
            }));
        }

        // Fire all 100 upload requests simultaneously
        startLatch.countDown();

        boolean completedInTime = endLatch.await(60, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(completedInTime, "100 concurrent uploads should complete within 60 seconds");
        assertEquals(100, successCount.get(), "All 100 uploads should succeed");
        assertEquals(0, failureCount.get(), "Zero failures expected during 100-video upload burst");

        for (Future<ShortVideoResponse> future : futures) {
            ShortVideoResponse resp = future.get();
            assertNotNull(resp);
            assertTrue(resp.getDuration() <= 20.0);
            assertNotNull(resp.getFileUrl());
        }
    }
}
