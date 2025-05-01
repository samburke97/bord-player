import React, { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { useDispatch, useSelector } from "react-redux";
import type { Center } from "@/types";
import type { RootState } from "@/store/store";
import styles from "./MapMarkers.module.css";
import {
  setActivePin,
  resetActiveStates,
} from "@/store/redux/features/searchSlice";
import mapboxgl from "mapbox-gl";

// Import the MapCard component
import MapCard from "./MapCard";

interface MapMarkersProps {
  centers: Center[];
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  mapContainer: React.RefObject<HTMLDivElement>;
}

const MapMarkers: React.FC<MapMarkersProps> = ({ centers, mapRef }) => {
  const dispatch = useDispatch();
  const activePin = useSelector((state: RootState) => state.search.activePin);
  const hoveredItem = useSelector(
    (state: RootState) => state.search.hoveredItem
  );

  const isMovingRef = useRef(false);
  const markerElementsRef = useRef<mapboxgl.Marker[]>([]);
  const activeCardMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Current zoom level state
  const [currentZoom, setCurrentZoom] = useState(12);
  const ZOOM_THRESHOLD_FULL = 12;
  const ZOOM_THRESHOLD_MEDIUM = 9;

  // Update markers function
  const updateMarkers = useCallback(() => {
    if (!mapRef.current || isMovingRef.current) return;

    // Get current zoom level
    const zoom = mapRef.current.getZoom();
    setCurrentZoom(zoom);

    // Remove existing markers
    markerElementsRef.current.forEach((marker) => marker.remove());
    markerElementsRef.current = [];

    const validCenters = centers.filter(
      (center) => center.latitude && center.longitude
    );

    // Determine which centers to show as full markers vs dots based on zoom level and ratings
    const fullMarkerCenters = validCenters.filter((center) => {
      // Show full markers for: active pins, hovered pins, high-rated centers when zoomed out, or all centers when zoomed in
      return (
        activePin === center.id ||
        hoveredItem === center.id ||
        zoom >= ZOOM_THRESHOLD_FULL ||
        (zoom >= ZOOM_THRESHOLD_MEDIUM && center.rating && center.rating >= 4.8)
      );
    });

    const dotMarkerCenters = validCenters.filter(
      (center) => !fullMarkerCenters.some((c) => c.id === center.id)
    );

    // Create full markers
    fullMarkerCenters.forEach((center) => {
      const pinElement = document.createElement("div");
      pinElement.className = `${styles.marker}`;
      pinElement.setAttribute("data-center-id", center.id);

      const markerImage = document.createElement("img");
      markerImage.src =
        activePin === center.id
          ? "/images/map/active-pin.svg"
          : "/images/map/base-pin.svg";
      markerImage.alt = "Location Marker";
      markerImage.className = styles.pinImage;
      markerImage.draggable = false;
      pinElement.appendChild(markerImage);

      // Add rating if available
      if (center.rating) {
        const ratingElement = document.createElement("div");
        ratingElement.className = styles.ratingBadge;
        ratingElement.textContent = center.rating.toFixed(1);
        pinElement.appendChild(ratingElement);
      }

      // Add hover and active states
      if (activePin === center.id) {
        pinElement.classList.add(styles.activeMarker, styles.hoveredMarker);
      } else if (hoveredItem === center.id) {
        pinElement.classList.add(styles.hoveredMarker);
      }

      // Add click event to show card and set active pin
      pinElement.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent map click event
        dispatch(setActivePin(center.id));
      });

      // Create marker
      const marker = new mapboxgl.Marker({
        element: pinElement,
        anchor: "bottom",
      })
        .setLngLat([Number(center.longitude), Number(center.latitude)])
        .addTo(mapRef.current);

      markerElementsRef.current.push(marker);
    });

    // Create dot markers for others
    dotMarkerCenters.forEach((center) => {
      const dotElement = document.createElement("div");
      dotElement.className = styles.dotMarker;
      dotElement.setAttribute("data-center-id", center.id);

      dotElement.addEventListener("mouseenter", () => {
        dotElement.innerHTML = "";
        dotElement.className = `${styles.marker} ${styles.popupPin}`; // Add animated class

        const markerImage = document.createElement("img");
        markerImage.src = "/images/map/base-pin.svg";
        markerImage.alt = "Location Marker";
        markerImage.className = styles.pinImage;
        markerImage.draggable = false;

        dotElement.appendChild(markerImage);

        if (center.rating) {
          const ratingElement = document.createElement("div");
          ratingElement.className = styles.ratingBadge;
          ratingElement.textContent = center.rating.toFixed(1);
          dotElement.appendChild(ratingElement);
        }
      });

      dotElement.addEventListener("mouseleave", () => {
        if (activePin !== center.id) {
          dotElement.innerHTML = "";
          dotElement.className = styles.dotMarker; // Revert to small dot
        }
      });

      // Add click event to show card and set active pin
      dotElement.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent map click event
        dispatch(setActivePin(center.id));
      });

      // Create marker
      const marker = new mapboxgl.Marker({
        element: dotElement,
        anchor: "center",
      })
        .setLngLat([Number(center.longitude), Number(center.latitude)])
        .addTo(mapRef.current);

      markerElementsRef.current.push(marker);
    });
  }, [centers, mapRef, activePin, hoveredItem, dispatch]);

  // Create card for active center
  const createCard = useCallback(
    (center: Center) => {
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
          onMouseDown={(e) => {
            e.stopPropagation();
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
        .addTo(mapRef.current!);

      activeCardMarkerRef.current = cardMarker;
    },
    [mapRef]
  );

  // Add map movement and zoom listeners
  useEffect(() => {
    if (!mapRef.current) return;

    const handleMove = () => {
      // Re-add markers to ensure they move with the map
      markerElementsRef.current.forEach((marker) => {
        marker.remove().addTo(mapRef.current!);
      });
    };

    const handleZoom = () => {
      if (!mapRef.current) return;

      const zoom = mapRef.current.getZoom();
      // Only update markers if crossing a zoom threshold
      if (
        (currentZoom < ZOOM_THRESHOLD_MEDIUM &&
          zoom >= ZOOM_THRESHOLD_MEDIUM) ||
        (currentZoom >= ZOOM_THRESHOLD_MEDIUM &&
          zoom < ZOOM_THRESHOLD_MEDIUM) ||
        (currentZoom < ZOOM_THRESHOLD_FULL && zoom >= ZOOM_THRESHOLD_FULL) ||
        (currentZoom >= ZOOM_THRESHOLD_FULL && zoom < ZOOM_THRESHOLD_FULL)
      ) {
        updateMarkers();
      }
      setCurrentZoom(zoom);
    };

    mapRef.current.on("move", handleMove);
    mapRef.current.on("zoom", handleZoom);
    mapRef.current.on("zoomend", updateMarkers);

    return () => {
      if (mapRef.current) {
        mapRef.current.off("move", handleMove);
        mapRef.current.off("zoom", handleZoom);
        mapRef.current.off("zoomend", updateMarkers);
      }
    };
  }, [mapRef, currentZoom, updateMarkers]);

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

  // Map load and markers initialization
  useEffect(() => {
    if (mapRef.current && mapRef.current.loaded()) {
      updateMarkers();
    } else if (mapRef.current) {
      mapRef.current.once("load", updateMarkers);
    }

    return () => {
      markerElementsRef.current.forEach((marker) => marker.remove());
      if (activeCardMarkerRef.current) {
        activeCardMarkerRef.current.remove();
      }
    };
  }, [centers, updateMarkers, mapRef]);

  return null;
};

export default MapMarkers;
