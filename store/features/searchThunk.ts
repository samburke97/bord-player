// store/redux/features/searchThunk.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { setLoading, setCenters, setError } from "./searchSlice";
import { searchCenters } from "@/app/actions/search"; // Import the server action directly
import type { RootState } from "@/store/store";
import type { Center } from "@/types/entities";

// Simple adapter to convert server response to Center type
function adaptToCenterType(serverCenter: any): Center {
  return {
    id: serverCenter.id,
    name: serverCenter.name,
    address: serverCenter.address || null,
    description: null, // Add missing properties with defaults
    latitude: serverCenter.latitude,
    longitude: serverCenter.longitude,
    logoUrl: serverCenter.logoUrl || null,
    phone: null,
    email: null,
    isActive: true,
    isOpenNow: false,
    type: null,
    distance: 0,
    images: serverCenter.images || [],
    facilities: [],
    tags: [],
    sports: serverCenter.sports || [],
    openingHours: [],
    socials: [],
    links: [],
    activities: [],
    establishment: [],
  };
}

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

    // Directly call the server action with searchTerm
    const serverCenters = await searchCenters({
      searchTerm: searchTerm || "", // Ensure we pass searchTerm, even if empty
      bounds,
    });

    console.log(`✅ Search returned ${serverCenters.length} centers`);

    if (serverCenters.length > 0) {
      console.log("📍 First center:", serverCenters[0]);
    } else {
      console.log("⚠️ No centers found matching criteria");
    }

    // Convert server response to expected Center type
    const centers: Center[] = serverCenters.map(adaptToCenterType);

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
