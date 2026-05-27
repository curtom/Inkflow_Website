import { randomUUID } from "crypto";
import OSS from "ali-oss";
import COS from "cos-nodejs-sdk-v5";
import { env } from "../../config/env";
import { AppError } from "../../common/utils/app-error";

function extFromContentType(ct: string): string {
    const m: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
        "image/avif": "avif",
    };
    return m[ct] ?? "jpg";
}

function publicObjectUrl(base: string, key: string): string {
    const b = base.replace(/\/+$/, "");
    return `${b}/${encodeURI(key)}`;
}

function assertOssConfigured() {
    if (
        !env.ossRegion ||
        !env.ossAccessKeyId ||
        !env.ossAccessKeySecret ||
        !env.ossBucket ||
        !env.ossPublicBase
    ) {
        throw new AppError("OSS direct upload env is incomplete", 503);
    }
}

function assertCosConfigured() {
    if (
        !env.cosSecretId ||
        !env.cosSecretKey ||
        !env.cosRegion ||
        !env.cosBucket ||
        !env.cosPublicBase
    ) {
        throw new AppError("COS direct upload env is incomplete", 503);
    }
}

type PresignResult = {
    uploadUrl: string;
    publicUrl: string;
    key: string;
    expiresIn: number;
    /** 与签名一致的 Content-Type，客户端 PUT 必须原样带上，否则 OSS 报 SignatureDoesNotMatch */
    contentType: string;
};

async function presignOssPut(key: string, contentType: string): Promise<PresignResult> {
    assertOssConfigured();
    const expires = 600;
    const client = new OSS({
        region: env.ossRegion!,
        accessKeyId: env.ossAccessKeyId!,
        accessKeySecret: env.ossAccessKeySecret!,
        bucket: env.ossBucket!,
        /** 预签名为 https，避免浏览器 mixed content / 与控制台默认行为一致 */
        secure: true,
        ...(env.ossEndpoint ? { endpoint: env.ossEndpoint } : {}),
    });

    // 关键：ali-oss v6 的 signatureUrl 把 Content-Type 直接放在 options 顶层，
    // 不是 options.headers。放错位置 → 签名里 Content-Type 为空，但浏览器 PUT
    // 一定会带这个头，OSS 用请求头里的真实值重算签名 → SignatureDoesNotMatch。
    const uploadUrl = client.signatureUrl(key, {
        method: "PUT",
        expires,
        "Content-Type": contentType,
    } as Parameters<InstanceType<typeof OSS>["signatureUrl"]>[1]);

    return {
        uploadUrl,
        publicUrl: publicObjectUrl(env.ossPublicBase!, key),
        key,
        expiresIn: expires,
        contentType,
    };
}

async function presignCosPut(key: string, contentType: string): Promise<PresignResult> {
    assertCosConfigured();
    const expires = 600;
    const cos = new COS({
        SecretId: env.cosSecretId!,
        SecretKey: env.cosSecretKey!,
    });

    const uploadUrl = await new Promise<string>((resolve, reject) => {
        cos.getObjectUrl(
            {
                Bucket: env.cosBucket!,
                Region: env.cosRegion!,
                Key: key,
                Sign: true,
                Method: "PUT",
                Expires: expires,
            },
            (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!data?.Url) {
                    reject(new Error("COS presign returned no URL"));
                    return;
                }
                resolve(data.Url);
            }
        );
    });

    return {
        uploadUrl,
        publicUrl: publicObjectUrl(env.cosPublicBase!, key),
        key,
        expiresIn: expires,
        contentType,
    };
}

/** contentType 须为已校验的 image/* */
export async function createPresignedImageUpload(contentType: string): Promise<PresignResult> {
    const provider = env.directUploadProvider?.trim().toLowerCase();
    if (!provider || (provider !== "oss" && provider !== "cos")) {
        throw new AppError("Direct upload is not enabled (set DIRECT_UPLOAD_PROVIDER=oss|cos)", 503);
    }

    const ext = extFromContentType(contentType);
    const key = `inkflow/${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;

    if (provider === "oss") {
        return presignOssPut(key, contentType);
    }
    return presignCosPut(key, contentType);
}
