// src/app/hooks/useMap.ts
import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { useDispatch } from "react-redux";
import { setMapBounds, setActivePin } from "@/store/features/searchSlice";
import type { Location, MapBounds } from "@/app/types/base";
import styles from "@/app/ui/search/SearchMap.module.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface UseMapProps {
  container: HTMLDivElement | null;
  userLocation: Location;
  onBoundsChange?: (bounds: MapBounds) => void;
  onMapChange?: () => void;
}

export const useMap = ({
  container,
  userLocation,
  onBoundsChange,
  onMapChange,
}: UseMapProps) => {
  const dispatch = useDispatch();
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarkerElementRef = useRef<HTMLDivElement | null>(null);

  // Initialize map and user marker
  useEffect(() => {
    if (!container || !userLocation) return;

    const map = new mapboxgl.Map({
      container,
      style: "mapbox://styles/samisbord/cm3h9lzqc002h01sq4zx18vbq",
      attributionControl: false,
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 13,
      projection: "mercator",
    });

    mapRef.current = map;

    map.on("load", () => {
      // Remove existing user marker if it exists
      if (userMarkerElementRef.current) {
        userMarkerElementRef.current.remove();
      }

      // Create user location marker
      const userMarkerElement = document.createElement("div");
      userMarkerElement.className = styles.userLocationMarker;
      userMarkerElementRef.current = userMarkerElement;

      const userMarkerImage = document.createElement("img");
      userMarkerImage.src = "/images/map/user-location.svg";
      userMarkerImage.alt = "User Location";
      userMarkerImage.className = styles.userLocationImage;

      userMarkerElement.appendChild(userMarkerImage);

      // Position marker
      const position = map.project([
        userLocation.longitude,
        userLocation.latitude,
      ]);
      userMarkerElement.style.left = `${position.x}px`;
      userMarkerElement.style.top = `${position.y}px`;
      userMarkerElement.style.transform = `translate(-50%, -50%)`;

      container.appendChild(userMarkerElement);

      // Update user marker position on map move
      const updateUserMarkerPosition = () => {
        if (!userMarkerElement) return;
        const newPosition = map.project([
          userLocation.longitude,
          userLocation.latitude,
        ]);
        userMarkerElement.style.left = `${newPosition.x}px`;
        userMarkerElement.style.top = `${newPosition.y}px`;
      };

      map.on("move", () => {
        updateUserMarkerPosition();
        // Reset active pin and card on ANY map movement
        dispatch(setActivePin(null));
        if (onMapChange) onMapChange();
      });

      map.on("moveend", () => {
        if (!onBoundsChange) return;
        const currentBounds = map.getBounds();
        if (!currentBounds) return;

        const newBounds = {
          north: currentBounds.getNorth(),
          south: currentBounds.getSouth(),
          east: currentBounds.getEast(),
          west: currentBounds.getWest(),
        };

        dispatch(setMapBounds(newBounds));
        onBoundsChange(newBounds);
      });
    });

    return () => {
      if (userMarkerElementRef.current) {
        userMarkerElementRef.current.remove();
      }
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [container, userLocation]);

  return mapRef;
};
