import type{ ReactNode } from "react";
import QueryProvider from "./query-provider";
import StoreProvider from "./store-providers";
import {AuthBootstrap} from "@/features/auth/lib/auth-bootstrap";

type Props = {
    children: ReactNode;
};

export default function AppProviders({ children }: Props) {
    return (
        <StoreProvider>
            <QueryProvider>
               <AuthBootstrap />
                {children}
            </QueryProvider>
        </StoreProvider>
    )
}