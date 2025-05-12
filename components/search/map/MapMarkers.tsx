// components/search/map/MapMarkers.tsx - Completely rebuilt from scratch
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { createRoot } from "react-dom/client";
import MapCard from "./MapCard";
import type { Center } from "@/types";

interface MapMarkersProps {
  centers: Center[];
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
}

const MapMarkers: React.FC<MapMarkersProps> = ({ centers, mapRef }) => {
  // Track active marker ID
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  // Track all markers and the active card
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const cardMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Handle map or marker cleanup
  useEffect(() => {
    return () => {
      // Remove all markers on unmount
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      if (cardMarkerRef.current) {
        cardMarkerRef.current.remove();
      }
    };
  }, []);

  // Create or update markers when centers change
  useEffect(() => {
    if (!mapRef.current) return;

    // Track existing markers to compare with new centers
    const existingMarkerIds = new Set(Object.keys(markersRef.current));
    const newMarkerIds = new Set<string>();

    // Process each center
    centers.forEach((center) => {
      // Skip centers without coordinates
      if (!center.latitude || !center.longitude) return;

      newMarkerIds.add(center.id);

      // Convert coordinates to numbers
      const lat = Number(center.latitude);
      const lng = Number(center.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      // Check if marker already exists
      if (existingMarkerIds.has(center.id)) {
        // Update existing marker's position if needed
        const marker = markersRef.current[center.id];
        marker.setLngLat([lng, lat]);

        // Update marker appearance based on active state
        const element = marker.getElement();
        if (center.id === activeMarkerId) {
          element.style.backgroundColor = "#39b252";
          element.style.boxShadow = "0 0 0 2px rgba(255, 255, 255, 0.7)";
        } else {
          element.style.backgroundColor = "#444";
          element.style.boxShadow = "0 0 0 2px rgba(255, 255, 255, 0.5)";
        }
      } else {
        // Create a new marker element
        const el = document.createElement("div");

        // Base marker styles
        el.style.width = "8px";
        el.style.height = "8px";
        el.style.backgroundColor = "#444";
        el.style.borderRadius = "50%";
        el.style.cursor = "pointer";
        el.style.boxShadow = "0 0 0 2px rgba(255, 255, 255, 0.5)";

        // Create and add the marker
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: "center",
        })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        // Add click handler
        el.addEventListener("click", (e) => {
          e.stopPropagation();

          // Set this as the active marker
          setActiveMarkerId((prevId) =>
            prevId === center.id ? null : center.id
          );
        });

        // Store marker reference
        markersRef.current[center.id] = marker;
      }
    });

    // Clean up markers that are no longer in the data
    existingMarkerIds.forEach((id) => {
      if (!newMarkerIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
  }, [centers, mapRef]);

  // Handle active marker - show/hide card
  useEffect(() => {
    // Clean up existing card
    if (cardMarkerRef.current) {
      cardMarkerRef.current.remove();
      cardMarkerRef.current = null;
    }

    // If no active marker or map, just return
    if (!activeMarkerId || !mapRef.current) return;

    // Find the center for the active marker
    const activeCenter = centers.find((c) => c.id === activeMarkerId);
    if (!activeCenter || !activeCenter.latitude || !activeCenter.longitude)
      return;

    // Convert coordinates
    const lat = Number(activeCenter.latitude);
    const lng = Number(activeCenter.longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    // Create card container
    const container = document.createElement("div");
    container.style.zIndex = "1000";
    container.style.pointerEvents = "auto";

    // Render the card with React
    const root = createRoot(container);
    root.render(
      <MapCard
        center={activeCenter}
        onCardClick={() => {
          window.location.href = `/centers/${activeCenter.id}`;
        }}
      />
    );

    // Create and add the card marker
    cardMarkerRef.current = new mapboxgl.Marker({
      element: container,
      anchor: "bottom",
      offset: [0, -10],
    })
      .setLngLat([lng, lat])
      .addTo(mapRef.current);

    // Set up click handler to clear active marker when map is clicked
    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      // Only deactivate if we didn't click on a marker
      if (e.originalEvent.target instanceof Element) {
        const target = e.originalEvent.target as Element;
        if (!target.closest(".mapboxgl-marker")) {
          setActiveMarkerId(null);
        }
      }
    };

    // Set up pan/zoom handler to clear active marker
    const handleMapMove = () => {
      setActiveMarkerId(null);
    };

    // Add the listeners
    mapRef.current.on("click", handleMapClick);
    mapRef.current.on("dragstart", handleMapMove);
    mapRef.current.on("zoomstart", handleMapMove);

    // Clean up listeners
    return () => {
      if (mapRef.current) {
        mapRef.current.off("click", handleMapClick);
        mapRef.current.off("dragstart", handleMapMove);
        mapRef.current.off("zoomstart", handleMapMove);
      }
    };
  }, [activeMarkerId, centers, mapRef]);

  return null;
};

export default MapMarkers;
