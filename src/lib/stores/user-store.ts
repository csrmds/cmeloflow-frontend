"use client";

import { create } from "zustand";
import {
	clearStoredToken,
	decodeJwt,
	getStoredToken,
	setStoredToken,
} from "@/lib/auth";
import type { JwtPayload, UserRole } from "@/lib/types";

interface UserState {
	token: string | null;
	payload: JwtPayload | null;
	hydrated: boolean;
	setToken: (token: string) => void;
	clear: () => void;
	hydrate: () => void;
	role: () => UserRole | null;
}

export const useUserStore = create<UserState>((set, get) => ({
	token: null,
	payload: null,
	hydrated: false,
	setToken: (token: string) => {
		setStoredToken(token);
		set({ token, payload: decodeJwt(token), hydrated: true });
	},
	clear: () => {
		clearStoredToken();
		set({ token: null, payload: null, hydrated: true });
	},
	hydrate: () => {
		const token = getStoredToken();
		set({
			token,
			payload: token ? decodeJwt(token) : null,
			hydrated: true,
		});
	},
	role: () => get().payload?.user_role ?? null,
}));
