import type { MapBounds, MapView } from "./index";
import type { Center } from "./entities";
import type { SearchFilters } from "./search";

export interface SearchResponse {
  centers: Center[];
  nextCursor?: string;
  total?: number;
}

export interface SearchBoundsParams {
  bounds: MapBounds;
  searchTerm: string;
  filters?: SearchFilters;
}

export interface MapViewSearchParams {
  mapView: MapView;
  searchTerm?: string;
  sportIds?: string[];
  facilityIds?: string[];
}

export interface SearchParams {
  q?: string;
  center?: string;
  distance?: string;
  sports?: string;
  facilities?: string;
}
