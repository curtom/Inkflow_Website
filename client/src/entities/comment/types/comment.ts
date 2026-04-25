export type CommentAuthor = {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
};

export type CommentSort = "likes" | "newest";

export type CommentNode = {
  id: string;
  content: string;
  author: CommentAuthor;
  parentCommentId: string | null;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  replies: CommentNode[];
  /** Total nested comments under this node (all depths) */
  replyCount: number;
};

export type CommentListResponse = {
  message: string;
  data: {
    comments: CommentNode[];
    total: number;
    /** Top-level comment id selected by the post author, if any. */
    pinnedCommentId?: string | null;
  };
};

export type CommentCreateResponse = {
  message: string;
  data: {
    comment: {
      id: string;
      content: string;
      author: CommentAuthor;
      parentCommentId: string | null;
      likesCount: number;
      isLiked: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
};
