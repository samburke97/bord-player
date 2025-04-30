import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useLocation } from "@/store/use-location";
import styles from "../SearchMap.module.css";

interface UserLocationMarkerProps {
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ mapRef }) => {
  // Use your original LocationProvider - only has location when browser permission is granted
  const { location } = useLocation();
  const markerElementRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Create and update user location marker
  useEffect(() => {
    // Only show marker if we have location from explicit browser permission
    if (!mapRef.current || !location) {
      // Remove marker if it exists but shouldn't be shown
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    // If we already have a marker, just update its position
    if (markerRef.current) {
      markerRef.current.setLngLat([location.longitude, location.latitude]);
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
      .setLngLat([location.longitude, location.latitude])
      .addTo(mapRef.current);

    markerRef.current = marker;

    // Cleanup function
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [mapRef, location]);

  // Update marker position when map moves
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !location) return;

    const handleMove = () => {
      if (markerRef.current && location) {
        markerRef.current.setLngLat([location.longitude, location.latitude]);
      }
    };

    mapRef.current.on("move", handleMove);

    return () => {
      if (mapRef.current) {
        mapRef.current.off("move", handleMove);
      }
    };
  }, [mapRef, location]);

  return null;
};

export default UserLocationMarker;
