import { useEffect } from "react";
import { useAppDispatch, useAppSelector} from "@/shared/hooks/redux";
import { clearCredentials, setCurrentUser } from "@/features/auth/model/auth-slice";
import { getCurrentUserRequest } from "@/features/auth/api/auth-api.ts";

export function AuthBootstrap() {
    const dispatch = useAppDispatch();
    const token = useAppSelector(state => state.auth.token);

    useEffect(() => {
        async function bootstrap() {
            if (!token) return;

            try{
                const response = await getCurrentUserRequest();
                dispatch(setCurrentUser(response.user));
            }catch(error) {
                console.error("Failed to restore auth:", error);
                localStorage.removeItem("token");
                dispatch(clearCredentials());
            }
        }

        bootstrap();
    }, [dispatch, token]);
    return null;
}