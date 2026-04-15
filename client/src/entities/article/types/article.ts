export type ArticleAuthor = {
    id: string;
    username: string;
    email: string;
    bio?: string;
    avatar?: string;
};

export type Article = {
    id: string;
    title: string;
    slug: string;
    summary: string;
    content: string;
    coverImage?: string;
    tags: string[];
    author: ArticleAuthor;
    likesCount: number;
    favoritesCount: number;
    commentsCount: number;
    isLiked: boolean;
    isFavorited: boolean;
    createdAt: string;
    updatedAt: string;
};

export type ArticleListData = {
    articles: Article[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

export type ArticleDetailData = {
    article: Article;
};

export type ApiResponse<T> = {
    message: string;
    data: T;
};

export type CreateArticlePayload = {
    title: string;
    summary: string;
    content: string;
    coverImage?: string;
    tags?: string[];
};

export type UpdateArticlePayload = Partial<CreateArticlePayload>;