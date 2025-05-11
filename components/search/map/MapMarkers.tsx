// components/search/map/OptimizedMapMarkers.tsx
import React, { useCallback, useEffect, useRef, useState, memo } from "react";
import { createRoot } from "react-dom/client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import mapboxgl from "mapbox-gl";
import type { Center } from "@/types";
import {
  setActivePin,
  setHoveredCenter,
} from "@/store/redux/features/searchSlice";

// Import styles
import styles from "./MapMarkers.module.css";

// Import MapCard component
import MapCard from "./MapCard";

interface MarkerProps {
  center: Center;
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  isActive: boolean;
  isHovered: boolean;
  onClick: (id: string) => void;
  onHover: (id: string | null) => void;
}

// Memoized single marker component for better performance
const Marker = memo(
  ({ center, mapRef, isActive, isHovered, onClick, onHover }: MarkerProps) => {
    const markerRef = useRef<mapboxgl.Marker | null>(null);
    const elementRef = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    // Create or update marker
    useEffect(() => {
      if (!mapRef.current || !center.latitude || !center.longitude) return;

      // Create marker element
      if (!elementRef.current) {
        const el = document.createElement("div");
        el.className = `${styles.marker} ${
          isActive ? styles.activeMarker : ""
        } ${isHovered ? styles.hoveredMarker : ""}`;
        el.setAttribute("data-center-id", center.id);

        const markerImage = document.createElement("img");
        markerImage.src = isActive
          ? "/images/map/active-pin.svg"
          : "/images/map/base-pin.svg";
        markerImage.alt = "Location Marker";
        markerImage.className = styles.pinImage;
        markerImage.draggable = false;
        el.appendChild(markerImage);

        // Add rating badge if available
        if (center.rating) {
          const ratingElement = document.createElement("div");
          ratingElement.className = styles.ratingBadge;
          ratingElement.textContent = center.rating.toFixed(1);
          el.appendChild(ratingElement);
        }

        // Add event listeners
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onClick(center.id);
        });
        el.addEventListener("mouseenter", () => onHover(center.id));
        el.addEventListener("mouseleave", () => onHover(null));

        elementRef.current = el;

        // Create marker
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: "bottom",
        })
          .setLngLat([Number(center.longitude), Number(center.latitude)])
          .addTo(mapRef.current);

        markerRef.current = marker;
      }

      return () => {
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
          elementRef.current = null;
        }
      };
    }, [mapRef, center.id, center.latitude, center.longitude, center.rating]);

    // Update marker state when active/hover state changes
    useEffect(() => {
      if (!elementRef.current) return;

      // Update marker classes
      if (isActive) {
        elementRef.current.classList.add(styles.activeMarker);
      } else {
        elementRef.current.classList.remove(styles.activeMarker);
      }

      if (isHovered) {
        elementRef.current.classList.add(styles.hoveredMarker);
      } else {
        elementRef.current.classList.remove(styles.hoveredMarker);
      }

      // Update marker image
      const img = elementRef.current.querySelector("img");
      if (img) {
        img.src = isActive
          ? "/images/map/active-pin.svg"
          : "/images/map/base-pin.svg";
      }
    }, [isActive, isHovered]);

    // Check if marker is in viewport and update visibility
    useEffect(() => {
      if (!mapRef.current || !markerRef.current) return;

      const checkVisibility = () => {
        if (!mapRef.current || !markerRef.current) return;

        const bounds = mapRef.current.getBounds();
        const markerLngLat = markerRef.current.getLngLat();
        const isInBounds = bounds.contains(markerLngLat);

        if (isInBounds !== isVisible) {
          setIsVisible(isInBounds);

          // Hide/show the marker element
          if (elementRef.current) {
            elementRef.current.style.display = isInBounds ? "block" : "none";
          }
        }
      };

      // Check visibility initially and on map move
      checkVisibility();

      const map = mapRef.current;
      map.on("move", checkVisibility);
      map.on("zoom", checkVisibility);

      return () => {
        if (map) {
          map.off("move", checkVisibility);
          map.off("zoom", checkVisibility);
        }
      };
    }, [mapRef, isVisible]);

    return null;
  }
);

interface OptimizedMapMarkersProps {
  centers: Center[];
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  onMarkerClick?: (id: string) => void;
}

const MapMarkers = memo(
  ({ centers, mapRef, onMarkerClick }: OptimizedMapMarkersProps) => {
    const dispatch = useAppDispatch();
    const activePin = useAppSelector((state) => state.search.activePin);
    const hoveredItem = useAppSelector((state) => state.search.hoveredItem);
    const [visibleCenters, setVisibleCenters] = useState<Center[]>([]);
    const cardMarkerRef = useRef<mapboxgl.Marker | null>(null);

    // Virtualization: Only render markers in viewport
    useEffect(() => {
      if (!mapRef.current) return;

      const updateVisibleCenters = () => {
        if (!mapRef.current) return;

        const bounds = mapRef.current.getBounds();
        const zoom = mapRef.current.getZoom();
        const buffer = 0.1; // Buffer around visible area

        // Extend bounds with buffer
        const extendedBounds = bounds
          .extend([
            bounds.getNorthEast().lng + buffer,
            bounds.getNorthEast().lat + buffer,
          ])
          .extend([
            bounds.getSouthWest().lng - buffer,
            bounds.getSouthWest().lat - buffer,
          ]);

        // Filter centers based on extended bounds
        const filtered = centers.filter((center) => {
          if (!center.latitude || !center.longitude) return false;
          return extendedBounds.contains([
            Number(center.longitude),
            Number(center.latitude),
          ]);
        });

        // Sort by priority (active first, then hovered)
        const sorted = [...filtered].sort((a, b) => {
          if (a.id === activePin) return -1;
          if (b.id === activePin) return 1;
          if (a.id === hoveredItem) return -1;
          if (b.id === hoveredItem) return 1;
          return 0;
        });

        setVisibleCenters(sorted);
      };

      updateVisibleCenters();

      const map = mapRef.current;
      map.on("moveend", updateVisibleCenters);
      map.on("zoomend", updateVisibleCenters);

      return () => {
        if (map) {
          map.off("moveend", updateVisibleCenters);
          map.off("zoomend", updateVisibleCenters);
        }
      };
    }, [mapRef, centers, activePin, hoveredItem]);

    // Handle marker click
    const handleMarkerClick = useCallback(
      (id: string) => {
        dispatch(setActivePin(id));
        if (onMarkerClick) {
          onMarkerClick(id);
        }
      },
      [dispatch, onMarkerClick]
    );

    // Handle marker hover
    const handleMarkerHover = useCallback(
      (id: string | null) => {
        dispatch(setHoveredCenter(id));
      },
      [dispatch]
    );

    // Create card for active center
    useEffect(() => {
      if (!mapRef.current) return;

      // Clean up previous card
      if (cardMarkerRef.current) {
        cardMarkerRef.current.remove();
        cardMarkerRef.current = null;
      }

      // Find active center
      if (activePin) {
        const activeCenter = centers.find((c) => c.id === activePin);

        if (activeCenter && activeCenter.latitude && activeCenter.longitude) {
          // Create container for React component
          const container = document.createElement("div");
          container.style.position = "absolute";
          container.style.zIndex = "1000";
          container.style.pointerEvents = "none";

          // Render MapCard into container
          const root = createRoot(container);
          root.render(
            <div
              style={{
                pointerEvents: "auto",
                cursor: "pointer",
              }}
              onClick={() => {
                window.location.href = `/centers/${activeCenter.id}`;
              }}
            >
              <MapCard
                center={activeCenter}
                onCardClick={() => {
                  window.location.href = `/centers/${activeCenter.id}`;
                }}
              />
            </div>
          );

          // Create marker to position the card
          const cardMarker = new mapboxgl.Marker({
            element: container,
            anchor: "center",
            offset: [0, -120], // Offset to position card above pin
          })
            .setLngLat([
              Number(activeCenter.longitude),
              Number(activeCenter.latitude),
            ])
            .addTo(mapRef.current);

          cardMarkerRef.current = cardMarker;
        }
      }

      return () => {
        if (cardMarkerRef.current) {
          cardMarkerRef.current.remove();
          cardMarkerRef.current = null;
        }
      };
    }, [activePin, centers, mapRef]);

    return (
      <>
        {visibleCenters.map((center) => (
          <Marker
            key={center.id}
            center={center}
            mapRef={mapRef}
            isActive={activePin === center.id}
            isHovered={hoveredItem === center.id}
            onClick={handleMarkerClick}
            onHover={handleMarkerHover}
          />
        ))}
      </>
    );
  }
);

export default MapMarkers;
