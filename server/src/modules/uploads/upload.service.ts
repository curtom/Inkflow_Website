import type { UploadApiResponse } from "cloudinary";
import cloudinary from "../../config/cloudinary";
import { AppError } from "../../common/utils/app-error";

const ALLOWED_IMAGE_CT = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
]);

export function normalizeAndAssertImageContentType(raw: string): string {
    const ct = raw.split(";")[0]!.trim().toLowerCase();
    if (!ALLOWED_IMAGE_CT.has(ct)) {
        throw new AppError("Invalid content type for image upload", 400);
    }
    return ct;
}

function uploadBufferToCloudinary(buffer: Buffer): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "inkflow", resource_type: "image" },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result) {
          reject(new Error("Cloudinary upload returned no result"));
          return;
        }
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

export async function uploadImageToCloudinary(file: Express.Multer.File) {
  if (!file) {
    throw new AppError("No file uploaded", 400);
  }

  const result = await uploadBufferToCloudinary(file.buffer);

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}