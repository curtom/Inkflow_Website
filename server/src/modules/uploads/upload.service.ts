import cloudinary from "../../config/cloudinary";
import { AppError } from "../../common/utils/app-error";

export async function uploadImageToCloudinary(file: Express.Multer.File) {
  if (!file) {
    throw new AppError("No file uploaded", 400);
  }

  const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder: "inkflow",
    resource_type: "image",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}