/**
 * Client-Side Image Pre-Compressor
 * Resizes and converts images to WebP/JPEG in the browser before upload,
 * cutting bandwidth and preventing serverless memory exhaustion.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default: 0.85)
  format?: 'image/webp' | 'image/jpeg' | 'image/png';
}

export const CATEGORY_COMPRESSION_PRESETS: Record<string, CompressionOptions> = {
  avatars: { maxWidth: 512, maxHeight: 512, quality: 0.88, format: 'image/webp' },
  covers: { maxWidth: 1920, maxHeight: 1080, quality: 0.85, format: 'image/webp' },
  posts: { maxWidth: 2048, maxHeight: 2048, quality: 0.85, format: 'image/webp' },
  stories: { maxWidth: 1080, maxHeight: 1920, quality: 0.85, format: 'image/webp' },
  messages: { maxWidth: 1600, maxHeight: 1600, quality: 0.80, format: 'image/webp' },
};

export async function compressImageFile(
  file: File,
  options: CompressionOptions = {}
): Promise<{ file: File; originalSize: number; compressedSize: number; ratio: number }> {
  // If not an image or SVG/GIF, return as-is (do not compress animated GIFs or vector SVGs)
  if (
    !file.type.startsWith('image/') ||
    file.type === 'image/svg+xml' ||
    file.type === 'image/gif'
  ) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      ratio: 1,
    };
  }

  const maxWidth = options.maxWidth || 2048;
  const maxHeight = options.maxHeight || 2048;
  const quality = options.quality ?? 0.85;
  const outputFormat = options.format || 'image/webp';

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect ratio scaling
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ file, originalSize: file.size, compressedSize: file.size, ratio: 1 });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({ file, originalSize: file.size, compressedSize: file.size, ratio: 1 });
              return;
            }

            // Only use compressed blob if it actually reduced file size
            if (blob.size < file.size) {
              const ext = outputFormat === 'image/webp' ? '.webp' : outputFormat === 'image/jpeg' ? '.jpg' : '.png';
              const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
              const compressedFile = new File([blob], `${nameWithoutExt}${ext}`, {
                type: outputFormat,
                lastModified: Date.now(),
              });

              resolve({
                file: compressedFile,
                originalSize: file.size,
                compressedSize: blob.size,
                ratio: Number((blob.size / file.size).toFixed(2)),
              });
            } else {
              resolve({ file, originalSize: file.size, compressedSize: file.size, ratio: 1 });
            }
          },
          outputFormat,
          quality
        );
      };

      img.onerror = () => {
        resolve({ file, originalSize: file.size, compressedSize: file.size, ratio: 1 });
      };
    };

    reader.onerror = () => {
      resolve({ file, originalSize: file.size, compressedSize: file.size, ratio: 1 });
    };
  });
}
