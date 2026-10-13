import { Capacitor, CapacitorHttp } from "@capacitor/core";

const BGG_IMAGE_BASE_URL = 'https://cf.geekdo-images.com';
const TIMEOUT_MS = 2500;

async function imageSource(url: string): Promise<string> {
  if (Capacitor.isNativePlatform()) {
    const res = await CapacitorHttp.get({ url, responseType: 'blob' });
    const type = res.headers['Content-Type'] ?? res.headers['content-type'] ?? 'image/jpeg';
    return `data:${type};base64,${res.data}`;
  }
  return url.startsWith(BGG_IMAGE_BASE_URL) ? url.replace(BGG_IMAGE_BASE_URL, '/geekdo-images') : url;
}

export async function loadFaceImage(url: string | undefined): Promise<HTMLImageElement | null> {
  if (!url) return null;
  try {
    const src = await imageSource(url);
    const image = new Image();
    image.crossOrigin = 'anonymous';
    const loaded = new Promise<HTMLImageElement>((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Could not load ${url}`));
    })
    image.src = src;
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), TIMEOUT_MS));
    return await Promise.race([ loaded, timeout ]);
  } catch {
    return null;
  }
}