import {useSearchParams} from "react-router";
import {queryKeys} from "@/shared/api/query-keys.ts";
import {useQuery} from "@tanstack/react-query";
import {getArticlesRequest} from "@/entities/article/api/article-api.ts";
import ArticleList from "@/widgets/article-list";
import Button from "@/shared/ui/button.tsx";


export default function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Number(searchParams.get("page") || "1");
    const limit = 10;

    const { data, isLoading, isError } = useQuery({
        queryKey: queryKeys.articles.list(page, limit),
        queryFn: () => getArticlesRequest(page, limit),
    });

    const articles = data?.articles ?? [];
    const pagination = data?.pagination;

    return (
        <div className="mx-auto max-w-5xl px-4 py-10">
            <div className="sticky top-16 z-10 -mx-4 mb-8 bg-gray-50 px-4 pb-4 pt-2">
                <h1 className="text-4xl font-bold text-gray-900">Lastest Articles</h1>
                <p className="mt-2 text-gray-600">
                    Explore ideas, stories, and Knowledge from creators.
                </p>
            </div>

            {isLoading ? <p>Loading articles...</p> : null}
            {isError ? <p>Failed to load articles</p> : null}
            {!isLoading && !isError ? <ArticleList articles={articles} /> : null}

            {pagination ? (
                <div className="mt-8 flex items-center justify-between">
                    <Button
                      type="button"
                      disabled={pagination.page <= 1}
                      onClick={() => setSearchParams({ page: String(pagination.page - 1)})}
                    >
                       Previous
                    </Button>

                    <span className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.totalPages || 1}
                    </span>

                    <Button
                       type="button"
                       disabled={pagination.page >= pagination.totalPages}
                       onClick={() => setSearchParams({page: String(pagination.page + 1)})}
                    >
                        Next
                    </Button>
                </div>
            ): null}
        </div>
    );
}