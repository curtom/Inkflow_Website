import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type{ User } from "@/entities/user/types/user"

type AuthState = {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
};

const initialToken = localStorage.getItem("token");

const initialState: AuthState = {
    token: initialToken,
    user: null,
    isAuthenticated: Boolean(initialToken),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials(state, action: PayloadAction<{token: string, user: User}>) {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.isAuthenticated = true;
        },
        setCurrentUser(state,action: PayloadAction<User>) {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        clearCredentials(state) {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setCredentials, setCurrentUser, clearCredentials } = authSlice.actions;
export default authSlice.reducer;