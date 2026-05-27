export type CompressImageOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: "image/webp" | "image/jpeg";
};

const DEFAULT_MAX_SIZE = 1600;
const DEFAULT_QUALITY = 0.82;
const DEFAULT_MIME_TYPE = "image/webp";
const SKIP_TYPES = new Set(["image/gif", "image/svg+xml"]);

function shouldSkipCompression(file: File) {
  if (!file.type.startsWith("image/")) return true;
  if (SKIP_TYPES.has(file.type)) return true;
  return typeof document === "undefined";
}

function calculateTargetSize(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
) {
  const ratio = Math.min(1, maxWidth / width, maxHeight / height);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });
}

function compressedFileName(name: string, mimeType: string) {
  const extMap: Record<string, string> = {
    "image/webp": "webp",
    "image/jpeg": "jpg",
    "image/png": "png",
  };
  const ext = extMap[mimeType] ?? "jpg";
  const base = name.replace(/\.[^.]+$/, "") || "image";
  return `${base}.${ext}`;
}

export async function compressImageFile(
  file: File,
  options: CompressImageOptions = {}
): Promise<File> {
  if (shouldSkipCompression(file)) {
    return file;
  }

  const maxWidth = options.maxWidth ?? DEFAULT_MAX_SIZE;
  const maxHeight = options.maxHeight ?? DEFAULT_MAX_SIZE;
  const quality = options.quality ?? DEFAULT_QUALITY;
  const mimeType = options.mimeType ?? DEFAULT_MIME_TYPE;
  const url = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();

    const target = calculateTargetSize(image.naturalWidth, image.naturalHeight, maxWidth, maxHeight);
    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return file;
    }

    ctx.drawImage(image, 0, 0, target.width, target.height);
    const blob = await canvasToBlob(canvas, mimeType, quality);

    if (!blob || blob.size >= file.size) {
      return file;
    }

    const outputType = blob.type || mimeType;

    return new File([blob], compressedFileName(file.name, outputType), {
      type: outputType,
      lastModified: Date.now(),
    });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}
