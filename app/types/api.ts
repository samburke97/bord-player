import type { MapBounds } from "./base";
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

export interface SearchLocationParams {
  searchTerm: string;
  latitude: number;
  longitude: number;
  radius: number;
  filters?: SearchFilters;
}
