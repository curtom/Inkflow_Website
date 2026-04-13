import { NextFunction, Request, Response } from "express";
import { successResponse } from "../../common/utils/api-response";
import { uploadImageToCloudinary } from "./upload.service";

export async function uploadImageController(
   req: Request,
   res: Response,
   next: NextFunction
) {
    try {
       const file = req.file;

       if(!file) {
        return res.status(400).json({
            message: "No file uploaded",
        });
       }

       const result = await uploadImageToCloudinary(file);

       res.status(200).json(successResponse("Image uploaded successfully", result));
    } catch(error) {
          next(error);
    }
}