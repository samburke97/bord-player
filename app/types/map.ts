import type { MapBounds, Location } from "./base";
import type { Center } from "./entities";

export interface SearchMapProps {
  centers: Center[];
  userLocation: Location;
  onBoundsChange?: (bounds: MapBounds) => void;
}
