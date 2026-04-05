import { Provider } from "react-redux";
import type{ ReactNode } from "react";
import { store } from "@/app/store";

type Props = {
    children: ReactNode;
};

export default function StoreProvider({ children }: Props) {
    return <Provider store={store}>{children}</Provider>
}