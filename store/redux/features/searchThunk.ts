// redux/features/searchThunk.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { setLoading, setCenters, setError } from "./searchSlice";
import type { RootState } from "@/store/store";
import type { Center } from "@/types/entities";

// Update the thunk to accept parameters
export const executeSearch = createAsyncThunk<
  Center[], // Return type
  { forceUpdate?: boolean } | undefined, // Accept the parameter that's being passed
  { state: RootState } // Access to Redux state
>("search/executeSearch", async (params, { getState, dispatch }) => {
  dispatch(setLoading(true));

  try {
    const state = getState();
    const { mapView } = state.search;

    if (!mapView) {
      console.error("No map view available for search");
      dispatch(setError("No map view available"));
      return [];
    }

    console.log("Executing search with mapView:", mapView);

    // Construct query parameters based on the structure of your mapView
    const query = new URLSearchParams();

    // Include center coordinates
    if (mapView.center) {
      query.set("lat", mapView.center.latitude.toString());
      query.set("lng", mapView.center.longitude.toString());
    }

    // Include distance/radius
    if (mapView.distance) {
      query.set("distance", mapView.distance.toString());
    }

    // Include bounds if available
    if (mapView.north !== undefined) {
      query.set("north", mapView.north.toString());
      query.set("south", mapView.south.toString());
      query.set("east", mapView.east.toString());
      query.set("west", mapView.west.toString());
    }

    // Include forceUpdate parameter if provided
    if (params?.forceUpdate) {
      query.set("force", "true");
    }

    // Log the API request for debugging
    console.log(`Making API request to: /api/search?${query.toString()}`);

    const res = await fetch(`/actions/search?${query.toString()}`);

    if (!res.ok) {
      throw new Error(`Search API returned ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    console.log("Search API response:", data);

    dispatch(setCenters(data)); // Set the centers in the Redux store
    return data;
  } catch (err) {
    console.error("Search failed", err);
    dispatch(setError(err instanceof Error ? err.message : "Search failed"));
    return [];
  } finally {
    dispatch(setLoading(false));
  }
});
