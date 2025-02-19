// definitions.ts
export type LinkOptions =
  | "Book Now"
  | "Website"
  | "Directions"
  | "More Info"
  | "Coaching"
  | "Learn More"
  | "First Visit";

export type SocialOptions =
  | "Facebook"
  | "Instagram"
  | "Twitter"
  | "LinkedIn"
  | "Youtube";

export type Tags = {
  id: string;
  name: string;
  icon?: string;
  last_edited?: Date;
};

export type Center = {
  id: string;
  name: string;
  description: string;
  images: string[];
  last_edited?: Date | null;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  links?: Array<{ id: string; type: LinkOptions; url: string }>;
  socials?: Array<{ id: string; platform: SocialOptions; url: string }>;
  establishment?: Array<{ id: string; name: string }>;
  sports: Array<{ id: string; name: string }>;
  facilities: Array<{ id: string; name: string }>;
  is_active: boolean | null;
  tags: Tags[];
};

export type Sport = {
  id: string;
  name: string;
  icon?: string;
  image_url?: string;
  last_edited?: Date | null;
};

export type Group = {
  id: string;
  name: string;
  last_edited: Date;
  tag_count: number;
  sports: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; name: string }>;
};

// Search-specific types
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

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
  hoveredItem: string | null; // Add this line
  userLocation: UserLocation | null;
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
  mapBounds: MapBounds | null;
  searchRadius: number;
  view: "list" | "map";
  filters: SearchFilters;
  recentSearches: string[];
}
// API Response types
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

// Redux specific types
export interface RootState {
  search: SearchState;
}

export type AppDispatch = {
  <T>(action: T): T;
  <R>(asyncAction: (dispatch: AppDispatch, getState: () => RootState) => R): R;
};
