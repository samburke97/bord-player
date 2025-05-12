// components/search/map/UserLocation.tsx
import React, { useEffect, useRef, memo } from "react";
import mapboxgl from "mapbox-gl";
import styles from "../SearchMap.module.css";

interface UserLocationMarkerProps {
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  userLocation: {
    latitude: number;
    longitude: number;
    isPrecise?: boolean;
  } | null;
}

const UserLocationMarker = memo(
  ({ mapRef, userLocation }: UserLocationMarkerProps) => {
    const markerRef = useRef<mapboxgl.Marker | null>(null);

    // Set up or remove marker when location changes
    useEffect(() => {
      // Remove any existing marker
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }

      // Skip if no map or location, or if location is not precise
      if (!mapRef.current || !userLocation || userLocation.isPrecise !== true) {
        return;
      }

      // Create the user location marker element
      const el = document.createElement("div");
      el.className = styles.userLocationMarker;

      // Add pulse effect for better visibility
      const pulse = document.createElement("div");
      pulse.className = styles.userLocationPulse;
      el.appendChild(pulse);

      // Create the marker
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: "center",
        pitchAlignment: "map",
        rotationAlignment: "map",
      })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .addTo(mapRef.current);

      // Store marker reference for cleanup
      markerRef.current = marker;

      // Clean up on unmount
      return () => {
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
      };
    }, [mapRef, userLocation]);

    return null;
  }
);

UserLocationMarker.displayName = "UserLocationMarker";

export default UserLocationMarker;
