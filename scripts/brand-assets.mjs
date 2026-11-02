// Generates web brand assets from the supplied ZEOTON logo.
// Run: node scripts/brand-assets.mjs   (re-run only if the source logo changes)
import sharp from 'sharp';
import { writeFile, mkdir } from 'node:fs/promises';

const SRC = 'public/brand/zeoton-logo-original.png';
const BLUE = { r: 10, g: 111, b: 253 };
const MIDNIGHT = '#151A25';

// Vector trace of the Z mark (coordinates measured from the supplied logo).
const MARK_VIEWBOX = '231 14 257 179';
const MARK_PATHS = {
  upper: 'M290 14H485L443 49L262 193H231L255 151L384 49H254Z',
  lower: 'M326 157H488L452 193H284Z',
  stripe: 'M432 73H467L385 139H350Z',
};

function markSvg({ fill = 'currentColor', accent = '#0A6FFD' } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_VIEWBOX}" role="img" aria-label="ZEOTON">` +
    `<path d="${MARK_PATHS.upper}" fill="${fill}"/><path d="${MARK_PATHS.lower}" fill="${fill}"/>` +
    `<path d="${MARK_PATHS.stripe}" fill="${accent}"/></svg>`;
}

// Re-colour the light-background logo for dark backgrounds: background -> transparent,
// dark ink -> white, blue stays blue. Alpha comes from distance to the background tone.
async function lightVariant(region) {
  let img = sharp(SRC);
  if (region) img = img.extract(region);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let p = 0, o = 0; p < data.length; p += info.channels, o += 4) {
    const r = data[p], g = data[p + 1], b = data[p + 2];
    const isBlue = b - r > 70;
    const alpha = Math.max(0, Math.min(255, Math.round(((248 - Math.min(r, g, b)) / (248 - 21)) * 255)));
    if (isBlue) {
      out[o] = BLUE.r; out[o + 1] = BLUE.g; out[o + 2] = BLUE.b;
      out[o + 3] = Math.max(0, Math.min(255, Math.round(((248 - r) / (248 - 10)) * 255)));
    } else {
      out[o] = 245; out[o + 1] = 247; out[o + 2] = 251; out[o + 3] = alpha;
    }
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } });
}

await mkdir('public/brand', { recursive: true });

await writeFile('public/brand/zeoton-mark.svg', markSvg({ fill: '#F5F7FB' }));
await writeFile('public/brand/zeoton-mark-dark.svg', markSvg({ fill: MIDNIGHT }));

await (await lightVariant()).trim().png().toFile('public/brand/zeoton-logo-light.png');
await (await lightVariant({ left: 85, top: 236, width: 556, height: 66 })).trim()
  .webp({ lossless: true }).toFile('public/brand/zeoton-wordmark-light.webp');

// App icons: light mark on a midnight tile.
const iconSvg = (size, pad) => Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
  `<rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#070A12"/>` +
  `<svg x="${pad}" y="${pad}" width="${size - pad * 2}" height="${size - pad * 2}" viewBox="${MARK_VIEWBOX}">` +
  `<path d="${MARK_PATHS.upper}" fill="#F5F7FB"/><path d="${MARK_PATHS.lower}" fill="#F5F7FB"/>` +
  `<path d="${MARK_PATHS.stripe}" fill="#0A6FFD"/></svg></svg>`,
);
await sharp(iconSvg(512, 92)).png().toFile('src/app/icon.png');
await sharp(iconSvg(180, 32)).png().toFile('src/app/apple-icon.png');

// Default social sharing image (1200x630).
const logo = await (await lightVariant()).trim().resize({ width: 560 }).png().toBuffer();
const ogBg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">` +
  `<defs><radialGradient id="g" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#0E1A33"/>` +
  `<stop offset="1" stop-color="#070A12"/></radialGradient></defs>` +
  `<rect width="1200" height="630" fill="url(#g)"/>` +
  `<path d="M0 560 L1200 470 L1200 476 L0 566Z" fill="#0A6FFD" opacity="0.35"/></svg>`,
);
await sharp(ogBg).composite([{ input: logo, gravity: 'center' }]).png({ compressionLevel: 9 })
  .toFile('public/og-default.png');

console.log('Brand assets generated.');
