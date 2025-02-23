import type { MapBounds, Location } from "./base";
import type { Center } from "./entities";

export interface SearchFilters {
  sports?: string[];
  facilities?: string[];
  establishment?: string;
  tags?: string[];
}

export interface SearchState {
  centers: Center[];
  activePin: string | null;
  hoveredPin: string | null;
  hoveredItem: string | null;
  userLocation: Location | null;
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
  mapBounds: MapBounds | null;
  searchRadius: number;
  view: "list" | "map";
  filters: SearchFilters;
  recentSearches: string[];
}
