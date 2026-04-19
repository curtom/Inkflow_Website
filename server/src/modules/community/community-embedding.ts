import { env } from "../../config/env";
import type { CommunityCatalogEntry, CommunityTabDefinition } from "./community-catalog";

export function stripMarkdownLite(markdown: string): string {
    return markdown
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/`[^`]+`/g, " ")
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1 ")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1 ")
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/[*_~>]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * 为了让话题信号不被正文稀释，对 title/summary 做重复放大，
 * 并对 content 做较短裁剪（默认 2500 chars，核心话题通常在前段）。
 * 不再使用英文前缀（如 "Title:"），避免对中文帖子引入英文偏置。
 */
export function buildArticleEmbeddingText(input: {
    title: string;
    summary: string;
    content: string;
    existingTags: string[];
}): string {
    const title = input.title.trim();
    const summary = input.summary.trim();
    const excerpt = stripMarkdownLite(input.content).slice(0, 2500);

    const parts: string[] = [];

    if (title) {
        parts.push(title);
        parts.push(title);
        parts.push(title);
    }
    if (summary) {
        parts.push(summary);
        parts.push(summary);
    }
    if (env.embeddingIncludeExistingTags && input.existingTags.length) {
        parts.push(input.existingTags.join(" "));
    }
    if (excerpt) {
        parts.push(excerpt);
    }

    return parts.join("\n");
}

/**
 * Tab 画像以「社区/分组名 + 双语语义 + 高密度关键词」为主，
 * 去掉重复的社区 boilerplate，提升同一社区下不同 Tab 之间的判别度。
 */
export function buildTabEmbeddingText(
    community: CommunityCatalogEntry,
    tab: CommunityTabDefinition
): string {
    const headline = `${community.title} / ${tab.label}`;
    const keywordLine = tab.keywords.join(" ");

    return [
        headline,
        tab.tagMeaning,
        tab.tagMeaningEn,
        keywordLine,
    ].join("\n");
}

export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) {
        return 0;
    }
    let dot = 0;
    let na = 0;
    let nb = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    const denom = Math.sqrt(na) * Math.sqrt(nb);
    return denom === 0 ? 0 : dot / denom;
}

type OpenAIEmbeddingsResponse = {
    data?: Array<{ embedding: number[]; index: number }>;
    error?: { message?: string };
};

/** 阿里云 DashScope 兼容 OpenAI 的 embeddings；单批 input 条数上限通常为 10 */
const DASHSCOPE_COMPAT_BATCH_SIZE = 10;

type DashScopeErrorBody = {
    message?: string;
    error?: { message?: string };
};

function normalizeCompatibleBaseUrl(baseUrl: string): string {
    return baseUrl.replace(/\/$/, "");
}

/**
 * DashScope 国内：`https://dashscope.aliyuncs.com/compatible-mode/v1`
 * 请求体与 OpenAI 类似，可带 `dimensions`（text-embedding-v4）。
 */
export async function fetchDashScopeCompatibleEmbeddings(
    apiKey: string,
    baseUrl: string,
    model: string,
    inputs: string[],
    dimensions?: number
): Promise<number[][]> {
    const url = `${normalizeCompatibleBaseUrl(baseUrl)}/embeddings`;
    const all: number[][] = [];

    for (let offset = 0; offset < inputs.length; offset += DASHSCOPE_COMPAT_BATCH_SIZE) {
        const chunk = inputs.slice(offset, offset + DASHSCOPE_COMPAT_BATCH_SIZE);
        const body: Record<string, unknown> = { model, input: chunk };
        if (dimensions !== undefined && !Number.isNaN(dimensions)) {
            body.dimensions = dimensions;
        }

        const res = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const json = (await res.json()) as OpenAIEmbeddingsResponse &
            DashScopeErrorBody;

        if (!res.ok) {
            throw new Error(
                json.error?.message ??
                    json.message ??
                    `DashScope embeddings failed (${res.status})`
            );
        }

        const rows = json.data;
        if (!rows || rows.length !== chunk.length) {
            throw new Error("DashScope embeddings response size mismatch");
        }

        const sorted = [...rows].sort((a, b) => a.index - b.index);
        all.push(...sorted.map((r) => r.embedding));
    }

    return all;
}

export async function fetchOpenAiEmbeddings(
    apiKey: string,
    model: string,
    inputs: string[]
): Promise<number[][]> {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ model, input: inputs }),
    });

    const json = (await res.json()) as OpenAIEmbeddingsResponse;

    if (!res.ok) {
        throw new Error(
            json.error?.message ?? `OpenAI embeddings failed (${res.status})`
        );
    }

    const rows = json.data;
    if (!rows || rows.length !== inputs.length) {
        throw new Error("OpenAI embeddings response size mismatch");
    }

    const sorted = [...rows].sort((a, b) => a.index - b.index);
    return sorted.map((r) => r.embedding);
}

/** 优先使用 DashScope（国内），否则 OpenAI */
export async function fetchEmbeddingVectors(
    inputs: string[]
): Promise<number[][]> {
    if (env.dashscopeApiKey) {
        return fetchDashScopeCompatibleEmbeddings(
            env.dashscopeApiKey,
            env.dashscopeEmbeddingBaseUrl,
            env.dashscopeEmbeddingModel,
            inputs,
            env.embeddingDimensions
        );
    }
    if (env.openaiApiKey) {
        return fetchOpenAiEmbeddings(
            env.openaiApiKey,
            env.openaiEmbeddingModel,
            inputs
        );
    }
    throw new Error(
        "No embedding provider configured (set DASHSCOPE_API_KEY or OPENAI_API_KEY)"
    );
}
