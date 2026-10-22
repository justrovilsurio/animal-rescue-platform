import type { Photo } from '../domain/types';
import { newId } from './ids';

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

/**
 * Shrink an uploaded photo before it is stored. Phones produce 4–12 MB
 * images; localStorage holds about 5 MB in total, so every photo is resized
 * to at most `maxSide` px and re-encoded as JPEG (~100–200 KB).
 * With a real backend this moves to the upload pipeline, but the UI contract
 * (File in, Photo out) stays the same.
 */
export async function fileToPhoto(file: File, maxSide = 1400, quality = 0.82): Promise<Photo> {
  if (!file.type.startsWith('image/')) throw new Error('That file is not an image. Use a JPG, PNG or WebP photo.');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('That photo is over 15 MB. Try a smaller one.');
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Your browser could not process that photo.');
    ctx.drawImage(img, 0, 0, w, h);
    return { id: newId('photo'), src: canvas.toDataURL('image/jpeg', quality) };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('That photo could not be opened. Try another one.'));
    img.src = src;
  });
}
