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
      state.centers = action.payload;
    },

    // UI State actions
    setActivePin: (state, action: PayloadAction<string | null>) => {
      state.activePin = action.payload;
    },
    setHoveredItem: (state, action: PayloadAction<string | null>) => {
      state.hoveredItem = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Location actions
    setUserLocation: (
      state,
      action: PayloadAction<{ latitude: number; longitude: number } | null>
    ) => {
      state.userLocation = action.payload;
    },

    // Map actions
    setMapView: (state, action: PayloadAction<MapView>) => {
      state.mapView = action.payload;
    },

    // Search actions
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },

    // Reset actions
    resetActiveStates: (state) => {
      state.activePin = null;
      state.hoveredItem = null;
    },

    // Complete reset
    resetSearch: (state) => {
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
} = searchSlice.actions;

export default searchSlice.reducer;
