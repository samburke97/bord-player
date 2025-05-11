import type { Center } from "./entities";

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
  distance: number; // in kilometers
}

export interface SearchMapProps {
  centers: Center[];
  userLocation: { latitude: number; longitude: number } | null;
  onBoundsChange?: (
    bounds: MapBounds & { center: MapView["center"]; distance: number }
  ) => void;
  initialCenter?: [number, number];
  initialDistance?: number;
  activePin?: string | null;
  onMarkerClick?: (id: string) => void;
  onMapClick?: () => void;
}

export interface MapMarkerProps {
  center: Center;
  isActive: boolean;
  isHovered: boolean;
  onClick: (id: string) => void;
  onHover: (id: string | null) => void;
}
