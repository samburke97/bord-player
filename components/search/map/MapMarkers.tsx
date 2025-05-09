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

  const createCard = useCallback(
    (center: Center) => {
      if (!mapRef.current) return;

      // Remove any existing card marker
      if (activeCardMarkerRef.current) {
        const el = activeCardMarkerRef.current.getElement();
        if (el && el.parentNode === document.body) {
          document.body.removeChild(el);
        }
        activeCardMarkerRef.current.remove();
        activeCardMarkerRef.current = null;
      }

      const container = document.createElement("div");
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        // MOBILE: render card fixed at bottom of screen
        container.style.position = "fixed";
        container.style.bottom = "16px";
        container.style.left = "50%";
        container.style.transform = "translateX(-50%)";
        container.style.zIndex = "9999";
        container.style.width = "90vw";
        container.style.maxWidth = "390px";
        container.style.pointerEvents = "auto";

        const root = createRoot(container);
        root.render(
          <MapCard
            center={center}
            onCardClick={() => {
              window.location.href = `/centers/${center.id}`;
            }}
          />
        );

        document.body.appendChild(container);

        // Store a dummy marker just to track and clean up later
        const dummyMarker = {
          getElement: () => container,
          remove: () => {
            if (container.parentNode === document.body) {
              document.body.removeChild(container);
            }
          },
        } as unknown as mapboxgl.Marker;

        activeCardMarkerRef.current = dummyMarker;
        return;
      }

      // DESKTOP: show card above or below pin
      const CARD_HEIGHT = 244;
      const PIN_HEIGHT = 18;
      const map = mapRef.current;
      const screenPoint = map.project([
        Number(center.longitude),
        Number(center.latitude),
      ]);
      const spaceBelow = window.innerHeight - screenPoint.y;
      const shouldShowBelow = spaceBelow >= CARD_HEIGHT + PIN_HEIGHT + 20;

      container.style.width = "390px";
      container.style.pointerEvents = "none";
      container.style.zIndex = "9999";

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

      const cardMarker = new mapboxgl.Marker({
        element: container,
        anchor: shouldShowBelow ? "top" : "bottom",
        offset: [0, shouldShowBelow ? PIN_HEIGHT + 10 : -(PIN_HEIGHT + 10)],
      })
        .setLngLat([Number(center.longitude), Number(center.latitude)])
        .addTo(map);

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
