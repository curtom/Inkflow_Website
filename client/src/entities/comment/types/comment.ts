

export type CommentAuthor = {
    id: string;
    username: string;
    email: string;
    bio?: string;
    avatar?: string;
};

export type Comment = {
    id: string;
    content: string;
    author: CommentAuthor;
    createdAt: string;
    updatedAt: string;
};

export type CommentListResponse = {
    message: string;
    data: {
        comments: Comment[];
    };
};

export type CommentDetailResponse = {
    message: string;
    data: {
        comment: Comment;
    };
};