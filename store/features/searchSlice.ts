<<<<<<< HEAD:store/redux/features/searchSlice.ts
// store/redux/features/optimizedSearchSlice.ts
=======
// store/features/searchSlice.ts
>>>>>>> test-map:store/features/searchSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Center } from "@/types/entities";
import type { MapView } from "@/types/map";

// Define the search state type
interface SearchState {
  // Data
  centers: Center[];
<<<<<<< HEAD:store/redux/features/searchSlice.ts
  filteredCenters: Center[];
=======
>>>>>>> test-map:store/features/searchSlice.ts

  // UI State
  activePin: string | null;
  hoveredItem: string | null;
  isLoading: boolean;
  error: string | null;

  // Location
  userLocation: { latitude: number; longitude: number } | null;

<<<<<<< HEAD:store/redux/features/searchSlice.ts
  // Map
=======
  // Map View
>>>>>>> test-map:store/features/searchSlice.ts
  mapView: MapView | null;

  // Search
  searchTerm: string;
<<<<<<< HEAD:store/redux/features/searchSlice.ts
  recentSearches: string[];
=======
>>>>>>> test-map:store/features/searchSlice.ts
}

// Initial state
const initialState: SearchState = {
  // Data
  centers: [],
<<<<<<< HEAD:store/redux/features/searchSlice.ts
  filteredCenters: [],
=======
>>>>>>> test-map:store/features/searchSlice.ts

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
<<<<<<< HEAD:store/redux/features/searchSlice.ts
  recentSearches: [],
};

// Create the search slice
export const SearchSlice = createSlice({
=======
};

// Create the search slice
export const searchSlice = createSlice({
>>>>>>> test-map:store/features/searchSlice.ts
  name: "search",
  initialState,
  reducers: {
    // Data actions
    setCenters: (state, action: PayloadAction<Center[]>) => {
      state.centers = action.payload;
<<<<<<< HEAD:store/redux/features/searchSlice.ts
      state.filteredCenters = action.payload;
    },

    // Filtering
    setFilteredCenters: (state, action: PayloadAction<Center[]>) => {
      state.filteredCenters = action.payload;
=======
>>>>>>> test-map:store/features/searchSlice.ts
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

      // Add to recent searches if not empty and not already at the top
      if (action.payload && state.recentSearches[0] !== action.payload) {
        // Remove duplicate if exists
        state.recentSearches = state.recentSearches.filter(
          (term) => term !== action.payload
        );

        // Add to front of array
        state.recentSearches.unshift(action.payload);

        // Limit to 5 recent searches
        if (state.recentSearches.length > 5) {
          state.recentSearches.pop();
        }
      }
    },

    // Reset actions
    resetActiveStates: (state) => {
      state.activePin = null;
      state.hoveredItem = null;
    },

    // Complete reset
    resetSearch: (state) => {
      state.centers = [];
<<<<<<< HEAD:store/redux/features/searchSlice.ts
      state.filteredCenters = [];
=======
>>>>>>> test-map:store/features/searchSlice.ts
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
<<<<<<< HEAD:store/redux/features/searchSlice.ts
  setHoveredCenter,
=======
  setHoveredItem,
>>>>>>> test-map:store/features/searchSlice.ts
  setLoading,
  setError,
  setUserLocation,
  setMapView,
  setSearchTerm,
  resetActiveStates,
  resetSearch,
<<<<<<< HEAD:store/redux/features/searchSlice.ts
} = SearchSlice.actions;
=======
} = searchSlice.actions;
>>>>>>> test-map:store/features/searchSlice.ts

// Export reducer
export default SearchSlice.reducer;
