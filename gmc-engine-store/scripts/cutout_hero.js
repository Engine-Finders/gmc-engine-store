/**
 * Cuts the flat background out of the hub hero artwork WITHOUT losing the glowing
 * podium / rings.
 *
 * Why the usual tools fail: a background remover does *subject segmentation* — it
 * keeps the object and discards everything else. The rings aren't an object, they
 * are light, and light is semi-transparent, which a hard subject mask can't even
 * represent. So they always go.
 *
 * What this does instead — luminance keying, one direction per theme:
 *   hero_light: bg is pure white (254) and the engine is the only dark thing, so a
 *     darkness key isolates engine AND rings in one pass.
 *   hero_dark:  bg is pure black (0,0,8) and so is much of the engine, so a
 *     brightness key alone would eat the engine. The two renders are pixel-aligned
 *     (~8px apart, measured by edge cross-correlation), so the engine matte is
 *     borrowed from the LIGHT render and unioned with the dark render's glow key.
 *
 * Run: node scripts/cutout_hero.js   (writes *_cut.png next to the sources)
 */
const sharp = require("sharp");

const DIR = "public/images/hub/";
const DX = -8; // the light render sits 8px left of the dark one
const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

const readRaw = async (f) => {
  const { data, info } = await sharp(DIR + f + ".png").removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { d: data, W: info.width, H: info.height, C: info.channels };
};
const lum = (s, i) => 0.2126 * s.d[i] + 0.7152 * s.d[i + 1] + 0.0722 * s.d[i + 2];
const chroma = (s, i) => Math.max(s.d[i], s.d[i + 1], s.d[i + 2]) - Math.min(s.d[i], s.d[i + 1], s.d[i + 2]);

/** Flood fill from the border; anything never reached is an enclosed hole. */
function fillHoles(soft, W, H, thr = 0.5) {
  const seen = new Uint8Array(W * H);
  const st = [];
  for (let x = 0; x < W; x++) st.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) st.push(y * W, y * W + W - 1);
  while (st.length) {
    const p = st.pop();
    if (seen[p] || soft[p] > thr) continue;
    seen[p] = 1;
    const x = p % W, y = (p - x) / W;
    if (x > 0) st.push(p - 1);
    if (x < W - 1) st.push(p + 1);
    if (y > 0) st.push(p - W);
    if (y < H - 1) st.push(p + W);
  }
  return seen; // 0 = inside the subject (body or specular hole)
}

(async () => {
  const D = await readRaw("hero_dark");
  const L = await readRaw("hero_light");
  const { W, H } = D;

  // ---------- light: one darkness key covers engine + rings ----------
  {
    const px = Buffer.alloc(W * H * 4);
    for (let i = 0; i < W * H; i++) {
      const j = i * L.C;
      // union with a chroma key so the blue rings survive where they are bright
      const a = Math.pow(Math.max(clamp((252 - lum(L, j)) / 30), clamp(chroma(L, j) / 34)), 0.75);
      px[i * 4] = L.d[j]; px[i * 4 + 1] = L.d[j + 1]; px[i * 4 + 2] = L.d[j + 2];
      px[i * 4 + 3] = Math.round(a * 255);
    }
    await sharp(px, { raw: { width: W, height: H, channels: 4 } }).png().toFile(DIR + "hero_light_cut.png");
  }

  // ---------- dark: glow key ∪ engine matte borrowed from the light render ----------
  {
    const soft = new Float32Array(W * H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const sx = x + DX;
        if (sx < 0 || sx >= W) continue;
        soft[y * W + x] = clamp((165 - lum(L, (y * W + sx) * L.C)) / 40);
      }
    }
    const outside = fillHoles(soft, W, H);

    const px = Buffer.alloc(W * H * 4);
    for (let i = 0; i < W * H; i++) {
      const j = i * D.C;
      const glow = Math.pow(Math.max(clamp((lum(D, j) - 6) / 26), clamp(chroma(D, j) / 34)), 0.75);
      const body = outside[i] ? soft[i] : 1;
      px[i * 4] = D.d[j]; px[i * 4 + 1] = D.d[j + 1]; px[i * 4 + 2] = D.d[j + 2];
      px[i * 4 + 3] = Math.round(Math.max(glow, body) * 255);
    }
    await sharp(px, { raw: { width: W, height: H, channels: 4 } }).png().toFile(DIR + "hero_dark_cut.png");
  }

  console.log("wrote hero_light_cut.png + hero_dark_cut.png");
})();
