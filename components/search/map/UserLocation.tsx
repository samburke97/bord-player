import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import styles from "../SearchMap.module.css";

interface UserLocationMarkerProps {
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  userLocation: { latitude: number; longitude: number } | null;
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({
  mapRef,
  userLocation,
}) => {
  const markerElementRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Create and update user location marker
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    // If we already have a marker, just update its position
    if (markerRef.current) {
      markerRef.current.setLngLat([
        userLocation.longitude,
        userLocation.latitude,
      ]);
      return;
    }

    // Create marker element
    const el = document.createElement("div");
    el.className = styles.userLocationMarker;
    markerElementRef.current = el;

    // Add user marker image
    const img = document.createElement("img");
    img.src = "/images/map/user-location.svg";
    img.alt = "Your Location";
    img.className = styles.userLocationImage;
    el.appendChild(img);

    // Create the marker
    const marker = new mapboxgl.Marker({
      element: el,
      anchor: "center",
    })
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .addTo(mapRef.current);

    markerRef.current = marker;

    // Cleanup function
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [mapRef, userLocation]);

  // Update marker position when map moves
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !userLocation) return;

    const handleMove = () => {
      if (markerRef.current && userLocation) {
        markerRef.current.setLngLat([
          userLocation.longitude,
          userLocation.latitude,
        ]);
      }
    };

    mapRef.current.on("move", handleMove);

    return () => {
      if (mapRef.current) {
        mapRef.current.off("move", handleMove);
      }
    };
  }, [mapRef, userLocation]);

  return null;
};

export default UserLocationMarker;
