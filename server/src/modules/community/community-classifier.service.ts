import { env } from "../../config/env";
import { TAB_CLASSIFICATION_ROWS } from "./community-catalog";
import {
    buildArticleEmbeddingText,
    buildTabEmbeddingText,
    cosineSimilarity,
    fetchEmbeddingVectors,
} from "./community-embedding";

type TabEmbeddingRow = {
    communityId: string;
    tabKey: string;
    label: string;
    tag: string;
    embedding: number[];
};

type LanguageHint = "english" | "chinese" | "neutral";

let tabEmbeddingsPromise: Promise<TabEmbeddingRow[]> | null = null;

function hasEmbeddingApiKey(): boolean {
    return Boolean(env.dashscopeApiKey || env.openaiApiKey);
}

async function loadTabEmbeddings(): Promise<TabEmbeddingRow[]> {
    if (!hasEmbeddingApiKey()) {
        return [];
    }

    const inputs = TAB_CLASSIFICATION_ROWS.map((row) =>
        buildTabEmbeddingText(row.catalog, row.tab)
    );

    const vectors = await fetchEmbeddingVectors(inputs);

    return TAB_CLASSIFICATION_ROWS.map((row, i) => ({
        communityId: row.communityId,
        tabKey: row.tabKey,
        label: row.label,
        tag: row.tag,
        embedding: vectors[i] as number[],
    }));
}

function getTabEmbeddingsCached(): Promise<TabEmbeddingRow[]> {
    if (!tabEmbeddingsPromise) {
        tabEmbeddingsPromise = loadTabEmbeddings().catch((err) => {
            tabEmbeddingsPromise = null;
            throw err;
        });
    }
    return tabEmbeddingsPromise;
}

async function embedArticleText(text: string): Promise<number[]> {
    if (!hasEmbeddingApiKey()) {
        throw new Error("DASHSCOPE_API_KEY or OPENAI_API_KEY is not set");
    }
    const [vec] = await fetchEmbeddingVectors([text]);
    return vec as number[];
}

function detectLanguageHint(text: string): LanguageHint {
    const sample = text.slice(0, 3000);
    const latinMatches = sample.match(/[A-Za-z]/g) ?? [];
    const cjkMatches = sample.match(/[\u4e00-\u9fff]/g) ?? [];
    const latinCount = latinMatches.length;
    const cjkCount = cjkMatches.length;

    if (latinCount >= cjkCount * 1.5 && latinCount >= 80) {
        return "english";
    }
    if (cjkCount >= latinCount * 1.5 && cjkCount >= 40) {
        return "chinese";
    }
    return "neutral";
}

function applyLanguagePrior(
    score: number,
    suggestion: Pick<CommunityTagSuggestion, "tag">,
    hint: LanguageHint
): number {
    const boost = env.communityLanguagePriorBoost;
    if (boost <= 0 || hint === "neutral") {
        return score;
    }

    if (hint === "english") {
        if (suggestion.tag === "language-english") return score + boost;
        if (suggestion.tag === "language-chinese") return score - boost;
    }
    if (hint === "chinese") {
        if (suggestion.tag === "language-chinese") return score + boost;
        if (suggestion.tag === "language-english") return score - boost;
    }
    return score;
}

export type CommunityTagSuggestion = {
    communityId: string;
    tabKey: string;
    label: string;
    tag: string;
    score: number;
    meetsThreshold: boolean;
};

export async function suggestCommunityTags(input: {
    title: string;
    summary: string;
    content: string;
    existingTags: string[];
}): Promise<{
    threshold: number;
    suggestions: CommunityTagSuggestion[];
    matchedTags: string[];
    disabledReason?: "missing_api_key";
}> {
    const threshold = env.communityMatchMinSimilarity;
    const minMargin = env.communityMatchMinMargin;

    if (!hasEmbeddingApiKey()) {
        return {
            threshold,
            suggestions: [],
            matchedTags: [],
            disabledReason: "missing_api_key",
        };
    }

    const docText = buildArticleEmbeddingText(input);
    const languageHint = detectLanguageHint(docText);
    const [docEmbedding, tabRows] = await Promise.all([
        embedArticleText(docText),
        getTabEmbeddingsCached(),
    ]);

    const suggestions: CommunityTagSuggestion[] = tabRows.map((row) => {
        const baseScore = cosineSimilarity(docEmbedding, row.embedding);
        const score = applyLanguagePrior(
            baseScore,
            { tag: row.tag },
            languageHint
        );
        return {
            communityId: row.communityId,
            tabKey: row.tabKey,
            label: row.label,
            tag: row.tag,
            score,
            meetsThreshold: score >= threshold,
        };
    });

    suggestions.sort((a, b) => b.score - a.score);

    const top1 = suggestions[0];
    const top2 = suggestions[1];
    const topDiff = top1 && top2 ? top1.score - top2.score : Infinity;
    const hasConfidentTop1 = Boolean(
        top1 &&
            top1.score >= threshold &&
            (suggestions.length === 1 || topDiff >= minMargin)
    );

    if (env.communityClassifierDebug) {
        const top3 = suggestions.slice(0, 3).map((s, rank) => ({
            rank: rank + 1,
            communityId: s.communityId,
            tabKey: s.tabKey,
            label: s.label,
            tag: s.tag,
            score: Math.round(s.score * 10_000) / 10_000,
            meetsThreshold: s.meetsThreshold,
        }));
        const titlePreview =
            input.title.length > 60
                ? `${input.title.slice(0, 60)}…`
                : input.title;
        console.log(
            `[community-classifier] top3 (threshold=${threshold}, margin=${minMargin}, lang=${languageHint}) title=${JSON.stringify(titlePreview)}`,
            JSON.stringify(top3)
        );
    }

    const matchedTags = hasConfidentTop1 && top1 ? [top1.tag] : [];

    return { threshold, suggestions, matchedTags };
}

function dedupeTags(tags: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of tags) {
        const trimmed = t.trim();
        if (!trimmed || seen.has(trimmed)) continue;
        seen.add(trimmed);
        out.push(trimmed);
    }
    return out;
}

/**
 * Merges canonical community tags into `existingTags` when embedding similarity
 * to a tab profile is >= `COMMUNITY_MATCH_MIN_SIMILARITY`. Never removes tags.
 * If no embedding key is set or the API fails, returns `existingTags` unchanged.
 */
export async function mergeCommunityTagsFromEmbedding(input: {
    title: string;
    summary: string;
    content: string;
    existingTags: string[];
}): Promise<string[]> {
    const base = dedupeTags(input.existingTags);

    try {
        const { matchedTags, disabledReason } = await suggestCommunityTags(input);
        if (disabledReason === "missing_api_key" || matchedTags.length === 0) {
            return base;
        }
        return dedupeTags([...base, ...matchedTags]);
    } catch (err) {
        console.warn("[community-classifier] merge skipped:", err);
        return base;
    }
}
