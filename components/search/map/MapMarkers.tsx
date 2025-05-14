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
  // Add mobile detection state
  const [isMobile, setIsMobile] = useState(false);

  // Track all markers and the active card
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const cardMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Define consistent marker sizes
  const normalSize = "14px";
  const activeSize = "18px"; // Larger size for active and hovered

  // Add mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 767);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // 1. Clean up ALL existing markers first
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {}; // Reset the markers object

    // 3. Complete cleanup on unmount
    return () => {
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};
    };
  }, [centers, mapRef]);

  // Create or update markers when centers change
  useEffect(() => {
    if (!mapRef.current) return;

    // Get the primary color from CSS variables
    const primaryColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--primary-300")
        .trim() || "#39b252";

    // Track existing markers to compare with new centers
    const existingMarkerIds = new Set(Object.keys(markersRef.current));
    const newMarkerIds = new Set<string>();

    // Function to update marker appearance
    const updateMarkerAppearance = (
      element: HTMLElement,
      isActive: boolean,
      isHovered: boolean = false
    ) => {
      // Set marker active state as data attribute
      element.dataset.active = isActive ? "true" : "false";
      element.dataset.hovered = isHovered ? "true" : "false";

      if (isActive) {
        element.style.backgroundColor = primaryColor;
        element.style.width = activeSize;
        element.style.height = activeSize;
        element.style.border = "2px solid white";
        element.style.boxShadow = "0 0 0 2px rgba(255, 255, 255, 0.8)";
      } else if (isHovered) {
        element.style.backgroundColor = "#666"; // Slightly lighter gray when hovered
        element.style.width = activeSize;
        element.style.height = activeSize;
        element.style.border = "2px solid white";
        element.style.boxShadow = "0 0 0 2px rgba(255, 255, 255, 0.7)";
      } else {
        element.style.backgroundColor = "#444";
        element.style.width = normalSize;
        element.style.height = normalSize;
        element.style.border = "2px solid white";
        element.style.boxShadow = "0 0 0 2px rgba(255, 255, 255, 0.5)";
      }
    };

    // Process each center
    centers.forEach((center) => {
      // Skip centers without coordinates
      if (!center.latitude || !center.longitude) return;

      newMarkerIds.add(center.id);

      // Convert coordinates to numbers
      const lat = Number(center.latitude);
      const lng = Number(center.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      const isActive = center.id === activeMarkerId;

      // Check if marker already exists
      if (existingMarkerIds.has(center.id)) {
        // Update existing marker's position if needed
        const marker = markersRef.current[center.id];
        marker.setLngLat([lng, lat]);

        // Update marker appearance
        updateMarkerAppearance(marker.getElement(), isActive);
      } else {
        // Create a new marker element
        const el = document.createElement("div");

        // Base marker styles - we'll set the specific styles with updateMarkerAppearance
        el.style.borderRadius = "50%";
        el.style.cursor = "pointer";
        el.style.transition =
          "width 0.15s ease, height 0.15s ease, background-color 0.15s ease";
        el.style.boxSizing = "border-box"; // Ensure border is included in width/height

        // Set initial appearance
        updateMarkerAppearance(el, isActive);

        // Add hover effects
        el.addEventListener("mouseenter", () => {
          // Only apply hover effect if not active
          if (el.dataset.active !== "true") {
            updateMarkerAppearance(el, false, true);
          }
        });

        el.addEventListener("mouseleave", () => {
          // Only revert if not active
          if (el.dataset.active !== "true") {
            updateMarkerAppearance(el, false, false);
          }
        });

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

          // Check if this marker is currently active
          const isCurrentlyActive = el.dataset.active === "true";

          // Reset all markers first
          Object.values(markersRef.current).forEach((m) => {
            updateMarkerAppearance(m.getElement(), false, false);
          });

          // If this wasn't active before, make it active now
          if (!isCurrentlyActive) {
            updateMarkerAppearance(el, true, false);
            setActiveMarkerId(center.id);
          } else {
            setActiveMarkerId(null);
          }
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
  }, [centers, mapRef, activeMarkerId, activeSize, normalSize]);

  // Handle active marker - show/hide card
  useEffect(() => {
    // Clean up existing card
    if (cardMarkerRef.current) {
      cardMarkerRef.current.remove();
      cardMarkerRef.current = null;
    }

    // If no active marker or map, just return
    if (!activeMarkerId || !mapRef.current) return;

    // Get the primary color from CSS variables
    const primaryColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--primary-300")
        .trim() || "#39b252";

    // Function to update marker appearance
    const updateMarkerAppearance = (
      element: HTMLElement,
      isActive: boolean
    ) => {
      // Set active state as data attribute
      element.dataset.active = isActive ? "true" : "false";

      if (isActive) {
        element.style.backgroundColor = primaryColor;
        element.style.width = activeSize;
        element.style.height = activeSize;
        element.style.border = "2px solid white";
        element.style.boxShadow = "0 0 0 2px rgba(255, 255, 255, 0.8)";
      } else {
        element.style.backgroundColor = "#444";
        element.style.width = normalSize;
        element.style.height = normalSize;
        element.style.border = "2px solid white";
        element.style.boxShadow = "0 0 0 2px rgba(255, 255, 255, 0.5)";
      }
    };

    // Update all markers to ensure correct appearance
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      updateMarkerAppearance(marker.getElement(), id === activeMarkerId);
    });

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

    // Determine optimal card positioning based on marker position
    let anchorPosition = "bottom";
    let offsetY = -15;

    if (isMobile) {
      // On mobile, position at the bottom center of the map
      container.style.position = "fixed";
      container.style.bottom = "20px";
      container.style.left = "50%";
      container.style.transform = "translateX(-50%)";
      container.style.maxWidth = "90%";
      container.style.width = "280px";
    } else {
      // On desktop, check if marker is in top or bottom half
      try {
        const mapHeight = mapRef.current.getContainer().offsetHeight;
        const markerPoint = mapRef.current.project([lng, lat]);
        const centerPoint = mapRef.current.project(mapRef.current.getCenter());

        // If marker is in the top half, show card below
        if (markerPoint.y < centerPoint.y) {
          anchorPosition = "top";
          offsetY = 15;
        }
      } catch (e) {
        console.error("Error determining marker position:", e);
      }
    }

    // Create and add the card marker with appropriate positioning
    cardMarkerRef.current = new mapboxgl.Marker({
      element: container,
      anchor: anchorPosition as "top" | "bottom",
      offset: [0, offsetY],
    })
      .setLngLat([lng, lat])
      .addTo(mapRef.current);

    // Set up click handler to clear active marker when map is clicked
    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      // Only deactivate if we didn't click on a marker
      if (e.originalEvent.target instanceof Element) {
        const target = e.originalEvent.target as Element;
        if (!target.closest(".mapboxgl-marker")) {
          // Reset all markers
          Object.values(markersRef.current).forEach((m) => {
            updateMarkerAppearance(m.getElement(), false);
          });
          setActiveMarkerId(null);
        }
      }
    };

    // Set up pan/zoom handler to clear active marker
    const handleMapMove = () => {
      // Reset all markers
      Object.values(markersRef.current).forEach((m) => {
        updateMarkerAppearance(m.getElement(), false);
      });
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
  }, [activeMarkerId, centers, mapRef, activeSize, normalSize, isMobile]);

  return null;
};

export default MapMarkers;
