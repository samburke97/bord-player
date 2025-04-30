import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Center } from "@/types/entities";
import type { MapView } from "@/types/index";

interface SearchState {
  isLoading: boolean;
  centers: Center[];
  filteredCenters: Center[]; // Centers that are within the current map view
  activePin: string | null;
  hoveredItem: string | null;
  userLocation: { latitude: number; longitude: number } | null;
  mapView: MapView | null;
}

const initialState: SearchState = {
  isLoading: false,
  centers: [],
  filteredCenters: [],
  activePin: null,
  hoveredItem: null,
  userLocation: null,
  mapView: null,
};

export const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCenters: (state, action: PayloadAction<Center[]>) => {
      state.centers = action.payload;
      // By default, filtered centers are the same as all centers
      // This will be updated by setFilteredCenters when map bounds change
      state.filteredCenters = action.payload;
    },
    setFilteredCenters: (state, action: PayloadAction<Center[]>) => {
      state.filteredCenters = action.payload;
    },
    setActivePin: (state, action: PayloadAction<string | null>) => {
      state.activePin = action.payload;
    },
    setHoveredCenter: (state, action: PayloadAction<string | null>) => {
      state.hoveredItem = action.payload;
    },
    setUserLocation: (
      state,
      action: PayloadAction<{ latitude: number; longitude: number } | null>
    ) => {
      state.userLocation = action.payload;
    },
    setMapView: (state, action: PayloadAction<MapView>) => {
      state.mapView = action.payload;
    },
    resetActiveStates: (state) => {
      state.activePin = null;
      state.hoveredItem = null;
    },
  },
});

export const {
  setLoading,
  setCenters,
  setFilteredCenters,
  setActivePin,
  setHoveredCenter,
  setUserLocation,
  setMapView,
  resetActiveStates,
} = searchSlice.actions;

export default searchSlice.reducer;
