// components/search/map/UserLocation.tsx
import { useEffect, useRef, memo } from "react";
import mapboxgl from "mapbox-gl";
import { useAppSelector } from "@/store/hooks";
import styles from "../SearchMap.module.css";

interface UserLocationMarkerProps {
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
}

const UserLocationMarker = memo(({ mapRef }: UserLocationMarkerProps) => {
  // Get user location from Redux
  const location = useAppSelector((state) => state.search.userLocation);

  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || !location) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    // Update existing marker position
    if (markerRef.current) {
      markerRef.current.setLngLat([location.longitude, location.latitude]);
      return;
    }

    // Create new marker
    const el = document.createElement("div");
    el.className = styles.mapMarker;

    const marker = new mapboxgl.Marker({
      element: el,
      anchor: "center",
    })
      .setLngLat([location.longitude, location.latitude])
      .addTo(mapRef.current);

    markerRef.current = marker;

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [mapRef, location]);

  return null;
});

UserLocationMarker.displayName = "UserLocationMarker";

export default UserLocationMarker;
