/**
 * Client-side utility for compressing uploaded images before storing or transmitting them.
 * Resizes high-resolution photos down to web-friendly dimensions and converts to JPEG,
 * reducing multi-megabyte files (e.g. 5MB-10MB phone camera shots) to ~100KB-250KB.
 * This prevents localStorage QuotaExceededError and MongoDB Atlas 16MB document limits.
 */

export interface ProcessedFile {
  dataUrl: string;
  fileName: string;
  fileSize: number;
}

export async function compressImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.75
): Promise<ProcessedFile> {
  // If the file is a PDF, do not attempt canvas processing; read as data URL directly.
  if (file.type === "application/pdf") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          dataUrl: reader.result as string,
          fileName: file.name,
          fileSize: file.size,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve({
            dataUrl: rawDataUrl,
            fileName: file.name,
            fileSize: file.size,
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        const approxSize = Math.round((compressedDataUrl.length * 3) / 4);

        // Sanitize file name extension to .jpg
        const cleanName = file.name.replace(/\.[^/.]+$/, ".jpg");

        resolve({
          dataUrl: compressedDataUrl,
          fileName: cleanName,
          fileSize: approxSize,
        });
      };

      img.onerror = () => {
        resolve({
          dataUrl: rawDataUrl,
          fileName: file.name,
          fileSize: file.size,
        });
      };

      img.src = rawDataUrl;
    };

    reader.onerror = () => {
      resolve({
        dataUrl: "",
        fileName: file.name,
        fileSize: 0,
      });
    };

    reader.readAsDataURL(file);
  });
}
