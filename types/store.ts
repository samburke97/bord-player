import type { SearchState } from "./search";

export interface RootState {
  search: SearchState;
}

export type AppDispatch = {
  <T>(action: T): T;
  <R>(asyncAction: (dispatch: AppDispatch, getState: () => RootState) => R): R;
};
