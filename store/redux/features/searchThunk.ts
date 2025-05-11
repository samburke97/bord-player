// store/redux/features/searchThunk.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { setLoading, setCenters, setError } from "./searchSlice";
import { fetchCentersByBounds } from "@/lib/api"; // Keep using your existing API function
import type { RootState } from "@/store/store";
import type { Center } from "@/types/entities";

export const executeSearch = createAsyncThunk<
  Center[],
  { forceUpdate?: boolean } | undefined,
  { state: RootState }
>("search/executeSearch", async (params, { getState, dispatch }) => {
  dispatch(setLoading(true));

  try {
    const state = getState();
    const { mapView, searchTerm } = state.search;

    if (!mapView) {
      console.error("No map view available for search");
      dispatch(setError("No map view available"));
      return [];
    }

    console.log("🔍 Executing search with:", {
      mapView,
      searchTerm: searchTerm || "[NONE]",
      forceUpdate: params?.forceUpdate,
    });

    // Calculate bounds from mapView's center and distance if not explicitly provided
    const bounds = {
      north: mapView.north || mapView.center.latitude + mapView.distance / 111,
      south: mapView.south || mapView.center.latitude - mapView.distance / 111,
      east:
        mapView.east ||
        mapView.center.longitude +
          mapView.distance /
            (111 * Math.cos((mapView.center.latitude * Math.PI) / 180)),
      west:
        mapView.west ||
        mapView.center.longitude -
          mapView.distance /
            (111 * Math.cos((mapView.center.latitude * Math.PI) / 180)),
    };

    console.log("🗺️ Search bounds:", bounds);

    // Use your existing fetchCentersByBounds function
    const centers = await fetchCentersByBounds({
      bounds,
      searchTerm: searchTerm || "",
    });

    console.log(`✅ Search returned ${centers.length} centers`);

    if (centers.length > 0) {
      console.log("📍 First center:", centers[0]);
    } else {
      console.log("⚠️ No centers found matching criteria");
    }

    dispatch(setCenters(centers));
    return centers;
  } catch (err) {
    console.error("❌ Search failed:", err);
    dispatch(setError(err instanceof Error ? err.message : "Search failed"));
    return [];
  } finally {
    dispatch(setLoading(false));
  }
});
