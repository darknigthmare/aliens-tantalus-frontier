// Read the encoded image dimensions, not a filename or a copy in a manifest.
export function spriteImageDimensions(bytes) {
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    if (bytes.toString('ascii', 12, 16) !== 'IHDR') throw new Error('PNG without IHDR');
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('Unsupported sprite image format');
  }
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const type = bytes.toString('ascii', offset, offset + 4);
    const size = bytes.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (start + size > bytes.length) throw new Error('Truncated WebP chunk');
    if (type === 'VP8X' && size >= 10) {
      return { width: bytes.readUIntLE(start + 4, 3) + 1, height: bytes.readUIntLE(start + 7, 3) + 1 };
    }
    if (type === 'VP8L' && size >= 5 && bytes[start] === 0x2f) {
      const packed = bytes.readUInt32LE(start + 1);
      return { width: (packed & 0x3fff) + 1, height: ((packed >>> 14) & 0x3fff) + 1 };
    }
    if (type === 'VP8 ' && size >= 10 && bytes.subarray(start + 3, start + 6).equals(Buffer.from([0x9d, 0x01, 0x2a]))) {
      return { width: bytes.readUInt16LE(start + 6) & 0x3fff, height: bytes.readUInt16LE(start + 8) & 0x3fff };
    }
    offset = start + size + (size & 1);
  }
  throw new Error('WebP without a supported dimension chunk');
}
