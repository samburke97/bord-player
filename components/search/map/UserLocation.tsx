import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useAppSelector } from "@/store/hooks";
import styles from "../SearchMap.module.css";

interface UserLocationMarkerProps {
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ mapRef }) => {
  // Get user location from Redux
  const location = useAppSelector((state) => state.search.userLocation);

  const markerElementRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || !location) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    if (markerRef.current) {
      markerRef.current.setLngLat([location.longitude, location.latitude]);
      return;
    }

    const el = document.createElement("div");
    el.className = styles.mapMarker;
    markerElementRef.current = el;

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
