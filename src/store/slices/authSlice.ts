import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Users } from "../../types/auth.types";
import { authApi } from "../api/authApi";

export interface AuthState {
    isAuthenticated: boolean;
    user: Users | null;
    token: string | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<AuthState>) => {
            state.isAuthenticated = action.payload.isAuthenticated;
            state.user = action.payload.user;
            state.token = action.payload.token;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            localStorage.removeItem('token'); // Clear token from storage
        },
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(
                authApi.endpoints.login.matchFulfilled,
                (state, { payload }) => {
                    state.user = payload.user;
                    state.token = payload.token;
                    state.isAuthenticated = true;
                    localStorage.setItem('token', payload.token); // Store token
                }
            )
            .addMatcher(
                authApi.endpoints.register.matchFulfilled,
                (state, { payload }) => {
                    state.user = payload.user;
                    state.token = payload.token;
                    state.isAuthenticated = true;
                    localStorage.setItem('token', payload.token); // Store token
                }
            );
    },
});

export const { setUser, logout } = authSlice.actions;   
export default authSlice.reducer;