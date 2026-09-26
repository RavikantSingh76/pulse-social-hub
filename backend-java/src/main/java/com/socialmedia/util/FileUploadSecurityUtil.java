package com.socialmedia.util;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * FileUploadSecurityUtil
 * Centralized, production-grade utility for secure file uploads.
 * Enforces extension whitelists, MIME-type validation, path traversal prevention,
 * and directory containment checks.
 */
public final class FileUploadSecurityUtil {

    private FileUploadSecurityUtil() {}

    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList(".jpg", ".jpeg", ".png", ".webp", ".gif"))
    );

    private static final Set<String> ALLOWED_IMAGE_MIME_TYPES = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList(
                    "image/jpeg", "image/png", "image/webp", "image/gif", "image/pjpeg"
            ))
    );

    private static final Set<String> ALLOWED_VIDEO_EXTENSIONS = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList(".mp4", ".webm", ".mov"))
    );

    private static final Set<String> ALLOWED_VIDEO_MIME_TYPES = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList(
                    "video/mp4", "video/webm", "video/quicktime", "video/x-matroska"
            ))
    );

    private static final Set<String> ALLOWED_AUDIO_EXTENSIONS = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList(".mp3", ".wav", ".aac", ".m4a", ".ogg"))
    );

    private static final Set<String> ALLOWED_AUDIO_MIME_TYPES = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList(
                    "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/aac", "audio/mp4", "audio/ogg", "audio/x-m4a"
            ))
    );

    /**
     * Stores an image file securely with image extension and MIME verification.
     * Returns the relative web path (e.g. "/uploads/uuid.jpg").
     */
    public static String storeImage(MultipartFile file, String targetDir) throws IOException {
        String filename = storeFile(file, targetDir, ALLOWED_IMAGE_EXTENSIONS, ALLOWED_IMAGE_MIME_TYPES);
        return formatWebPath(targetDir, filename);
    }

    /**
     * Stores an image file securely and returns only the generated filename without directory prefix.
     */
    public static String storeImageFilename(MultipartFile file, String targetDir) throws IOException {
        return storeFile(file, targetDir, ALLOWED_IMAGE_EXTENSIONS, ALLOWED_IMAGE_MIME_TYPES);
    }

    /**
     * Stores an image or video file securely (used for posts, stories, messages).
     * Returns the relative web path (e.g. "/uploads/uuid.mp4").
     */
    public static String storeMedia(MultipartFile file, String targetDir) throws IOException {
        Set<String> combinedExts = new HashSet<>(ALLOWED_IMAGE_EXTENSIONS);
        combinedExts.addAll(ALLOWED_VIDEO_EXTENSIONS);

        Set<String> combinedMimes = new HashSet<>(ALLOWED_IMAGE_MIME_TYPES);
        combinedMimes.addAll(ALLOWED_VIDEO_MIME_TYPES);

        String filename = storeFile(file, targetDir, combinedExts, combinedMimes);
        return formatWebPath(targetDir, filename);
    }

    /**
     * Stores an audio file securely with audio extension and MIME verification.
     * Returns the generated filename.
     */
    public static String storeAudio(MultipartFile file, String targetDir) throws IOException {
        return storeFile(file, targetDir, ALLOWED_AUDIO_EXTENSIONS, ALLOWED_AUDIO_MIME_TYPES);
    }

    /**
     * Stores a file strictly verifying allowed extensions and MIME types.
     * Returns the generated random filename with extension.
     */
    public static String storeFile(MultipartFile file, String targetDir, Set<String> allowedExtensions, Set<String> allowedMimeTypes) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file cannot be empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "";
        }

        // Clean original filename to prevent null byte or path manipulation
        String cleanOriginalName = Paths.get(originalFilename).getFileName().toString();
        if (cleanOriginalName.contains("\0") || cleanOriginalName.contains("..")) {
            throw new SecurityException("Potential path traversal attack detected in filename: " + originalFilename);
        }

        // Extract extension
        int dotIndex = cleanOriginalName.lastIndexOf('.');
        if (dotIndex == -1) {
            throw new IllegalArgumentException("File must have a valid extension");
        }
        String extension = cleanOriginalName.substring(dotIndex).toLowerCase();

        if (!allowedExtensions.contains(extension)) {
            throw new IllegalArgumentException("File extension '" + extension + "' is not permitted. Allowed: " + allowedExtensions);
        }

        // Validate MIME type
        String contentType = file.getContentType();
        if (contentType != null && !contentType.isEmpty()) {
            String normalizedContentType = contentType.toLowerCase().split(";")[0].trim();
            if (!allowedMimeTypes.contains(normalizedContentType)) {
                // If content type is application/octet-stream, we rely on the strictly whitelisted extension
                if (!"application/octet-stream".equals(normalizedContentType)) {
                    throw new IllegalArgumentException("File content type '" + normalizedContentType + "' is not permitted. Allowed: " + allowedMimeTypes);
                }
            }
        }

        // Prepare target directory and verify containment
        Path dirPath = Paths.get(targetDir).toAbsolutePath().normalize();
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }

        String secureFilename = UUID.randomUUID() + extension;
        Path targetPath = dirPath.resolve(secureFilename).normalize();

        if (!targetPath.startsWith(dirPath)) {
            throw new SecurityException("Target location escapes destination directory");
        }

        try (InputStream in = file.getInputStream()) {
            Files.copy(in, targetPath, StandardCopyOption.REPLACE_EXISTING);
        }

        return secureFilename;
    }

    private static String formatWebPath(String targetDir, String filename) {
        String cleanDir = targetDir.replace('\\', '/').trim();
        if (cleanDir.startsWith("./")) {
            cleanDir = cleanDir.substring(2);
        }
        if (cleanDir.startsWith(".")) {
            cleanDir = cleanDir.substring(1);
        }
        if (!cleanDir.startsWith("/")) {
            cleanDir = "/" + cleanDir;
        }
        if (!cleanDir.endsWith("/")) {
            cleanDir = cleanDir + "/";
        }
        return cleanDir + filename;
    }
}
