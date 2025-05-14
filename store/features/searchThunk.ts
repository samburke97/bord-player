// store/features/searchThunk.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { setLoading, setCenters, setError } from "./searchSlice";
import { fetchCentersByBounds } from "@/lib/api";
import type { RootState } from "@/store/store";

export const executeSearch = createAsyncThunk(
  "search/executeSearch",
  async (
    params: { forceUpdate?: boolean } | undefined,
    { getState, dispatch }
  ) => {
    const state = getState() as RootState;
    dispatch(setLoading(true));

    try {
      const { mapView, searchTerm } = state.search;

      // Safety check for mapView
      if (!mapView) {
        console.error("No map view available for search");
        dispatch(setError("No map view available"));
        return [];
      }

      console.log("⭐ Executing search with parameters:", {
        searchTerm,
        mapView: {
          center: mapView.center,
          distance: mapView.distance,
        },
      });

      // Calculate bounds from mapView
      const bounds = {
        north: mapView.center.latitude + mapView.distance / 111,
        south: mapView.center.latitude - mapView.distance / 111,
        east:
          mapView.center.longitude +
          mapView.distance /
            (111 * Math.cos((mapView.center.latitude * Math.PI) / 180)),
        west:
          mapView.center.longitude -
          mapView.distance /
            (111 * Math.cos((mapView.center.latitude * Math.PI) / 180)),
      };

      console.log("🌎 Search bounds:", bounds);

      // Execute the search using server action via fetchCentersByBounds
      const results = await fetchCentersByBounds({
        bounds,
        searchTerm: searchTerm || "",
      });

      console.log(
        `✅ Search returned ${results.length} centers:`,
        results.length > 0 ? results[0] : "No results"
      );

      dispatch(setCenters(results));
      return results;
    } catch (err) {
      const error = err as Error;
      console.error("❌ Search failed:", error);
      dispatch(setError(error?.message || "Search failed"));
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  }
);
