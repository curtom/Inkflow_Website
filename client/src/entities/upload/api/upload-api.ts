import { api } from "@/shared/api/axios";
import {
    compressImageFile,
    type CompressImageOptions,
} from "@/entities/upload/lib/compress-image";

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

type PresignApiResponse = {
    message: string;
    data: {
        uploadUrl: string;
        publicUrl: string;
        key: string;
        expiresIn: number;
        /** 服务端用于签名的类型，PUT 必须与此一致（旧版接口无此字段时用请求体里的类型并小写化） */
        contentType?: string;
    };
};

const cloudName = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined)?.trim();
const uploadPreset = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined)?.trim();

const useDirectOssCos = (() => {
    const v = (import.meta.env.VITE_DIRECT_UPLOAD as string | undefined)?.trim().toLowerCase();
    return v === "1" || v === "true" || v === "oss" || v === "cos" || v === "yes";
})();

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

async function uploadViaPresignedOssCos(file: File): Promise<UploadImageResponse> {
    const contentType = file.type || "image/jpeg";
    const json = (await api.post("/uploads/presign", {
        contentType,
    })) as unknown as PresignApiResponse;

    const { uploadUrl, publicUrl, key, contentType: signedContentType } = json.data;
    const putContentType =
        signedContentType ?? contentType.split(";")[0]!.trim().toLowerCase();
    const put = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
            "Content-Type": putContentType,
        },
    });

    if (!put.ok) {
        const errText = await put.text().catch(() => "");
        throw new Error(
            `Object storage upload failed: ${put.status} ${put.statusText}${errText ? ` ${errText.slice(0, 200)}` : ""}`
        );
    }

    return {
        message: "Image uploaded successfully",
        data: {
            url: publicUrl,
            publicId: key,
        },
    };
}

export async function uploadImageRequest(
    file: File,
    compressOptions?: CompressImageOptions
) {
    const uploadFile = await compressImageFile(file, compressOptions);

    if (useDirectOssCos) {
        return uploadViaPresignedOssCos(uploadFile);
    }

    if (cloudName && uploadPreset) {
        return uploadViaCloudinaryDirect(uploadFile, cloudName, uploadPreset);
    }

    const formData = new FormData();
    formData.append("file", uploadFile);

    return (await api.post("/uploads/image", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        timeout: 120_000,
    })) as unknown as UploadImageResponse;
}
