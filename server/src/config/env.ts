import dotenv from "dotenv";

dotenv.config();

function getEnv(key: string, defaultValue?: string) {
    const value = process.env[key] ?? defaultValue;

    if(!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }

    return value;
}

function getOptionalEnv(key: string, defaultValue?: string) {
    const value = process.env[key];
    if (value === undefined || value === "") {
        return defaultValue;
    }
    return value;
}

/** CLIENT_URL 支持逗号分隔多个前端地址（CORS origin 列表） */
function parseClientOrigins(raw: string): string[] {
    const origins = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    if (origins.length === 0) {
        throw new Error("CLIENT_URL must contain at least one URL");
    }
    return origins;
}

export const env = {
    port: Number(getEnv("PORT", "5000")),
    mongoUri: getEnv("MONGO_URI"),
    jwtSecret: getEnv("JWT_SECRET"),
    jwtExpiresIn: getEnv("JWT_EXPIRES_IN", "7d"),
    clientOrigins: parseClientOrigins(
        getEnv("CLIENT_URL", "http://localhost:5173")
    ),
    nodeEnv: getEnv("NODE_ENV", "development"),
    /** 国内兼容模式：`https://dashscope.aliyuncs.com/compatible-mode/v1` */
    dashscopeApiKey: getOptionalEnv("DASHSCOPE_API_KEY"),
    dashscopeEmbeddingBaseUrl:
        getOptionalEnv("DASHSCOPE_EMBEDDING_BASE_URL") ??
        "https://dashscope.aliyuncs.com/compatible-mode/v1",
    dashscopeEmbeddingModel:
        getOptionalEnv("DASHSCOPE_EMBEDDING_MODEL") ?? "text-embedding-v4",
    /**
     * text-embedding-v4 可选：2048 / 1536 / 1024（默认）/ 768 / …
     * 不设则交给 API 默认，须保证文章与 Tab 使用同一设置。
     */
    embeddingDimensions: (() => {
        const d = getOptionalEnv("EMBEDDING_DIMENSIONS");
        if (d === undefined) return undefined;
        const n = Number(d);
        return Number.isNaN(n) ? undefined : n;
    })(),
    openaiApiKey: getOptionalEnv("OPENAI_API_KEY"),
    openaiEmbeddingModel:
        getOptionalEnv("OPENAI_EMBEDDING_MODEL") ?? "text-embedding-3-small",
    communityMatchMinSimilarity: Number(
        getOptionalEnv("COMMUNITY_MATCH_MIN_SIMILARITY") ?? "0.35"
    ),
    /** top1 与 top2 分差小于该值时不自动归类 */
    communityMatchMinMargin: Number(
        getOptionalEnv("COMMUNITY_MATCH_MIN_MARGIN") ?? "0.015"
    ),
    /** 是否把作者已有标签拼进 embedding 文本，默认关闭以避免误导模型 */
    embeddingIncludeExistingTags: (() => {
        const v = getOptionalEnv("EMBEDDING_INCLUDE_EXISTING_TAGS")?.toLowerCase();
        return v === "true" || v === "1" || v === "yes";
    })(),
    /** 英文/中文轻量先验加权（绝对分值） */
    communityLanguagePriorBoost: Number(
        getOptionalEnv("COMMUNITY_LANGUAGE_PRIOR_BOOST") ?? "0.015"
    ),
    /** 为 true 时，每次分类在控制台打印相似度 Top3 分组（调阈值用） */
    communityClassifierDebug: (() => {
        const v = getOptionalEnv("COMMUNITY_CLASSIFIER_DEBUG")?.toLowerCase();
        return v === "true" || v === "1" || v === "yes";
    })(),
};