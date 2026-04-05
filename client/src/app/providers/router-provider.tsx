import { RouterProvider } from "react-router";
import { router }  from "@/app/router";

export default function AppRouterProvider() {
    return <RouterProvider router={router} />;
}