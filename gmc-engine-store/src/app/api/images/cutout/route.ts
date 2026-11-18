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
  // Some of the model renders have a softly shaded white studio surround
  // rather than a pure-white canvas. Keep the flood-fill achromatic so light
  // vehicle paint is protected, but allow the surround to be removed as one
  // connected background region.
  const threshold = heroVariant ? 220 : 232;
  return red >= threshold && green >= threshold && blue >= threshold && spread <= 32;
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
 * Remove only the achromatic floor component that is connected to the bottom
 * canvas edge. This is safer than a global brightness key: silver/white body
 * panels remain protected behind the car's dark lower contour.
 */
function removeHeroFloor(data: Buffer, width: number, height: number, heroVariant = false): Buffer {
  const floorStart = Math.floor(height * (heroVariant ? 0.60 : 0.66));
  // The remaining contact shadow can be medium-grey rather than white. Keep
  // this threshold low enough to remove that studio floor, but still require
  // an achromatic colour and connection to transparent background.
  const threshold = 80;
  const spreadLimit = 45;
  const pixelCount = width * height;
  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let head = 0;
  let tail = 0;

  const isFloor = (index: number): boolean => {
    const y = Math.floor(index / width);
    if (y < floorStart) return false;
    const offset = index * 4;
    if (data[offset + 3] === 0) return false;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    return (
      Math.min(red, green, blue) >= threshold &&
      Math.max(red, green, blue) - Math.min(red, green, blue) <= spreadLimit
    );
  };

  const enqueue = (index: number) => {
    if (visited[index] || !isFloor(index)) return;
    visited[index] = 1;
    queue[tail++] = index;
  };

  // The first flood-fill may already have made the white surround transparent.
  // Seed from every transparent neighbour, not only the original canvas edge,
  // so a grey floor reflection separated from the border by that transparent
  // surround is still removed.
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      if (data[index * 4 + 3] !== 0) continue;
      if (x > 0) enqueue(index - 1);
      if (x < width - 1) enqueue(index + 1);
      if (y > 0) enqueue(index - width);
      if (y < height - 1) enqueue(index + width);
    }
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
    removeHeroFloor(cutout, info.width, info.height, heroVariant);
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
