// Turns an uploaded/pasted image into a compact data URL that can be saved with the question.
const MAX_SIDE = 1400; // pixels; enough for sharp diagrams on any screen

const readAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('This image could not be opened. Try PNG or JPG.'));
    img.src = src;
  });

export const isImageFile = (f) => f && f.type && f.type.startsWith('image/');

export async function fileToImage(file) {
  if (!isImageFile(file)) throw new Error('Choose an image file: PNG, JPG, WebP or SVG.');
  if (file.type === 'image/svg+xml') return { src: await readAsDataURL(file), size: 'm', caption: '' };

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; // transparent diagrams get a white background (readable in dark mode)
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    // Try a few formats and keep whichever is smallest. Line drawings and screenshots are
    // often smallest as PNG; photos are smallest as WebP/JPEG.
    const candidates = [canvas.toDataURL('image/webp', 0.82), canvas.toDataURL('image/jpeg', 0.85), canvas.toDataURL('image/png')]
      .filter((u) => u.startsWith('data:image/'));
    if (file.size < 2_000_000) candidates.push(await readAsDataURL(file)); // keep the original if it is already smaller
    const src = candidates.reduce((a, b) => (b.length < a.length ? b : a));
    return { src, size: 'm', caption: '' };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Approximate size in KB of a data URL. */
export const dataUrlKB = (src) => Math.round((src.length * 3) / 4 / 1024);
