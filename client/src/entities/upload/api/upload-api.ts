import { api } from "@/shared/api/axios";

type UploadImageResponse = {
    message: string;
    data: {
        url: string;
        publicId: string;
    };
};

type CloudinaryDirectResponse = {
    secure_url?: string;
    public_id?: string;
    error?: { message?: string };
};

const cloudName = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined)?.trim();
const uploadPreset = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined)?.trim();

async function uploadViaCloudinaryDirect(
    file: File,
    cloud: string,
    preset: string
): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);

    const endpoint = `https://api.cloudinary.com/v1_1/${cloud}/image/upload`;
    const res = await fetch(endpoint, { method: "POST", body: formData });
    const body = (await res.json()) as CloudinaryDirectResponse;

    if (!res.ok) {
        const msg = body.error?.message ?? `${res.status} ${res.statusText}`;
        throw new Error(msg);
    }
    if (!body.secure_url || !body.public_id) {
        throw new Error("Invalid Cloudinary response");
    }

    return {
        message: "Image uploaded successfully",
        data: {
            url: body.secure_url,
            publicId: body.public_id,
        },
    };
}

export async function uploadImageRequest(file: File) {
    if (cloudName && uploadPreset) {
        return uploadViaCloudinaryDirect(file, cloudName, uploadPreset);
    }

    const formData = new FormData();
    formData.append("file", file);

    return (await api.post("/uploads/image", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        timeout: 120_000,
    })) as unknown as UploadImageResponse;
}