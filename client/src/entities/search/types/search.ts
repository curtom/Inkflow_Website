import type { Article } from "../../article/types/article";


export type SearchUser = {
    id: string;
    username: string;
    email: string;
    bio?: string;
    avatar?: string;
}

export type SearchTag = {
    name: string;
    articleCount: number;
};

export type SearchResponse = {
    message: string;
    data: {
        stories: Article[];
        users: SearchUser[];
        tags: SearchTag[];
    }
}