// store/features/searchSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Center } from "@/types/entities";
import type { MapView } from "@/types/map";

// Define the search state type
interface SearchState {
  // Data
  centers: Center[];

  // UI State
  activePin: string | null;
  hoveredItem: string | null;
  isLoading: boolean;
  error: string | null;

  // Location
  userLocation: { latitude: number; longitude: number } | null;

  // Map View
  mapView: MapView | null;

  // Search
  searchTerm: string;
}

// Initial state
const initialState: SearchState = {
  // Data
  centers: [],

  // UI State
  activePin: null,
  hoveredItem: null,
  isLoading: false,
  error: null,

  // Location
  userLocation: null,

  // Map
  mapView: null,

  // Search
  searchTerm: "",
};

// Create the search slice
export const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    // Data actions
    setCenters: (state, action: PayloadAction<Center[]>) => {
      if (!state) return initialState; // Safety check
      state.centers = action.payload;
    },

    // UI State actions
    setActivePin: (state, action: PayloadAction<string | null>) => {
      if (!state) return initialState; // Safety check
      state.activePin = action.payload;
    },
    setHoveredItem: (state, action: PayloadAction<string | null>) => {
      if (!state) return initialState; // Safety check
      state.hoveredItem = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      if (!state) return initialState; // Safety check
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      if (!state) return initialState; // Safety check
      state.error = action.payload;
    },

    // Location actions
    setUserLocation: (
      state,
      action: PayloadAction<{ latitude: number; longitude: number } | null>
    ) => {
      if (!state) return initialState; // Safety check
      state.userLocation = action.payload;
    },

    // Map actions
    setMapView: (state, action: PayloadAction<MapView>) => {
      if (!state) return initialState; // Safety check
      state.mapView = action.payload;
    },

    // Search actions
    setSearchTerm: (state, action: PayloadAction<string>) => {
      if (!state) return initialState; // Safety check
      state.searchTerm = action.payload;
    },

    // Reset actions
    resetActiveStates: (state) => {
      if (!state) return initialState; // Safety check
      state.activePin = null;
      state.hoveredItem = null;
    },

    // New action for cleanup when entering/leaving search page
    cleanupSearchState: (state) => {
      if (!state) return initialState; // Safety check
      // Reset search results
      state.centers = [];
      // Reset UI states
      state.activePin = null;
      state.hoveredItem = null;
      state.error = null;
      // Don't reset mapView or userLocation - these are helpful to keep
      // Reset loading state to false
      state.isLoading = false;
      // Optional: reset search term if you want a fresh start each time
      // state.searchTerm = "";
    },

    // Complete reset
    resetSearch: (state) => {
      if (!state) return initialState; // Safety check
      state.centers = [];
      state.activePin = null;
      state.hoveredItem = null;
      state.error = null;
      state.searchTerm = "";
      // Preserve userLocation and mapView
    },
  },
});

// Export actions
export const {
  setCenters,
  setActivePin,
  setHoveredItem,
  setLoading,
  setError,
  setUserLocation,
  setMapView,
  setSearchTerm,
  resetActiveStates,
  resetSearch,
  cleanupSearchState,
} = searchSlice.actions;

// Export reducer
export default searchSlice.reducer;
