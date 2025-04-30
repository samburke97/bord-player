import type { UserLocation } from "./base";
import type { MapBounds, MapView } from "./map";

export interface SearchFilters {
  sports?: string[];
  facilities?: string[];
  establishment?: string;
  tags?: string[];
}

export interface SearchFilters {
  sports?: string[];
  facilities?: string[];
  establishment?: string;
  tags?: string[];
}

export interface SearchState {
  centers: any[];
  activePin: string | null;
  hoveredPin: string | null;
  hoveredItem: string | null;
  userLocation: UserLocation | null;
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
  mapView: MapView | null;
  mapBounds: MapBounds | null;
  searchRadius: number;
  view: "list" | "map";
  filters: SearchFilters;
  recentSearches: string[];
}
