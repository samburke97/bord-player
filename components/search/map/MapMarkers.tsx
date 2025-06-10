// components/search/map/MapMarkers.tsx
import React, { useEffect, useRef, useState, memo } from "react";
import mapboxgl from "mapbox-gl";
import { createRoot } from "react-dom/client";
import MapCard from "./MapCard";
import type { Center } from "@/types";
import { useAppSelector, useAppDispatch } from "@/store/store";
import { setHoveredItem } from "@/store/features/searchSlice";
import { calculateDistance } from "@/lib/utils/distance";

interface MapMarkersProps {
  centers: Center[];
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  activePin: string | null;
  onMarkerClick: (id: string | null) => void;
  distance?: number;
}

const MapMarkers: React.FC<MapMarkersProps> = ({
  centers,
  mapRef,
  activePin,
  onMarkerClick,
  distance,
}) => {
  const dispatch = useAppDispatch();
  const hoveredItem = useAppSelector((state) => state.search.hoveredItem);
  const [isMobile, setIsMobile] = useState(false);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const cardMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const normalSize = "14px";
  const activeSize = "18px";

  const userLocation = useAppSelector((state) => state.search.userLocation);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Create or update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Get primary color from CSS variables
    const primaryColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--primary-300")
        .trim() || "#39b252";

    // Track existing markers
    const existingMarkerIds = new Set(Object.keys(markersRef.current));
    const newMarkerIds = new Set<string>();

    // Helper to update marker appearance
    const updateMarkerAppearance = (
      element: HTMLElement,
      isActive: boolean,
      isHovered: boolean = false
    ) => {
      // Store center ID as data attribute for easy retrieval
      element.dataset.centerId = element.dataset.centerId || "";
      element.dataset.active = isActive ? "true" : "false";
      element.dataset.hovered = isHovered ? "true" : "false";

      if (isActive) {
        element.style.backgroundColor = primaryColor;
        element.style.width = activeSize;
        element.style.height = activeSize;
        element.style.border = "2px solid white";
        element.style.boxShadow = "0 0 0 2px rgba(255, 255, 255, 0.8)";
      } else if (isHovered) {
        element.style.backgroundColor = "#666";
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

    centers.forEach((center) => {
      if (!center.latitude || !center.longitude) return;
      newMarkerIds.add(center.id);
      const lat = Number(center.latitude);
      const lng = Number(center.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      const isActive = center.id === activePin;
      const isHovered = center.id === hoveredItem;

      if (existingMarkerIds.has(center.id)) {
        // Update existing marker
        const marker = markersRef.current[center.id];
        marker.setLngLat([lng, lat]);
        updateMarkerAppearance(marker.getElement(), isActive, isHovered);
      } else {
        // Create new marker
        const el = document.createElement("div");
        el.dataset.centerId = center.id;
        el.style.borderRadius = "50%";
        el.style.cursor = "pointer";
        el.style.transition =
          "width 0.15s ease, height 0.15s ease, background-color 0.15s ease";
        el.style.boxSizing = "border-box";
        updateMarkerAppearance(el, isActive, isHovered);

        // FIXED: Add proper hover tracking with Redux
        el.addEventListener("mouseenter", () => {
          dispatch(setHoveredItem(center.id));
          if (el.dataset.active !== "true") {
            updateMarkerAppearance(el, false, true);
          }
        });

        el.addEventListener("mouseleave", () => {
          dispatch(setHoveredItem(null));
          if (el.dataset.active !== "true") {
            updateMarkerAppearance(el, false, false);
          }
        });

        // FIXED: Click should only toggle active pin, not navigate
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          const isCurrentlyActive = center.id === activePin;

          // Update all markers appearance
          Object.values(markersRef.current).forEach((m) => {
            const markerEl = m.getElement();
            const markerId = markerEl.dataset.centerId || "";
            updateMarkerAppearance(
              markerEl,
              markerId === center.id && !isCurrentlyActive,
              false
            );
          });

          // Call the marker click handler to update Redux state
          if (!isCurrentlyActive) {
            onMarkerClick(center.id);
          } else {
            onMarkerClick(null);
          }
        });

        const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
          .setLngLat([lng, lat])
          .addTo(map);
        markersRef.current[center.id] = marker;
      }
    });

    // Remove markers that are no longer needed
    existingMarkerIds.forEach((id) => {
      if (!newMarkerIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    return () => {
      if (mapRef.current) {
        Object.values(markersRef.current).forEach((marker) => marker.remove());
        markersRef.current = {};
      }
    };
  }, [
    centers,
    mapRef,
    activePin,
    hoveredItem,
    onMarkerClick,
    normalSize,
    activeSize,
    dispatch,
  ]);

  // FIXED: Updated effect to respond to hoveredItem changes
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([centerId, marker]) => {
      const el = marker.getElement();
      const isActive = centerId === activePin;
      const isHovered = centerId === hoveredItem;

      // Update marker appearance based on hover state
      if (isActive) {
        el.style.backgroundColor = "#39b252"; // Primary color
        el.style.width = activeSize;
        el.style.height = activeSize;
      } else if (isHovered) {
        el.style.backgroundColor = "#666";
        el.style.width = activeSize;
        el.style.height = activeSize;
      } else {
        el.style.backgroundColor = "#444";
        el.style.width = normalSize;
        el.style.height = normalSize;
      }
    });
  }, [hoveredItem, activePin, activeSize, normalSize]);

  // Show detail card for active pin
  useEffect(() => {
    const map = mapRef.current;
    let mobileContainer: HTMLDivElement | null = null;
    let reactRoot: ReturnType<typeof createRoot> | null = null;

    if (cardMarkerRef.current) {
      cardMarkerRef.current.remove();
      cardMarkerRef.current = null;
    }

    if (!activePin || !map) {
      return;
    }

    const activeCenter = centers.find((c) => c.id === activePin);
    if (!activeCenter || !activeCenter.latitude || !activeCenter.longitude)
      return;

    const lat = Number(activeCenter.latitude);
    const lng = Number(activeCenter.longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    let calculatedDistance: number | null = null;
    if (
      userLocation &&
      typeof userLocation.latitude === "number" &&
      typeof userLocation.longitude === "number" &&
      userLocation.isPrecise
    ) {
      try {
        calculatedDistance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          lat,
          lng
        );
      } catch (error) {
        console.error("Error calculating distance in MapMarkers:", error);
      }
    }

    const container = document.createElement("div");
    container.style.zIndex = "10";
    container.style.pointerEvents = "auto";

    reactRoot = createRoot(container);
    reactRoot.render(
      <MapCard
        center={activeCenter}
        distance={calculatedDistance}
        onCardClick={() => {
          if (activeCenter)
            window.location.href = `/centers/${activeCenter.id}`;
        }}
      />
    );

    if (isMobile) {
      mobileContainer = container;
      mobileContainer.style.position = "fixed";
      mobileContainer.style.bottom = "40px";
      mobileContainer.style.left = "50%";
      mobileContainer.style.transform = "translateX(-50%)";
      mobileContainer.style.maxWidth = "90%";
      mobileContainer.style.width = "280px";
      mobileContainer.style.zIndex = "9999";
      mobileContainer.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
      document.body.appendChild(mobileContainer);
    } else {
      let anchorPosition:
        | "top"
        | "bottom"
        | "center"
        | "left"
        | "right"
        | "top-left"
        | "top-right"
        | "bottom-left"
        | "bottom-right" = "bottom";
      let offsetY = -15;

      try {
        const markerPoint = map.project([lng, lat]);
        const mapCenterPoint = map.project(map.getCenter());
        const mapHeight = map.getCanvas().clientHeight;

        if (markerPoint.y < mapHeight * 0.4) {
          anchorPosition = "top";
          offsetY = 15;
        } else {
          anchorPosition = "bottom";
          offsetY = -15;
        }
      } catch (e) {
        console.error(
          "Error calculating marker position for card anchoring:",
          e
        );
      }

      cardMarkerRef.current = new mapboxgl.Marker({
        element: container,
        anchor: anchorPosition,
        offset: [0, offsetY],
      })
        .setLngLat([lng, lat])
        .addTo(map);
    }

    return () => {
      if (reactRoot) {
        reactRoot.unmount();
      }
      if (
        isMobile &&
        mobileContainer &&
        document.body.contains(mobileContainer)
      ) {
        document.body.removeChild(mobileContainer);
      }
      if (
        !isMobile &&
        cardMarkerRef.current &&
        cardMarkerRef.current.getElement() === container
      ) {
        cardMarkerRef.current.remove();
        cardMarkerRef.current = null;
      }
    };
  }, [activePin, centers, mapRef, userLocation, isMobile, onMarkerClick]);

  return null;
};

export default memo(MapMarkers);
