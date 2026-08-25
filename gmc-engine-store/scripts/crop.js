// Final pixel-perfect crops from UI mockups
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SOURCE = 'E:/Job/GMC Homepage UI';
const OUT = 'E:/Job/gmc-engine-store/public/images';

async function crop(srcFile, region, outName, outDir = 'engines') {
  const src = path.join(SOURCE, srcFile);
  const dir = path.join(OUT, outDir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, outName);
  await sharp(src)
    .extract({ left: Math.round(region.left), top: Math.round(region.top), width: Math.round(region.width), height: Math.round(region.height) })
    .png({ quality: 100 })
    .toFile(out);
  console.log('✓', outDir + '/' + outName);
}

async function run() {
  // ============================================
  // HERO ENGINE CARDS from 1.png (1024x1457)
  // ============================================
  // Main hero card (OM651) - tighter to just the card
  await crop('1.png', { left: 460, top: 90, width: 280, height: 460 }, 'hero-om651.png');

  // ============================================
  // FEATURED ENGINES (4 cards) - 1.png y=970-1370
  // Card width ~195px each, gaps in between
  // ============================================
  await crop('1.png', { left: 30, top: 970, width: 195, height: 170 }, 'fe-om651.png');
  await crop('1.png', { left: 263, top: 970, width: 195, height: 170 }, 'fe-om642.png');
  await crop('1.png', { left: 496, top: 970, width: 195, height: 170 }, 'fe-m274.png');
  await crop('1.png', { left: 729, top: 970, width: 195, height: 170 }, 'fe-om646.png');

  // Full engine card (with info)
  await crop('1.png', { left: 30, top: 970, width: 195, height: 380 }, 'fe-card-om651.png');
  await crop('1.png', { left: 263, top: 970, width: 195, height: 380 }, 'fe-card-om642.png');
  await crop('1.png', { left: 496, top: 970, width: 195, height: 380 }, 'fe-card-m274.png');
  await crop('1.png', { left: 729, top: 970, width: 195, height: 380 }, 'fe-card-om646.png');

  // ============================================
  // BRAND CARDS with car photos from 1.png - 4 cards
  // ============================================
  await crop('1.png', { left: 30, top: 700, width: 195, height: 240 }, 'mercedes.png', 'brands');
  await crop('1.png', { left: 263, top: 700, width: 195, height: 240 }, 'bmw.png', 'brands');
  await crop('1.png', { left: 496, top: 700, width: 195, height: 240 }, 'jaguar.png', 'brands');
  await crop('1.png', { left: 729, top: 700, width: 195, height: 240 }, 'landrover.png', 'brands');

  // ============================================
  // 2.png (1284x1225) - Shop by Brand, Popular engines
  // ============================================
  // Shop by Brand logo rows (3 rows × 4 cols)
  // Each cell is ~290x80
  await crop('2.png', { left: 30, top: 30, width: 290, height: 80 }, 'sb-mercedes.png', 'brands');
  await crop('2.png', { left: 330, top: 30, width: 290, height: 80 }, 'sb-bmw.png', 'brands');
  await crop('2.png', { left: 630, top: 30, width: 290, height: 80 }, 'sb-jaguar.png', 'brands');
  await crop('2.png', { left: 930, top: 30, width: 290, height: 80 }, 'sb-landrover.png', 'brands');
  await crop('2.png', { left: 30, top: 120, width: 290, height: 80 }, 'sb-rangerover.png', 'brands');
  await crop('2.png', { left: 330, top: 120, width: 290, height: 80 }, 'sb-audi.png', 'brands');
  await crop('2.png', { left: 630, top: 120, width: 290, height: 80 }, 'sb-vw.png', 'brands');
  await crop('2.png', { left: 930, top: 120, width: 290, height: 80 }, 'sb-mini.png', 'brands');
  await crop('2.png', { left: 30, top: 210, width: 290, height: 80 }, 'sb-ford.png', 'brands');
  await crop('2.png', { left: 330, top: 210, width: 290, height: 80 }, 'sb-vauxhall.png', 'brands');
  await crop('2.png', { left: 630, top: 210, width: 290, height: 80 }, 'sb-toyota.png', 'brands');
  await crop('2.png', { left: 930, top: 210, width: 290, height: 80 }, 'sb-all.png', 'brands');

  // ============================================
  // POPULAR ENGINE FAMILIES (blue glowing engines)
  // 2.png y=720-980
  // ============================================
  await crop('2.png', { left: 30, top: 740, width: 290, height: 220 }, 'pop-om651.png');
  await crop('2.png', { left: 330, top: 740, width: 290, height: 220 }, 'pop-om642.png');
  await crop('2.png', { left: 630, top: 740, width: 290, height: 220 }, 'pop-om646.png');
  await crop('2.png', { left: 930, top: 740, width: 290, height: 220 }, 'pop-m272.png');

  // ============================================
  // MOBILE crops
  // ============================================
  // 1.Mobile.png - hero card
  await crop('1.Mobile.png', { left: 240, top: 200, width: 400, height: 500 }, 'm-hero.png');

  // 4.mobile.png - how it works
  await crop('4.mobile.png', { left: 60, top: 150, width: 720, height: 380 }, 'm-step-1.png', 'features');
  await crop('4.mobile.png', { left: 60, top: 540, width: 720, height: 380 }, 'm-step-2.png', 'features');
  await crop('4.mobile.png', { left: 60, top: 930, width: 720, height: 380 }, 'm-step-3.png', 'features');

  // 7.Mobile.png - popular engine families
  await crop('7.Mobile.png', { left: 40, top: 200, width: 800, height: 360 }, 'm-pop-om651.png');
  await crop('7.Mobile.png', { left: 40, top: 580, width: 800, height: 360 }, 'm-pop-om642.png');
  await crop('7.Mobile.png', { left: 40, top: 960, width: 800, height: 360 }, 'm-pop-om646.png');
  await crop('7.Mobile.png', { left: 40, top: 1340, width: 800, height: 360 }, 'm-pop-m272.png');

  // 9.mobile.png - CTA
  await crop('9.mobile.png', { left: 50, top: 100, width: 750, height: 380 }, 'm-cta.png', 'features');

  console.log('\n✅ All final crops done!');
}

run().catch(e => { console.error(e); process.exit(1); });
