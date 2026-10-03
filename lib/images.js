/*
 * Copies assets/img into the built site, shrinking anything too big for the
 * web on the way.
 *
 * Amanda uploads straight off her phone, so a new photo is typically a 4000px,
 * 5MB JPEG that still carries the GPS position it was taken at. Any image
 * longer than MAX_SIZE on either side, heavier than MAX_BYTES, or carrying
 * EXIF data is re-encoded: rotated upright, scaled down, metadata stripped.
 * Everything else is copied byte for byte, so the photos already on the site
 * are untouched.
 *
 * The originals stay as uploaded in the repository; only _site gets the
 * smaller copy.
 *
 * It also records every image's final pixel size, which the templates write
 * into width/height so the page doesn't jump as photos load. That means a
 * replacement photo with a different shape needs no other change.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE = 'assets/img';
const MAX_SIZE = 1600;   // longest side, in pixels
const MAX_BYTES = 400 * 1024;
const IMAGE = /\.(jpe?g|png|webp)$/i;

// "assets/img/amanda.jpg" -> { width, height }
export const imageSizes = new Map();

async function shrink(from, to) {
  const ext = path.extname(from).toLowerCase();
  let pipeline = sharp(from).rotate().resize({ width: MAX_SIZE, height: MAX_SIZE, fit: 'inside', withoutEnlargement: true });

  if (ext === '.png') pipeline = pipeline.png({ palette: true, quality: 85, effort: 8 });
  else if (ext === '.webp') pipeline = pipeline.webp({ quality: 80 });
  else pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });

  await pipeline.toFile(to);
}

async function isFresh(from, to) {
  try {
    const [a, b] = await Promise.all([fs.stat(from), fs.stat(to)]);
    return b.mtimeMs >= a.mtimeMs;
  } catch {
    return false;
  }
}

export async function processImages(outputDir) {
  const target = path.join(outputDir, SOURCE);
  await fs.mkdir(target, { recursive: true });
  imageSizes.clear();

  const names = (await fs.readdir(SOURCE)).filter((name) => IMAGE.test(name));

  await Promise.all(names.map(async (name) => {
    const from = path.join(SOURCE, name);
    const to = path.join(target, name);

    if (!(await isFresh(from, to))) {
      const [{ size }, meta] = await Promise.all([fs.stat(from), sharp(from).metadata()]);
      if (Math.max(meta.width, meta.height) > MAX_SIZE || size > MAX_BYTES || meta.exif) await shrink(from, to);
      else await fs.copyFile(from, to);
    }

    const { width, height } = await sharp(to).metadata();
    imageSizes.set(`${SOURCE}/${name}`, { width, height });
  }));
}
