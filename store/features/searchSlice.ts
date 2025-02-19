import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  SearchState,
  MapBounds,
  UserLocation,
  SearchFilters,
} from "@/app/types/types";

const initialState: SearchState = {
  centers: [],
  activePin: null,
  hoveredPin: null,
  hoveredItem: null, // Add this line
  userLocation: null,
  searchTerm: "",
  isLoading: false,
  error: null,
  mapBounds: null,
  searchRadius: 25,
  view: "list",
  filters: {},
  recentSearches: [],
};

export const fetchCentersByBounds = createAsyncThunk(
  "search/fetchCentersByBounds",
  async ({ bounds, searchTerm }: { bounds: MapBounds; searchTerm: string }) => {
    try {
      console.log("Fetching centers with bounds:", bounds);

      const url =
        "/api/search/bounds?" + // Make sure this matches your API route
        new URLSearchParams({
          searchTerm: searchTerm,
          north: bounds.north.toString(),
          south: bounds.south.toString(),
          east: bounds.east.toString(),
          west: bounds.west.toString(),
        });

      console.log("Fetching URL:", url);

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", response.status, errorText);
        throw new Error(
          `Failed to fetch centers: ${response.status} ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Received centers:", data);
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  }
);
export const fetchCentersByLocation = createAsyncThunk(
  "search/fetchCentersByLocation",
  async ({
    searchTerm,
    latitude,
    longitude,
    radius,
  }: {
    searchTerm: string;
    latitude: number;
    longitude: number;
    radius: number;
  }) => {
    const response = await fetch(
      `/search/api?searchTerm=${encodeURIComponent(searchTerm)}
      &lat=${latitude}&lng=${longitude}&radius=${radius}`
    );
    if (!response.ok) throw new Error("Failed to fetch centers");
    return response.json();
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setActivePin: (state, action: PayloadAction<string | null>) => {
      state.activePin = action.payload;
    },
    setHoveredCenter: (state, action: PayloadAction<string | null>) => {
      state.hoveredPin = action.payload;
      state.hoveredItem = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setUserLocation: (state, action: PayloadAction<UserLocation>) => {
      state.userLocation = action.payload;
    },
    setSearchRadius: (state, action: PayloadAction<number>) => {
      state.searchRadius = action.payload;
    },
    setView: (state, action: PayloadAction<"list" | "map">) => {
      state.view = action.payload;
    },
    setMapBounds: (state, action: PayloadAction<MapBounds>) => {
      state.mapBounds = action.payload;
    },
    setFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.filters = action.payload;
    },
    addRecentSearch: (state, action: PayloadAction<string>) => {
      if (!state.recentSearches.includes(action.payload)) {
        state.recentSearches = [action.payload, ...state.recentSearches].slice(
          0,
          5
        );
      }
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCentersByBounds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCentersByBounds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.centers = action.payload;
      })
      .addCase(fetchCentersByBounds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch centers";
      })
      .addCase(fetchCentersByLocation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCentersByLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.centers = action.payload;
      })
      .addCase(fetchCentersByLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch centers";
      });
  },
});

export const {
  setActivePin,
  setHoveredCenter,
  setUserLocation,
  setLoading,
  setSearchRadius,
  setView,
  setMapBounds,
  setFilters,
  addRecentSearch,
  clearRecentSearches,
} = searchSlice.actions;

export default searchSlice.reducer;
