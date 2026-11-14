import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PUBLIC_DIR = path.resolve(process.cwd(), "public");
const MODEL_DIR = path.resolve(PUBLIC_DIR, "images", "models");

function isInside(directory: string, file: string): boolean {
  const relative = path.relative(directory, file);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function nearWhite(data: Buffer, offset: number, heroVariant = false): boolean {
  const alpha = data[offset + 3];
  if (alpha === 0) return false;

  const red = data[offset];
  const green = data[offset + 1];
  const blue = data[offset + 2];
  const spread = Math.max(red, green, blue) - Math.min(red, green, blue);

  // Model assets use white studio backgrounds. Keeping the colour-spread
  // check prevents pale vehicle paint from being treated as background.
  const threshold = heroVariant ? 226 : 238;
  return red >= threshold && green >= threshold && blue >= threshold && spread <= 22;
}

function removeBorderBackground(data: Buffer, width: number, height: number, heroVariant = false): Buffer {
  const pixelCount = width * height;
  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let head = 0;
  let tail = 0;

  const enqueue = (index: number) => {
    if (visited[index] || !nearWhite(data, index * 4, heroVariant)) return;
    visited[index] = 1;
    queue[tail++] = index;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }

  while (head < tail) {
    const index = queue[head++];
    const x = index % width;
    const y = Math.floor(index / width);

    if (x > 0) enqueue(index - 1);
    if (x < width - 1) enqueue(index + 1);
    if (y > 0) enqueue(index - width);
    if (y < height - 1) enqueue(index + width);
  }

  for (let index = 0; index < pixelCount; index += 1) {
    if (visited[index]) data[index * 4 + 3] = 0;
  }

  return data;
}

/**
 * Some model renders leave a pale studio-floor reflection below the vehicle.
 * For the brand hero only, clear that light achromatic strip after the border
 * flood-fill. The vehicle remains opaque because its lower body and tyres are
 * substantially darker than the floor.
 */
function removeHeroFloor(data: Buffer, width: number, height: number): Buffer {
  const floorStart = Math.floor(height * 0.8);
  for (let y = floorStart; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      if (data[offset + 3] === 0) continue;
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      const spread = Math.max(red, green, blue) - Math.min(red, green, blue);
      if (red >= 180 && green >= 180 && blue >= 180 && spread <= 24) {
        data[offset + 3] = 0;
      }
    }
  }
  return data;
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const source = searchParams.get("src") ?? "";
  const heroVariant = searchParams.get("variant") === "hero";
  if (!source.startsWith("/images/models/") || source.includes("..")) {
    return new Response("Invalid model image", { status: 400 });
  }

  const file = path.resolve(PUBLIC_DIR, source.slice(1));
  if (!isInside(MODEL_DIR, file)) {
    return new Response("Invalid model image", { status: 400 });
  }

  try {
    await fs.access(file);
    const { data, info } = await sharp(file)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const cutout = removeBorderBackground(data, info.width, info.height, heroVariant);
    if (heroVariant) removeHeroFloor(cutout, info.width, info.height);
    const output = await sharp(cutout, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      // Remove the original canvas whitespace so a fixed hero frame measures
      // the visible vehicle, not the photographer's white margin.
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 0 })
      .extend({
        top: 16,
        bottom: 20,
        left: 24,
        right: 24,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ lossless: true })
      .toBuffer();

    return new Response(output, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Model image not found", { status: 404 });
  }
}
