/**
 * Generate placeholder app icons for the Tauri bundle.
 *
 * Produces a solid blue square with a white circle (simple placeholder) as
 * valid PNG / ICO / ICNS files. Replace with a real logo later:
 *
 *   npx @tauri-apps/cli icon path/to/logo.png
 *
 * Usage: node scripts/generate-icons.mjs
 */

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'src-tauri', 'icons');
mkdirSync(outDir, { recursive: true });

// ── CRC32 ───────────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

// ── PNG (solid blue with a white dot) ──────────────────────────────────
function makePng(size) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA

  const raw = Buffer.alloc(size * (1 + size * 4));
  const c = size / 2;
  const dotRadius = size * 0.22;
  for (let y = 0; y < size; y++) {
    const row = y * (1 + size * 4);
    raw[row] = 0; // filter type
    for (let x = 0; x < size; x++) {
      const p = row + 1 + x * 4;
      const dx = x - c;
      const dy = y - c;
      const inside = dx * dx + dy * dy <= dotRadius * dotRadius;
      raw[p] = inside ? 255 : 37;     // R
      raw[p + 1] = inside ? 255 : 99; // G
      raw[p + 2] = inside ? 255 : 235; // B
      raw[p + 3] = 255;               // A
    }
  }

  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── ICO (PNG-compressed entries) ───────────────────────────────────────
function makeIco(sizes) {
  const images = sizes.map((s) => ({ size: s, png: makePng(s) }));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, png }) => {
    const e = Buffer.alloc(16);
    e[0] = size >= 256 ? 0 : size;
    e[1] = size >= 256 ? 0 : size;
    e.writeUInt16LE(1, 4); // color planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += png.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}

// ── ICNS (PNG entries) ─────────────────────────────────────────────────
function makeIcns(entries) {
  const chunks = entries.map(({ type, png }) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(8 + png.length, 0);
    return Buffer.concat([Buffer.from(type, 'ascii'), len, png]);
  });
  const body = Buffer.concat(chunks);
  const header = Buffer.alloc(8);
  header.write('icns', 0, 'ascii');
  header.writeUInt32BE(8 + body.length, 4);
  return Buffer.concat([header, body]);
}

// ── Write files ────────────────────────────────────────────────────────
const pngs = { 32: 32, 128: 128, 256: 256, 512: 512 };
for (const [name, size] of Object.entries(pngs)) {
  writeFileSync(join(outDir, `icon-${size}.png`), makePng(size));
}

writeFileSync(join(outDir, '32x32.png'), makePng(32));
writeFileSync(join(outDir, '128x128.png'), makePng(128));
writeFileSync(join(outDir, '128x128@2x.png'), makePng(256));
writeFileSync(join(outDir, 'icon.png'), makePng(512));

writeFileSync(join(outDir, 'icon.ico'), makeIco([16, 32, 48, 256]));
writeFileSync(
  join(outDir, 'icon.icns'),
  makeIcns([
    { type: 'icp4', png: makePng(16) },
    { type: 'icp5', png: makePng(32) },
    { type: 'icp6', png: makePng(64) },
    { type: 'ic07', png: makePng(128) },
    { type: 'ic08', png: makePng(256) },
    { type: 'ic09', png: makePng(512) },
    { type: 'ic10', png: makePng(1024) },
  ])
);

console.log('Icons generated in', outDir);
