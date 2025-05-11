// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import searchReducer from "./features/searchSlice";

export const store = configureStore({
  reducer: {
    search: searchReducer,
  },
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== "production",
});

// Define types for state and dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export hooks for typed dispatch and selector
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
