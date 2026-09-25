package com.socialmedia.util;

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;

public class TestVideoGenerator {

    /**
     * Generates a minimal, valid ISO Base Media File Format (MP4) byte array with given duration.
     * Box layout:
     * - ftyp box
     * - moov box -> mvhd box (timescale=1000, duration = durationSeconds * 1000)
     * - mdat box (dummy video payload)
     */
    public static byte[] createMp4Video(double durationSeconds) throws IOException {
        return createMp4Video(durationSeconds, 0);
    }

    public static byte[] createMp4Video(double durationSeconds, int uniqueSeed) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        DataOutputStream out = new DataOutputStream(baos);

        // 1. ftyp box
        byte[] ftypType = "ftyp".getBytes();
        byte[] majorBrand = "isom".getBytes();
        int minorVersion = 512;
        byte[] compBrand1 = "isom".getBytes();
        byte[] compBrand2 = "mp42".getBytes();

        int ftypSize = 4 + 4 + 4 + 4 + 4 + 4; // 24 bytes
        out.writeInt(ftypSize);
        out.write(ftypType);
        out.write(majorBrand);
        out.writeInt(minorVersion);
        out.write(compBrand1);
        out.write(compBrand2);

        // 2. mvhd box inside moov
        ByteArrayOutputStream mvhdBaos = new ByteArrayOutputStream();
        DataOutputStream mvhdOut = new DataOutputStream(mvhdBaos);

        int timescale = 1000;
        int durationTicks = (int) Math.round(durationSeconds * timescale);

        int mvhdPayloadSize = 4 + 4 + 4 + 4 + 4 + 4 + 2 + 2 + 8 + 36 + 24 + 4; // 108 bytes
        mvhdOut.writeInt(mvhdPayloadSize);
        mvhdOut.write("mvhd".getBytes());
        mvhdOut.writeByte(0); // version 0
        mvhdOut.write(new byte[]{0, 0, 0}); // flags
        mvhdOut.writeInt(0); // creation time
        mvhdOut.writeInt(0); // modification time
        mvhdOut.writeInt(timescale); // timescale = 1000
        mvhdOut.writeInt(durationTicks); // duration
        mvhdOut.writeInt(0x00010000); // rate 1.0 (fixed point 16.16)
        mvhdOut.writeShort(0x0100); // volume 1.0 (fixed point 8.8)
        mvhdOut.writeShort(0); // reserved
        mvhdOut.writeInt(0); // reserved
        mvhdOut.writeInt(0); // reserved
        // matrix (unity matrix 9 ints)
        mvhdOut.writeInt(0x00010000); mvhdOut.writeInt(0); mvhdOut.writeInt(0);
        mvhdOut.writeInt(0); mvhdOut.writeInt(0x00010000); mvhdOut.writeInt(0);
        mvhdOut.writeInt(0); mvhdOut.writeInt(0); mvhdOut.writeInt(0x40000000);
        // pre-defined 6 ints
        for (int i = 0; i < 6; i++) mvhdOut.writeInt(0);
        mvhdOut.writeInt(2); // next_track_ID

        byte[] mvhdBytes = mvhdBaos.toByteArray();

        // moov box
        int moovSize = 8 + mvhdBytes.length;
        out.writeInt(moovSize);
        out.write("moov".getBytes());
        out.write(mvhdBytes);

        // 3. mdat box with unique dummy audio/video payload
        byte[] dummyData = new byte[1024];
        dummyData[0] = (byte) (uniqueSeed & 0xFF);
        dummyData[1] = (byte) ((uniqueSeed >> 8) & 0xFF);
        int mdatSize = 8 + dummyData.length;
        out.writeInt(mdatSize);
        out.write("mdat".getBytes());
        out.write(dummyData);

        out.flush();
        return baos.toByteArray();
    }
}
