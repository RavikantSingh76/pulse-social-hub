package com.socialmedia.service;

import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;

@Component
@Slf4j
public class VideoMetadataExtractor {

    @Getter
    @Builder
    public static class VideoMetadata {
        private final double durationSeconds;
        private final String format;
        private final String mimeType;
        private final long fileSize;
    }

    /**
     * Extracts video metadata (duration, format, MIME type) directly from disk file.
     * Memory-safe with O(1) heap allocation (uses file channel seeking).
     */
    public VideoMetadata extractMetadata(File file) throws IOException {
        if (file == null || !file.exists() || file.length() == 0) {
            throw new IllegalArgumentException("Video file is empty or missing");
        }

        long fileSize = file.length();
        if (fileSize < 16) {
            throw new IllegalArgumentException("Corrupt video file: file size too small (" + fileSize + " bytes)");
        }

        try (RandomAccessFile raf = new RandomAccessFile(file, "r");
             FileChannel channel = raf.getChannel()) {

            // 1. Read first 12 bytes to inspect magic header
            ByteBuffer header = ByteBuffer.allocate(12);
            channel.read(header);
            header.flip();

            byte[] bytes12 = header.array();

            // Check WebM / Matroska magic bytes (0x1A 0x45 0xDF 0xA3)
            if (isWebMHeader(bytes12)) {
                double duration = parseWebmDuration(channel, fileSize);
                return VideoMetadata.builder()
                        .durationSeconds(duration)
                        .format("WEBM")
                        .mimeType("video/webm")
                        .fileSize(fileSize)
                        .build();
            }

            // Check MP4 / QuickTime box format
            if (isMp4Header(bytes12)) {
                channel.position(0);
                double duration = parseMp4Duration(channel, fileSize);
                return VideoMetadata.builder()
                        .durationSeconds(duration)
                        .format("MP4")
                        .mimeType("video/mp4")
                        .fileSize(fileSize)
                        .build();
            }

            throw new IllegalArgumentException("Unsupported or invalid video format. Only MP4 and WebM files are supported.");
        }
    }

    private boolean isWebMHeader(byte[] header) {
        return header.length >= 4 &&
                (header[0] & 0xFF) == 0x1A &&
                (header[1] & 0xFF) == 0x45 &&
                (header[2] & 0xFF) == 0xDF &&
                (header[3] & 0xFF) == 0xA3;
    }

    private boolean isMp4Header(byte[] header) {
        if (header.length < 8) return false;
        // Check for 'ftyp' at offset 4 or 'moov' / 'mdat' box type
        String boxType = new String(header, 4, 4);
        return "ftyp".equals(boxType) || "moov".equals(boxType) || "mdat".equals(boxType);
    }

    /**
     * Parses MP4 ISO Base Media File Format box structure to locate moov -> mvhd atom.
     */
    private double parseMp4Duration(FileChannel channel, long fileSize) throws IOException {
        long position = 0;
        ByteBuffer boxHeader = ByteBuffer.allocate(8);

        while (position < fileSize) {
            channel.position(position);
            boxHeader.clear();
            int read = channel.read(boxHeader);
            if (read < 8) break;

            boxHeader.flip();
            long boxSize = Integer.toUnsignedLong(boxHeader.getInt());
            byte[] typeBytes = new byte[4];
            boxHeader.get(typeBytes);
            String boxType = new String(typeBytes);

            long headerSize = 8;
            if (boxSize == 1) { // 64-bit extended box size
                ByteBuffer extHeader = ByteBuffer.allocate(8);
                channel.read(extHeader);
                extHeader.flip();
                boxSize = extHeader.getLong();
                headerSize = 16;
            } else if (boxSize == 0) {
                boxSize = fileSize - position;
            }

            if (boxSize < headerSize) {
                throw new IllegalArgumentException("Corrupt MP4 atom size detected");
            }

            if ("moov".equals(boxType)) {
                // Search inside moov for mvhd
                Double duration = parseMoovForMvhd(channel, position + headerSize, position + boxSize);
                if (duration != null) {
                    return duration;
                }
            }

            position += boxSize;
        }

        throw new IllegalArgumentException("Corrupt or incomplete MP4 file: missing movie header (mvhd) metadata");
    }

    private Double parseMoovForMvhd(FileChannel channel, long moovStart, long moovEnd) throws IOException {
        long pos = moovStart;
        ByteBuffer subHeader = ByteBuffer.allocate(8);

        while (pos < moovEnd) {
            channel.position(pos);
            subHeader.clear();
            int read = channel.read(subHeader);
            if (read < 8) break;

            subHeader.flip();
            long subSize = Integer.toUnsignedLong(subHeader.getInt());
            byte[] typeBytes = new byte[4];
            subHeader.get(typeBytes);
            String subType = new String(typeBytes);

            long headerSize = 8;
            if (subSize == 1) {
                ByteBuffer ext = ByteBuffer.allocate(8);
                channel.read(ext);
                ext.flip();
                subSize = ext.getLong();
                headerSize = 16;
            } else if (subSize == 0) {
                subSize = moovEnd - pos;
            }

            if (subSize < headerSize) break;

            if ("mvhd".equals(subType)) {
                // mvhd found! Read mvhd box content
                int payloadSize = (int) Math.min(subSize - headerSize, 128);
                ByteBuffer mvhdData = ByteBuffer.allocate(payloadSize);
                channel.position(pos + headerSize);
                channel.read(mvhdData);
                mvhdData.flip();

                if (mvhdData.remaining() < 20) {
                    throw new IllegalArgumentException("Corrupt mvhd atom");
                }

                int version = mvhdData.get() & 0xFF;
                // skip 3 bytes flags
                mvhdData.get();
                mvhdData.get();
                mvhdData.get();

                long timescale;
                long duration;

                if (version == 1) {
                    // version 1 (64-bit creation/mod times, 64-bit duration)
                    if (mvhdData.remaining() < 28) throw new IllegalArgumentException("Corrupt 64-bit mvhd atom");
                    mvhdData.getLong(); // creation time
                    mvhdData.getLong(); // modification time
                    timescale = Integer.toUnsignedLong(mvhdData.getInt());
                    duration = mvhdData.getLong();
                } else {
                    // version 0 (32-bit creation/mod times, 32-bit duration)
                    if (mvhdData.remaining() < 16) throw new IllegalArgumentException("Corrupt 32-bit mvhd atom");
                    mvhdData.getInt(); // creation time
                    mvhdData.getInt(); // modification time
                    timescale = Integer.toUnsignedLong(mvhdData.getInt());
                    duration = Integer.toUnsignedLong(mvhdData.getInt());
                }

                if (timescale > 0 && duration > 0) {
                    double durationSeconds = (double) duration / (double) timescale;
                    return Math.round(durationSeconds * 100.0) / 100.0;
                } else {
                    throw new IllegalArgumentException("Invalid MP4 timescale or duration");
                }
            } else if ("trak".equals(subType)) {
                // We can continue searching for mvhd
            }

            pos += subSize;
        }
        return null;
    }

    /**
     * Parses WebM / Matroska EBML segment info to extract duration.
     */
    private double parseWebmDuration(FileChannel channel, long fileSize) throws IOException {
        channel.position(0);
        long maxScan = Math.min(fileSize, 65536); // Scan header area
        ByteBuffer buffer = ByteBuffer.allocate((int) maxScan);
        channel.read(buffer);
        buffer.flip();

        byte[] data = buffer.array();
        int limit = buffer.limit();

        // Search for EBML Element Duration (ID: 0x44 0x89)
        long timecodeScale = 1000000L; // default 1ms = 1,000,000ns

        // Look for TimecodeScale (ID: 0x2A 0xD7 0xB1)
        for (int i = 0; i < limit - 7; i++) {
            if ((data[i] & 0xFF) == 0x2A &&
                (data[i + 1] & 0xFF) == 0xD7 &&
                (data[i + 2] & 0xFF) == 0xB1) {
                int len = data[i + 3] & 0x7F;
                if (len > 0 && len <= 8 && i + 4 + len <= limit) {
                    long scale = 0;
                    for (int k = 0; k < len; k++) {
                        scale = (scale << 8) | (data[i + 4 + k] & 0xFF);
                    }
                    if (scale > 0) timecodeScale = scale;
                }
                break;
            }
        }

        // Look for Duration (ID: 0x44 0x89)
        for (int i = 0; i < limit - 6; i++) {
            if ((data[i] & 0xFF) == 0x44 && (data[i + 1] & 0xFF) == 0x89) {
                int len = data[i + 2] & 0x7F;
                if (len == 4 && i + 7 <= limit) {
                    ByteBuffer floatBuf = ByteBuffer.wrap(data, i + 3, 4);
                    float durationTicks = floatBuf.getFloat();
                    if (durationTicks > 0) {
                        double durationSeconds = (durationTicks * timecodeScale) / 1_000_000_000.0;
                        return Math.round(durationSeconds * 100.0) / 100.0;
                    }
                } else if (len == 8 && i + 11 <= limit) {
                    ByteBuffer doubleBuf = ByteBuffer.wrap(data, i + 3, 8);
                    double durationTicks = doubleBuf.getDouble();
                    if (durationTicks > 0) {
                        double durationSeconds = (durationTicks * timecodeScale) / 1_000_000_000.0;
                        return Math.round(durationSeconds * 100.0) / 100.0;
                    }
                }
            }
        }

        throw new IllegalArgumentException("Could not determine duration from WebM segment info header");
    }
}
