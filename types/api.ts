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
  q?: string; // Search query term (e.g., "football", "gym")
  center?: string; // Coordinates for map center in "lat,lng" format (e.g., "51.5074,-0.1278")
  distance?: string; // Distance for search (e.g., "5", "25")
  sports?: string; // Comma-separated list of sport IDs (e.g., "1,2,3")
  facilities?: string; // Comma-separated list of facility IDs (e.g., "4,5")
}
