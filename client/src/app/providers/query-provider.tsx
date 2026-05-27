import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, type ReactNode } from "react";

const ReactQueryDevtools =
    import.meta.env.DEV
        ? lazy(() =>
              import("@tanstack/react-query-devtools").then((module) => ({
                  default: module.ReactQueryDevtools,
              }))
          )
        : null;

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

type Props = {
    children: ReactNode;
};

export default function QueryProvider({ children }: Props) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {ReactQueryDevtools ? (
                <Suspense fallback={null}>
                    <ReactQueryDevtools initialIsOpen={false} />
                </Suspense>
            ) : null}
        </QueryClientProvider>
    );
}
