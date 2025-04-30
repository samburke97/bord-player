import type { Center } from "./entities";

export interface SearchMapProps {
  centers: Center[];
  userLocation: Location;
  onBoundsChange?: (bounds: MapBounds) => void;
  initialBounds?: MapBounds | null;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapView {
  center: {
    latitude: number;
    longitude: number;
  };
  distance: number;
}
