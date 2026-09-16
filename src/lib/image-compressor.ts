/**
 * Client-Side Image Optimizer for CSS Slicer
 * Automatically resizes & compresses user/teacher uploaded images to modern WebP.
 * Keeps Supabase storage footprint tiny (~80KB - 120KB per target design slice).
 */

export interface CompressionResult {
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  width: number;
  height: number;
  savedPercent: number;
  formattedOriginal: string;
  formattedCompressed: string;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export async function compressImageToWebP(
  source: File | Blob | string,
  maxWidth = 1200,
  maxHeight = 900,
  quality = 0.82
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    let originalSizeBytes = 0;

    if (source instanceof Blob) {
      originalSizeBytes = source.size;
    } else if (typeof source === "string") {
      // Estimate base64 size
      const padding = source.endsWith("==") ? 2 : source.endsWith("=") ? 1 : 0;
      originalSizeBytes = Math.round((source.length * 3) / 4) - padding;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Maintain aspect ratio while constraining to max bounds
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      // Smooth downscaling rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Attempt webp compression
      let outputDataUrl = canvas.toDataURL("image/webp", quality);

      // If browser doesn't support WebP export (returns image/png), fallback to jpeg
      if (!outputDataUrl.startsWith("data:image/webp")) {
        outputDataUrl = canvas.toDataURL("image/jpeg", quality);
      }

      // Compute compressed size
      const padding = outputDataUrl.endsWith("==")
        ? 2
        : outputDataUrl.endsWith("=")
        ? 1
        : 0;
      const base64Length = outputDataUrl.split(",")[1]?.length || outputDataUrl.length;
      const compressedSizeBytes = Math.round((base64Length * 3) / 4) - padding;

      const safeOriginal = originalSizeBytes > 0 ? originalSizeBytes : compressedSizeBytes * 1.5;
      const savedPercent = Math.max(
        0,
        Math.min(99, Math.round(((safeOriginal - compressedSizeBytes) / safeOriginal) * 100))
      );

      resolve({
        dataUrl: outputDataUrl,
        originalSizeBytes: safeOriginal,
        compressedSizeBytes,
        width,
        height,
        savedPercent,
        formattedOriginal: formatBytes(safeOriginal),
        formattedCompressed: formatBytes(compressedSizeBytes),
      });
    };

    img.onerror = (err) => {
      reject(new Error("Görsel yüklenirken bir hata oluştu: " + String(err)));
    };

    if (source instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    } else {
      img.src = source;
    }
  });
}
