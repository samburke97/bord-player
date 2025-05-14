import React, { useEffect, useRef, useState, memo, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { createRoot } from "react-dom/client";
import MapCard from "./MapCard";
import type { Center } from "@/types";
import { useAppSelector } from "@/store/store";
import { calculateDistance } from "@/lib/utils/distance";

interface MapMarkersProps {
  centers: Center[];
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  activePin: string | null;
  onMarkerClick: (id: string | null) => void;
}

const MapMarkers: React.FC<MapMarkersProps> = ({
  centers,
  mapRef,
  activePin,
  onMarkerClick,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const cardMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const normalSize = "14px";
  const activeSize = "18px";

  const userLocation = useAppSelector((state) => state.search.userLocation);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    const primaryColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--primary-300")
        .trim() || "#39b252";
    const existingMarkerIds = new Set(Object.keys(markersRef.current));
    const newMarkerIds = new Set<string>();

    const updateMarkerAppearance = (
      element: HTMLElement,
      isActive: boolean,
      isHovered: boolean = false
    ) => {
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

      if (existingMarkerIds.has(center.id)) {
        const marker = markersRef.current[center.id];
        marker.setLngLat([lng, lat]);
        updateMarkerAppearance(marker.getElement(), isActive);
      } else {
        const el = document.createElement("div");
        el.style.borderRadius = "50%";
        el.style.cursor = "pointer";
        el.style.transition =
          "width 0.15s ease, height 0.15s ease, background-color 0.15s ease";
        el.style.boxSizing = "border-box";
        updateMarkerAppearance(el, isActive);

        el.addEventListener("mouseenter", () => {
          if (el.dataset.active !== "true")
            updateMarkerAppearance(el, false, true);
        });
        el.addEventListener("mouseleave", () => {
          if (el.dataset.active !== "true")
            updateMarkerAppearance(el, false, false);
        });

        const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
          .setLngLat([lng, lat])
          .addTo(map);
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          const isCurrentlyActive = center.id === activePin;
          Object.values(markersRef.current).forEach((m) =>
            updateMarkerAppearance(m.getElement(), false, false)
          );
          if (!isCurrentlyActive) {
            updateMarkerAppearance(el, true, false);
            onMarkerClick(center.id);
          } else {
            onMarkerClick(null);
          }
        });
        markersRef.current[center.id] = marker;
      }
    });

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
  }, [centers, mapRef, activePin, onMarkerClick, activeSize, normalSize]);

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
      true
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
