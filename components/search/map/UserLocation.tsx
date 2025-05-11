<<<<<<< HEAD
// components/search/map/UserLocation.tsx
import { useEffect, useRef, memo } from "react";
import mapboxgl from "mapbox-gl";
import { useAppSelector } from "@/store/hooks";
=======
// components/search/map/UserLocationMarker.tsx
import React, { useEffect, useRef, memo } from "react";
import mapboxgl from "mapbox-gl";
>>>>>>> test-map
import styles from "../SearchMap.module.css";

interface UserLocationMarkerProps {
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  userLocation: { latitude: number; longitude: number } | null;
}

<<<<<<< HEAD
const UserLocationMarker = memo(({ mapRef }: UserLocationMarkerProps) => {
  // Get user location from Redux
  const location = useAppSelector((state) => state.search.userLocation);

  const markerRef = useRef<mapboxgl.Marker | null>(null);
=======
const UserLocationMarker = memo(
  ({ mapRef, userLocation }: UserLocationMarkerProps) => {
    const markerRef = useRef<mapboxgl.Marker | null>(null);
>>>>>>> test-map

    // Set up marker once on initial render
    useEffect(() => {
      // Skip if no map or location
      if (!mapRef.current || !userLocation) return;

<<<<<<< HEAD
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
=======
      // Create the user location marker element
      const el = document.createElement("div");
      el.className = styles.userLocationMarker;

      // Create the ripple effect element
      const ripple = document.createElement("div");
      ripple.className = styles.userLocationRipple;
      el.appendChild(ripple);

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
    }, [mapRef, userLocation]); // Only run once for initial userLocation

    return null;
  }
);
>>>>>>> test-map

UserLocationMarker.displayName = "UserLocationMarker";

export default UserLocationMarker;
