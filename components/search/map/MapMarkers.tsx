// components/search/map/MapMarkers.tsx
"use client";

import React, { useCallback, useEffect, useRef, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import mapboxgl from "mapbox-gl";
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
import styles from "../SearchMap.module.css";
import { throttle } from "lodash";

interface MarkerProps {
  center: Center;
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
}

const MapMarkers: React.FC<MapMarkersProps> = React.memo(
  ({ centers, mapRef }) => {
    const dispatch = useAppDispatch();
    const activePin = useAppSelector((state) => state.search.activePin);
    const hoveredItem = useAppSelector((state) => state.search.hoveredItem);

    // References to track markers
    const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
    const activeCardMarkerRef = useRef<mapboxgl.Marker | null>(null);
    const markerElementsCache = useRef<Record<string, HTMLDivElement>>({});

    // Track visible markers for viewport culling
    const visibleMarkersRef = useRef<Set<string>>(new Set());

    // Determine which markers are visible in the current viewport
    const updateVisibleMarkers = useCallback(
      throttle(() => {
        if (!mapRef.current) return;

        const bounds = mapRef.current.getBounds();
        const visibleMarkers = new Set<string>();

        // Check which centers are within the current viewport
        centers.forEach((center) => {
          if (!center.latitude || !center.longitude) return;

          const lngLat = new mapboxgl.LngLat(
            Number(center.longitude),
            Number(center.latitude)
          );

          // Is this marker within the current viewport?
          if (bounds.contains(lngLat)) {
            visibleMarkers.add(center.id);
          }
        });

        visibleMarkersRef.current = visibleMarkers;

        // Update markers that need to be added or removed from the map
        Object.keys(markersRef.current).forEach((id) => {
          const marker = markersRef.current[id];
          const isVisible = visibleMarkers.has(id);

          // If marker exists but is not visible, remove it from map
          if (!isVisible && marker) {
            marker.remove();
          }

          // If marker is visible but not on map, add it
          if (isVisible && marker._removed) {
            marker.addTo(mapRef.current!);
          }
        });
      }, 100),
      [centers, mapRef]
    );

    // Create a marker element with proper styling
    const createMarkerElement = useCallback(
      (center: Center, isActive: boolean, isHovered: boolean) => {
        // Check if we already have a cached element
        const cacheKey = center.id;
        if (markerElementsCache.current[cacheKey]) {
          const el = markerElementsCache.current[cacheKey];

          // Update classes for active/hover state
          if (isActive || isHovered) {
            el.classList.add(styles.activeMarker);
          } else {
            el.classList.remove(styles.activeMarker);
          }

          return el;
        }

        // Create new element if not cached
        const el = document.createElement("div");
        el.className = `${styles.dotMarker} ${
          isActive || isHovered ? styles.activeMarker : ""
        }`;
        el.setAttribute("data-center-id", center.id);

        // Add click handler
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          dispatch(setActivePin(center.id));
        });

        // Cache for reuse
        markerElementsCache.current[cacheKey] = el;

        return el;
      },
      [dispatch]
    );

    // Use memoized filtering to avoid work on unchanged data
    const centersWithCoordinates = useMemo(() => {
      return centers.filter(
        (center) => center.latitude !== null && center.longitude !== null
      );
    }, [centers]);

    // Update markers efficiently - only when necessary
    const updateMarkers = useCallback(() => {
      if (!mapRef.current) return;

      const map = mapRef.current;
      const currentMarkerIds = new Set(Object.keys(markersRef.current));
      const newMarkerIds = new Set<string>();

      centersWithCoordinates.forEach((center) => {
        newMarkerIds.add(center.id);

        const isActive = center.id === activePin;
        const isHovered = center.id === hoveredItem;

        // If marker already exists, update it
        if (currentMarkerIds.has(center.id)) {
          const marker = markersRef.current[center.id];
          const element = marker.getElement();

          // Update class for active/hover state
          if (isActive || isHovered) {
            element.classList.add(styles.activeMarker);
          } else {
            element.classList.remove(styles.activeMarker);
          }
        }
        // Otherwise create a new marker
        else {
          const el = createMarkerElement(center, isActive, isHovered);

          const marker = new mapboxgl.Marker({
            element: el,
            anchor: "center",
            pitchAlignment: "map",
            rotationAlignment: "map",
          }).setLngLat([Number(center.longitude), Number(center.latitude)]);

          // Only add to map if in viewport
          if (visibleMarkersRef.current.has(center.id)) {
            marker.addTo(map);
          }

          markersRef.current[center.id] = marker;
        }
      });

      // Remove markers that are no longer in the data
      currentMarkerIds.forEach((id) => {
        if (!newMarkerIds.has(id)) {
          markersRef.current[id].remove();
          delete markersRef.current[id];

          // Also clean up cache
          if (markerElementsCache.current[id]) {
            delete markerElementsCache.current[id];
          }
        }
      });
    }, [
      centersWithCoordinates,
      activePin,
      hoveredItem,
      mapRef,
      createMarkerElement,
    ]);

    // Create card for active center - memoize to prevent unnecessary renders
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
            onClick={() => {
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

        // Position it slightly above the marker for better visibility
        const cardMarker = new mapboxgl.Marker({
          element: container,
          anchor: "bottom",
          offset: [0, -10],
        })
          .setLngLat([Number(center.longitude), Number(center.latitude)])
          .addTo(mapRef.current);

        activeCardMarkerRef.current = cardMarker;
      },
      [mapRef]
    );

    // Update markers when centers, active pin, or hovered item changes
    useEffect(() => {
      updateMarkers();
    }, [centersWithCoordinates, activePin, hoveredItem, updateMarkers]);

    // Set up map move and zoom handlers
    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;

      // Update visible markers when map moves or zooms
      map.on("moveend", updateVisibleMarkers);
      map.on("zoomend", updateVisibleMarkers);

      // Initial update of visible markers
      updateVisibleMarkers();

      return () => {
        map.off("moveend", updateVisibleMarkers);
        map.off("zoomend", updateVisibleMarkers);
      };
    }, [mapRef, updateVisibleMarkers]);

    // Handle creating and removing the active card
    useEffect(() => {
      if (activePin) {
        const center = centers.find((c) => c.id === activePin);
        if (center && center.latitude && center.longitude) {
          // Center the map on the active pin
          mapRef.current?.flyTo({
            center: [Number(center.longitude), Number(center.latitude)],
            zoom: mapRef.current.getZoom(),
            speed: 0.8,
            curve: 1.42,
          });

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
        Object.values(markersRef.current).forEach((marker) => marker.remove());
        markersRef.current = {};

        if (activeCardMarkerRef.current) {
          activeCardMarkerRef.current.remove();
          activeCardMarkerRef.current = null;
        }

        // Clear marker element cache
        markerElementsCache.current = {};
      };
    }, []);

    return null;
  }
);

MapMarkers.displayName = "MapMarkers";

export default MapMarkers;
