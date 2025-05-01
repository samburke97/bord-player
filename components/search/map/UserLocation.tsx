import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useAppSelector } from "@/store/hooks";

interface UserLocationMarkerProps {
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ mapRef }) => {
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

    // Create or update the static green dot marker
    if (!markerRef.current) {
      const el = document.createElement("div");
      el.style.width = "18px";
      el.style.height = "18px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#39b252";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 0 0 1px rgba(0,0,0,0.2)";
      el.style.cursor = "default";
      el.style.zIndex = "100";

      markerRef.current = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([location.longitude, location.latitude])
        .addTo(mapRef.current);
    } else {
      markerRef.current.setLngLat([location.longitude, location.latitude]);
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [mapRef, location]);

  return null;
};

export default UserLocationMarker;
