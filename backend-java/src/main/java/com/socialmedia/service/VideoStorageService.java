package com.socialmedia.service;

import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

@Service
@Slf4j
public class VideoStorageService {

    @Value("${app.video.upload-dir:./uploads/videos}")
    private String uploadDir;

    @Getter
    @Builder
    public static class StoredVideoFile {
        private final String videoId;
        private final String filename;
        private final String fileUrl;
        private final String storagePath;
        private final File file;
        private final long fileSize;
        private final String checksumSha256;
    }

    /**
     * Streams incoming MultipartFile to a secure UUID-named file on disk without loading into heap memory.
     * Computes SHA-256 checksum on the fly.
     */
    public StoredVideoFile storeVideo(MultipartFile multipartFile) throws IOException {
        if (multipartFile == null || multipartFile.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty video file");
        }

        // Determine extension safely
        String originalFilename = multipartFile.getOriginalFilename();
        String extension = ".mp4";
        if (originalFilename != null && originalFilename.contains(".")) {
            String rawExt = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            if (rawExt.equals(".mp4") || rawExt.equals(".webm") || rawExt.equals(".m4v") || rawExt.equals(".mov")) {
                extension = rawExt;
            }
        } else if ("video/webm".equalsIgnoreCase(multipartFile.getContentType())) {
            extension = ".webm";
        }

        String videoId = UUID.randomUUID().toString();
        String uniqueFilename = videoId + extension;

        Path targetDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!Files.exists(targetDir)) {
            Files.createDirectories(targetDir);
        }

        Path targetPath = targetDir.resolve(uniqueFilename).normalize();

        // Path traversal validation check
        if (!targetPath.startsWith(targetDir)) {
            throw new SecurityException("Path traversal attempt detected: " + uniqueFilename);
        }

        MessageDigest md;
        try {
            md = MessageDigest.getInstance("SHA-256");
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }

        long bytesWritten = 0;
        try (InputStream in = multipartFile.getInputStream();
             DigestInputStream dis = new DigestInputStream(in, md);
             OutputStream out = new BufferedOutputStream(Files.newOutputStream(targetPath))) {

            byte[] buffer = new byte[8192];
            int read;
            while ((read = dis.read(buffer)) != -1) {
                out.write(buffer, 0, read);
                bytesWritten += read;
            }
            out.flush();
        }

        String checksum = HexFormat.of().formatHex(md.digest());
        String fileUrl = "/uploads/videos/" + uniqueFilename;

        log.info("Stored video file on disk: videoId={}, size={} bytes, path={}", videoId, bytesWritten, targetPath);

        return StoredVideoFile.builder()
                .videoId(videoId)
                .filename(uniqueFilename)
                .fileUrl(fileUrl)
                .storagePath(targetPath.toString())
                .file(targetPath.toFile())
                .fileSize(bytesWritten)
                .checksumSha256(checksum)
                .build();
    }

    /**
     * Safely deletes physical video file from disk.
     */
    public boolean deleteFile(String storagePath) {
        if (storagePath == null || storagePath.trim().isEmpty()) {
            return false;
        }
        try {
            Path path = Paths.get(storagePath).toAbsolutePath().normalize();
            Path allowedDir = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!path.startsWith(allowedDir)) {
                log.warn("Attempted to delete file outside upload directory: {}", storagePath);
                return false;
            }
            return Files.deleteIfExists(path);
        } catch (Exception e) {
            log.error("Failed to delete video file at {}: {}", storagePath, e.getMessage());
            return false;
        }
    }
}
