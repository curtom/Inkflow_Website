import { Suspense } from "react";
import { RouterProvider } from "react-router";
import { router }  from "@/app/router";

export default function AppRouterProvider() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-parchment px-4 text-sm text-olive">
                    Loading...
                </div>
            }
        >
            <RouterProvider router={router} />
        </Suspense>
    );
}
