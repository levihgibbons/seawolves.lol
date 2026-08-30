// Turns a user-picked file into a small square JPEG data URL, stored
// directly in User.image — no object storage bucket needed for something
// this size. Center-crops to square, downsizes to AVATAR_MAX_DIMENSION,
// and re-encodes so a random phone photo doesn't balloon into megabytes of
// base64 sitting in Postgres.

export const AVATAR_MAX_DIMENSION = 320;
export const AVATAR_JPEG_QUALITY = 0.85;
// Original upload size gate, before any resizing — keeps the browser from
// choking on someone picking a 50MB RAW photo.
export const MAX_AVATAR_FILE_BYTES = 10 * 1024 * 1024;

export async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  if (file.size > MAX_AVATAR_FILE_BYTES) {
    throw new Error("That image is too large — try one under 10MB.");
  }

  const bitmap = await createImageBitmap(file);
  try {
    const cropSize = Math.min(bitmap.width, bitmap.height);
    const sx = (bitmap.width - cropSize) / 2;
    const sy = (bitmap.height - cropSize) / 2;
    const targetSize = Math.min(AVATAR_MAX_DIMENSION, cropSize);

    const canvas = document.createElement("canvas");
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Couldn't process that image.");

    ctx.drawImage(bitmap, sx, sy, cropSize, cropSize, 0, 0, targetSize, targetSize);
    return canvas.toDataURL("image/jpeg", AVATAR_JPEG_QUALITY);
  } finally {
    bitmap.close();
  }
}

// Same idea for announcement images, but shown full-width rather than
// cropped to a circle, so this keeps the original aspect ratio and just
// caps the longest side.
// The feed renders these inside `max-h-96 w-full object-cover`, so 1600px was
// far more than is ever displayed — and the encoded string is inlined into the
// page payload as a base64 data: URL, so every extra pixel is shipped twice.
export const ANNOUNCEMENT_IMAGE_MAX_DIMENSION = 1280;
export const ANNOUNCEMENT_IMAGE_JPEG_QUALITY = 0.78;
export const MAX_ANNOUNCEMENT_IMAGE_FILE_BYTES = 10 * 1024 * 1024;

export async function fileToAnnouncementImageDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  if (file.size > MAX_ANNOUNCEMENT_IMAGE_FILE_BYTES) {
    throw new Error("That image is too large — try one under 10MB.");
  }

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(
      1,
      ANNOUNCEMENT_IMAGE_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height)
    );
    const targetWidth = Math.round(bitmap.width * scale);
    const targetHeight = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Couldn't process that image.");

    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    return canvas.toDataURL("image/jpeg", ANNOUNCEMENT_IMAGE_JPEG_QUALITY);
  } finally {
    bitmap.close();
  }
}
