const sharp = require('sharp');
const SRC = 'E:/Job/GMC Homepage UI';
const SCRATCH = 'C:/Users/nafiz/AppData/Local/Temp/claude/e--Job/27d7daa9-daae-417c-8b6b-06bfda750930/scratchpad';

async function montage(srcFile, regions, outName, canvasBg) {
  const crops = [];
  for (const r of regions) {
    const buf = await sharp(SRC + '/' + srcFile)
      .extract({ left: r.l, top: r.t, width: r.w, height: r.h })
      .png().toBuffer();
    crops.push({ buf, w: r.w, h: r.h });
  }
  const gap = 12;
  const maxH = Math.max(...crops.map(c => c.h));
  let x = gap;
  const composites = [];
  for (const c of crops) {
    composites.push({ input: c.buf, left: x, top: gap });
    x += c.w + gap;
  }
  await sharp({ create: { width: x, height: maxH + gap * 2, channels: 3, background: canvasBg || { r: 200, g: 200, b: 200 } } })
    .composite(composites).png().toFile(SCRATCH + '/' + outName);
  console.log('wrote', outName, x + 'x' + (maxH + gap * 2));
}

module.exports = { montage, SRC, SCRATCH };

// brand card left edges in 1.png
const BRAND_X = [38, 175, 311, 448, 584, 721];

const HERO_ENGINES = [
  { l: 527, t: 195, w: 145, h: 128 },  // OM651 main
  { l: 402, t: 168, w: 92, h: 76 },    // N47D20
  { l: 735, t: 202, w: 96, h: 68 },    // AJ126
  { l: 917, t: 170, w: 70, h: 46 },    // K9K
  { l: 918, t: 268, w: 96, h: 72 },    // M57
  { l: 372, t: 360, w: 92, h: 76 },    // M274
  { l: 768, t: 404, w: 100, h: 68 },   // 306DT
];

// Write a single cropped region to a file
async function crop(srcFile, r, outPath) {
  const fs = require('fs');
  const path = require('path');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(SRC + '/' + srcFile)
    .extract({ left: r.l, top: r.t, width: r.w, height: r.h })
    .png().toFile(outPath);
}

// Crop then flood-fill the border-connected dark background to transparent (preserves interior details
// like BMW's black quadrants). Result is a clean logo on a transparent background.
async function cropBgRemove(srcFile, r, outPath, opts = {}) {
  const fs = require('fs');
  const path = require('path');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const { data, info } = await sharp(SRC + '/' + srcFile)
    .extract({ left: r.l, top: r.t, width: r.w, height: r.h })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels } = info;
  // background reference = average of the 4 corners
  let br = 0, bgc = 0, bb = 0;
  for (const [x, y] of [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]]) {
    const i = (y * w + x) * channels;
    br += data[i]; bgc += data[i + 1]; bb += data[i + 2];
  }
  br /= 4; bgc /= 4; bb /= 4;
  const maxLum = opts.maxLum ?? 72; // border-connected pixels darker than this are treated as background
  const visited = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) { stack.push(x, 0, x, h - 1); }
  for (let y = 0; y < h; y++) { stack.push(0, y, w - 1, y); }
  const isBg = (idx) => {
    const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    return lum < maxLum;
  };
  void br; void bgc; void bb;
  while (stack.length) {
    const y = stack.pop(), x = stack.pop();
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const p = y * w + x;
    if (visited[p]) continue;
    visited[p] = 1;
    const idx = p * channels;
    if (!isBg(idx)) continue;
    data[idx + 3] = 0;
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }
  // remove thin line artifacts (card edges) and tiny specks via connected components,
  // keeping the logo parts (rings, roundels, etc.)
  const label = new Int32Array(w * h).fill(-1);
  const comps = [];
  for (let p0 = 0; p0 < w * h; p0++) {
    if (data[p0 * channels + 3] <= 40 || label[p0] !== -1) continue;
    const id = comps.length;
    let count = 0, minX = w, maxX = 0, minY = h, maxY = 0;
    const q = [p0];
    label[p0] = id;
    while (q.length) {
      const cur = q.pop();
      const cx = cur % w, cy = (cur / w) | 0;
      count++;
      if (cx < minX) minX = cx; if (cx > maxX) maxX = cx;
      if (cy < minY) minY = cy; if (cy > maxY) maxY = cy;
      const nb = [cur + 1, cur - 1, cur + w, cur - w];
      const cxs = [cx + 1, cx - 1, cx, cx];
      const cys = [cy, cy, cy + 1, cy - 1];
      for (let k = 0; k < 4; k++) {
        const nx = cxs[k], ny = cys[k], np = nb[k];
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        if (label[np] === -1 && data[np * channels + 3] > 40) { label[np] = id; q.push(np); }
      }
    }
    comps.push({ id, count, bw: maxX - minX + 1, bh: maxY - minY + 1 });
  }
  const bad = new Set();
  for (const c of comps) {
    const thinV = c.bw <= 11 && c.bh >= 0.42 * h;
    const thinH = c.bh <= 11 && c.bw >= 0.42 * w;
    const speck = c.count < 20;
    if (thinV || thinH || speck) bad.add(c.id);
  }
  for (let p0 = 0; p0 < w * h; p0++) {
    if (bad.has(label[p0])) data[p0 * channels + 3] = 0;
  }

  // clear a border margin to kill any residual card-edge glow lines
  const m = 7;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x < m || x >= w - m || y < m || y >= h - m) data[(y * w + x) * channels + 3] = 0;
    }
  }
  await sharp(data, { raw: { width: w, height: h, channels } })
    .median(1) // clean stray edge pixels
    .png()
    .toFile(outPath);
}

// Crop then feather the edges to transparent so the crop blends into any dark bg (no seam / no visible box)
async function cropFeather(srcFile, r, outPath, opts = {}) {
  const fs = require('fs');
  const path = require('path');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const { w, h } = { w: r.w, h: r.h };
  const base = await sharp(SRC + '/' + srcFile)
    .extract({ left: r.l, top: r.t, width: r.w, height: r.h })
    .ensureAlpha()
    .toBuffer();
  const solid = opts.solid ?? 62; // % radius kept fully opaque
  const mask = Buffer.from(
    `<svg width="${w}" height="${h}"><defs><radialGradient id="g" cx="50%" cy="50%" r="72%">` +
    `<stop offset="${solid}%" stop-color="#fff" stop-opacity="1"/>` +
    `<stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>` +
    `<rect width="${w}" height="${h}" fill="url(#g)"/></svg>`
  );
  await sharp(base).composite([{ input: mask, blend: 'dest-in' }]).png().toFile(outPath);
}

async function writeAssets() {
  const OUT = 'E:/Job/gmc-engine-store/public/images';
  // Featured engine photos (on white)
  const feNames = ['om651', 'om642', 'm274', 'om646'];
  const feX = [70, 303, 537, 770];
  for (let i = 0; i < 4; i++) await crop('1.png', { l: feX[i], t: 1018, w: 170, h: 112 }, `${OUT}/engines/fe-${feNames[i]}.png`);
  // Brand logos — wider bounds + feathered edges so nothing is cut and there is no seam
  const brandNames = ['mercedes', 'bmw', 'jaguar', 'landrover', 'audi', 'vw'];
  // per-brand crop bounds (each mark has a different width); offsets from BRAND_X
  const LOGO = [
    { dl: 22, w: 78 }, // mercedes
    { dl: 22, w: 78 }, // bmw
    { dl: 16, w: 88 }, // jaguar (wide cat)
    { dl: 12, w: 96 }, // land rover (oval + text)
    { dl: 18, w: 84 }, // audi (4 rings)
    { dl: 25, w: 70 }, // vw (centered; narrow enough to avoid edge glow lines)
  ];
  for (let i = 0; i < 6; i++) await cropBgRemove('1.png', { l: BRAND_X[i] + LOGO[i].dl, t: 700, w: LOGO[i].w, h: 72 }, `${OUT}/brands/logo-${brandNames[i]}.png`, { maxLum: 72 });
  // Brand cars
  for (let i = 0; i < 6; i++) await crop('1.png', { l: BRAND_X[i] + 6, t: 812, w: 118, h: 84 }, `${OUT}/brands/car-${brandNames[i]}.png`);
  // Popular engine blue renders
  const popNames = ['om651', 'om642', 'om646', 'm272'];
  const popX = [190, 495, 795, 1095];
  for (let i = 0; i < 4; i++) await crop('2.png', { l: popX[i], t: 620, w: 112, h: 118 }, `${OUT}/engines/pop-${popNames[i]}.png`);
  // Hero engines
  const heroNames = ['om651', 'n47d20', 'aj126', 'k9k', 'm57', 'm274', '306dt'];
  for (let i = 0; i < heroNames.length; i++) await crop('1.png', HERO_ENGINES[i], `${OUT}/engines/hero-${heroNames[i]}.png`);
  console.log('assets written');
}
// Shop-by-brand small logos from 2.png (1284 wide), 3 rows x 4 cols
const SB = [
  ['mercedes', 63, 98], ['bmw', 372, 98], ['jaguar', 678, 98], ['landrover', 985, 98],
  ['rangerover', 63, 158], ['audi', 372, 158], ['vw', 678, 158], ['mini', 985, 158],
  ['ford', 63, 218], ['vauxhall', 372, 218], ['toyota', 678, 218],
];
async function sbMontage() {
  await montage('2.png', SB.map(([n, cx, cy]) => ({ l: cx - 26, t: cy - 24, w: 52, h: 48 })),
    'sheet-sb.png', { r: 245, g: 246, b: 250 });
}
async function writeSb() {
  const OUT = 'E:/Job/gmc-engine-store/public/images/brands';
  for (const [n, cx, cy] of SB) await crop('2.png', { l: cx - 26, t: cy - 24, w: 52, h: 48 }, `${OUT}/sbl-${n}.png`);
  console.log('sb logos written');
}
if (process.argv[2] === 'write') { writeAssets(); }
if (process.argv[2] === 'sb') { sbMontage(); }
if (process.argv[2] === 'sbwrite') { writeSb(); }

if (require.main === module) {
  (async () => {
    // Featured engines tuned (exclude badge)
    await montage('1.png', [70, 303, 537, 770].map(l => ({ l, t: 1018, w: 170, h: 112 })),
      'sheet-fe.png', { r: 255, g: 255, b: 255 });
    // Brand logos (top of each brand card, on dark)
    await montage('1.png', BRAND_X.map(l => ({ l: l + 28, t: 718, w: 72, h: 60 })),
      'sheet-brandlogo.png', { r: 20, g: 20, b: 30 });
    // Brand cars (bottom of each brand card, on dark)
    await montage('1.png', BRAND_X.map(l => ({ l: l + 6, t: 812, w: 118, h: 90 })),
      'sheet-brandcar.png', { r: 20, g: 20, b: 30 });
    // Popular engine blue renders from 2.png (1284 wide) y~740-960, 4 cards
    await montage('2.png', [190, 495, 795, 1095].map(l => ({ l, t: 620, w: 130, h: 120 })),
      'sheet-pop.png', { r: 10, g: 15, b: 35 });
    // Hero engines from 1.png: crop engine-only (no text)
    await montage('1.png', HERO_ENGINES, 'sheet-hero.png', { r: 5, g: 8, b: 20 });
  })();
}
