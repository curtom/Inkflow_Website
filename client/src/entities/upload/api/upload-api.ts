import { api } from "@/shared/api/axios";

type UploadImageResponse = {
    message: string;
    data: {
        url: string;
        publicId: string;
    };
};

export async function uploadImageRequest(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return (await api.post("/uploads/image", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    })) as unknown as UploadImageResponse;
}