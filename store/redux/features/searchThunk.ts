// store/redux/features/searchThunk.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { setLoading, setCenters, setError } from "./searchSlice";
import { searchCenters } from "@/app/actions/search"; // Import the server action directly
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

    // Directly call the server action instead of using fetch
    const centers = await searchCenters({
      searchTerm,
      bounds,
      // You can add more parameters like sportIds, facilityIds if needed
    });

    dispatch(setCenters(centers));
    return centers;
  } catch (err) {
    dispatch(setError(err instanceof Error ? err.message : "Search failed"));
    return [];
  } finally {
    dispatch(setLoading(false));
  }
});
