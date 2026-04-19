import {Article} from "./article.model";
import {generateSlug} from "../../common/utils/slug";
import {AppError} from "../../common/utils/app-error";
import { ArticleView } from "../views/article-view.model";
import { mergeCommunityTagsFromEmbedding } from "../community/community-classifier.service";


type ArticleAuthor = {
    _id: unknown;
    username: string;
    email: string;
    bio?: string;
    avatar?: string;
};

function sanitizeAuthor(author: ArticleAuthor) {
    return {
        id: String(author._id),
        username: author.username,
        email: author.email,
        bio: author.bio ?? "",
        avatar: author.avatar ?? "",
    };
}

type ArticleDocumentLike = {
    _id: unknown;
    title: string;
    slug: string;
    summary: string;
    content: string;
    coverImage?: string;
    tags: string[];
    author: ArticleAuthor;
    likedBy: unknown[];
    favoritedBy: unknown[];
    likesCount: number;
    favoritesCount: number;
    commentsCount: number;
    viewsCount: number;
    createdAt: Date;
    updatedAt: Date;
};

function sanitizeArticle(article: ArticleDocumentLike, userId?: string) {
    return {
        id: String(article._id),
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        content: article.content,
        coverImage: article.coverImage ?? "",
        tags: article.tags ?? [],
        author: sanitizeAuthor(article.author),
        likesCount: article.likesCount ?? 0,
        favoritesCount: article.favoritesCount ?? 0,
        commentsCount: article.commentsCount ?? 0,
        viewsCount: article.viewsCount ?? 0,
        isLiked: userId
            ? (article.likedBy ?? []).some((id) => String(id) === userId)
            : false,
        isFavorited: userId
            ? (article.favoritedBy ?? []).some((id) => String(id) === userId)
            : false,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
    };
}

async function ensureUniqueSlug(baseSlug: string, excludeArticleId?: string) {
    let slug = baseSlug;
    let counter = 1;

    while(true) {
        const existingArticle = await Article.findOne({ slug });
        if(!existingArticle) {
            return slug;
        }

        if(excludeArticleId && String(existingArticle._id) === excludeArticleId) {
            return slug;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
    }
}

function createHourBucket(date: Date) {
    const bucket = new Date(date);
    bucket.setMinutes(0, 0, 0);
    return bucket;
}

async function trackArticleView(
    articleId: string,
    articleAuthorId: string,
    viewerFingerprint: string,
    viewerUserId?: string
) {
    const now = new Date();
    const hourBucket = createHourBucket(now);

    const result = await ArticleView.updateOne(
        {
            article: articleId,
            viewerFingerprint,
            hourBucket,
        },
        {
            $setOnInsert: {
                article: articleId,
                articleAuthor: articleAuthorId,
                viewerUser: viewerUserId,
                viewerFingerprint,
                hourBucket,
                viewedAt: now,
            },
        },
        { upsert: true }
    );

    if (result.upsertedCount > 0) {
        await Article.updateOne({ _id: articleId }, { $inc: { viewsCount: 1 } });
        return true;
    }

    return false;
}

type CreateArticleInput = {
    title: string;
    summary: string;
    content: string;
    coverImage?: string;
    tags: string[];
};

export async function createArticle(userId: string, payload: CreateArticleInput) {
    const baseSlug = generateSlug(payload.title);
    const slug = await ensureUniqueSlug(baseSlug);

    const userTags = payload.tags ?? [];
    let tags = userTags;
    try {
        tags = await mergeCommunityTagsFromEmbedding({
            title: payload.title,
            summary: payload.summary,
            content: payload.content,
            existingTags: userTags,
        });
    } catch (err) {
        console.warn("[article.service] community tags merge on create skipped:", err);
        tags = userTags;
    }

    const article = await Article.create({
        title: payload.title,
        slug,
        summary: payload.summary,
        content: payload.content,
        coverImage: payload.coverImage ?? "",
        tags,
        author: userId,
    });

    const populatedArticle = await Article.findById(article._id).populate(
        "author",
        "username email bio avatar"
    );

    if (!populatedArticle) {
        throw new AppError("Article not found after creation", 500);
    }

    return {
        article: sanitizeArticle(populatedArticle as unknown as ArticleDocumentLike, userId),
    };
}

type GetArticlesInput = {
    page?: number;
    limit?: number;
    tag?: string;
    userId?: string;
};

export async function getArticles(query: GetArticlesInput) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (query.tag) {
        filter.tags = query.tag;
    }

    const [articles, total] = await Promise.all([
        Article.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("author", "username email bio avatar"),
        Article.countDocuments(filter),
    ]);

    return {
        articles: articles.map((article) =>
            sanitizeArticle(article as unknown as ArticleDocumentLike, query.userId)
        ),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getArticleBySlug(
    slug: string,
    userId?: string,
    viewerFingerprint?: string
) {
    const article = await Article.findOne({ slug }).populate(
        "author",
        "username email bio avatar"
    );

    if (!article) {
        throw new AppError("Article not found", 404);
    }

    if (viewerFingerprint) {
        const didCount = await trackArticleView(
            String(article._id),
            String((article.author as unknown as ArticleAuthor)._id),
            viewerFingerprint,
            userId
        );

        if (didCount) {
            article.viewsCount = (article.viewsCount ?? 0) + 1;
        }
    }

    return {
        article: sanitizeArticle(article as unknown as ArticleDocumentLike, userId),
    };
}

type UpdateArticleInput = {
    title?: string;
    summary?: string;
    content?: string;
    coverImage?: string;
    tags?: string[];
};

export async function updateArticle(
    userId: string,
    slug: string,
    payload: UpdateArticleInput
) {
    const article = await Article.findOne({ slug });

    if (!article) {
        throw new AppError("Article not found", 404);
    }

    if (String(article.author) !== userId) {
        throw new AppError("Forbidden: You can only edit your own article", 403);
    }

    const nextTitle = payload.title ?? article.title;
    const nextSummary = payload.summary ?? article.summary;
    const nextContent = payload.content ?? article.content;
    const baseTags =
        payload.tags !== undefined ? payload.tags : [...article.tags];

    const shouldReclassify =
        payload.title !== undefined ||
        payload.summary !== undefined ||
        payload.content !== undefined;

    let finalTags = baseTags;
    if (shouldReclassify) {
        try {
            finalTags = await mergeCommunityTagsFromEmbedding({
                title: nextTitle,
                summary: nextSummary,
                content: nextContent,
                existingTags: baseTags,
            });
        } catch (err) {
            console.warn("[article.service] community tags merge on update skipped:", err);
            finalTags = baseTags;
        }
    }

    if (payload.title && payload.title !== article.title) {
        const baseSlug = generateSlug(payload.title);
        const nextSlug = await ensureUniqueSlug(baseSlug, String(article._id));
        article.title = payload.title;
        article.slug = nextSlug;
    }

    if (payload.summary !== undefined) {
        article.summary = payload.summary;
    }

    if (payload.content !== undefined) {
        article.content = payload.content;
    }

    if (payload.coverImage !== undefined) {
        article.coverImage = payload.coverImage;
    }

    article.tags = finalTags;

    await article.save();

    const updatedArticle = await Article.findById(article._id).populate(
        "author",
        "username email bio avatar"
    );

    if (!updatedArticle) {
        throw new AppError("Article not found after update", 500);
    }

    return {
        article: sanitizeArticle(updatedArticle as unknown as ArticleDocumentLike, userId),
    };
}

export async function deleteArticle(userId: string, slug: string) {
    const article = await Article.findOne({ slug });

    if (!article) {
        throw new AppError("Article not found", 404);
    }

    if (String(article.author) !== userId) {
        throw new AppError("Forbidden: You can only delete your own article", 403);
    }

    await Article.deleteOne({ _id: article._id });

    return {
        deleted: true,
    };
}