import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Center } from "@/types";
import type { RootState } from "@/store/store";
import { setActivePin } from "@/store/redux/features/searchSlice";
import mapboxgl from "mapbox-gl";
import { createRoot } from "react-dom/client";
import MapCard from "./MapCard";

interface MapMarkersProps {
  centers: Center[];
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
}

const MapMarkers: React.FC<MapMarkersProps> = ({ centers, mapRef }) => {
  const dispatch = useDispatch();
  const activePin = useSelector((state: RootState) => state.search.activePin);
  const hoveredItem = useSelector(
    (state: RootState) => state.search.hoveredItem
  );

  // References to track markers
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const activeCardMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Function to create marker element
  const createMarkerElement = useCallback(
    (center: Center, isActive: boolean, isHovered: boolean) => {
      // Create marker element
      const markerEl = document.createElement("div");
      markerEl.className = "map-marker";

      // Apply styles to ensure precise positioning
      Object.assign(markerEl.style, {
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        backgroundColor: isActive || isHovered ? "#39b252" : "#444",
        border: "2px solid white",
        boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.2)",
        cursor: "pointer",
      });

      return markerEl;
    },
    []
  );

  // Function to update markers
  const updateMarkers = useCallback(() => {
    if (!mapRef.current) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    centers.forEach((center) => {
      if (!center.latitude || !center.longitude) return;

      const isActive = center.id === activePin;
      const isHovered = center.id === hoveredItem;

      // Create marker element
      const el = createMarkerElement(center, isActive, isHovered);

      // Add click handler
      el.addEventListener("click", () => {
        dispatch(setActivePin(center.id));
      });

      // Create and add new marker
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: "center",
        pitchAlignment: "map",
        rotationAlignment: "map",
      })
        .setLngLat([Number(center.longitude), Number(center.latitude)])
        .addTo(mapRef.current);

      // Store marker reference
      markersRef.current.push(marker);
    });
  }, [centers, mapRef, activePin, hoveredItem, createMarkerElement, dispatch]);

  // Create card for active center
  const createCard = useCallback(
    (center: Center) => {
      if (!mapRef.current) return;

      // Remove existing card marker
      if (activeCardMarkerRef.current) {
        activeCardMarkerRef.current.remove();
        activeCardMarkerRef.current = null;
      }

      // Create a container for the React component
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.zIndex = "1000";
      container.style.pointerEvents = "none";

      // Create a React root and render the MapCard
      const root = createRoot(container);
      root.render(
        <div
          style={{
            pointerEvents: "auto",
            cursor: "pointer",
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = `/centers/${center.id}`;
          }}
        >
          <MapCard
            center={center}
            onCardClick={() => {
              window.location.href = `/centers/${center.id}`;
            }}
          />
        </div>
      );

      // Create a custom marker to position the card
      const cardMarker = new mapboxgl.Marker({
        element: container,
        anchor: "center",
        offset: [0, 0],
      })
        .setLngLat([Number(center.longitude), Number(center.latitude)])
        .addTo(mapRef.current);

      activeCardMarkerRef.current = cardMarker;
    },
    [mapRef]
  );

  // Add map move listener to ensure markers stay in place
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMove = () => {
      // Remove and re-add markers to ensure they move precisely with the map
      markersRef.current.forEach((marker) => {
        marker.remove().addTo(map);
      });
    };

    map.on("move", handleMove);

    return () => {
      map.off("move", handleMove);
    };
  }, [mapRef]);

  // Update markers when data changes
  useEffect(() => {
    updateMarkers();
  }, [centers, updateMarkers]);

  // Handle active pin and card creation
  useEffect(() => {
    if (activePin && mapRef.current) {
      const center = centers.find((c) => c.id === activePin);
      if (center && center.latitude && center.longitude) {
        createCard(center);
      }
    } else if (activeCardMarkerRef.current) {
      activeCardMarkerRef.current.remove();
      activeCardMarkerRef.current = null;
    }
  }, [activePin, centers, mapRef, createCard]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      if (activeCardMarkerRef.current) {
        activeCardMarkerRef.current.remove();
        activeCardMarkerRef.current = null;
      }
    };
  }, []);

  return null;
};

export default MapMarkers;
