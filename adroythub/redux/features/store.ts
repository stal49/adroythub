"use client";
import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import authSlice from "./auth/authSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authSlice,
  },
  devTools: process.env.NODE_ENV !== "production", // Enable devTools only in dev mode
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// ✅ Export RootState type for use in apiSlice.ts
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ✅ Ensure loadUser is only called in a browser environment
if (typeof window !== "undefined") {
  store.dispatch(apiSlice.endpoints.loadUser.initiate({}, { forceRefetch: true }));
}
