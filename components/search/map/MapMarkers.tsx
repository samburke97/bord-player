import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Center } from "@/types";
import type { RootState } from "@/store/store";
import { setActivePin, setHoveredCenter } from "@/store/features/searchSlice";
import styles from "./MapMarkers.module.css";
import mapboxgl from "mapbox-gl";

interface MapMarkersProps {
  centers: Center[];
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  mapContainer: React.RefObject<HTMLDivElement>;
}

const MapMarkers: React.FC<MapMarkersProps> = ({
  centers,
  mapRef,
  mapContainer,
}) => {
  const dispatch = useDispatch();
  const activePin = useSelector((state: RootState) => state.search.activePin);
  const hoveredItem = useSelector(
    (state: RootState) => state.search.hoveredItem
  );

  const isMovingRef = useRef(false);

  const markerElementsRef = useRef<mapboxgl.Marker[]>([]);
  const activeCardMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // In MapMarkers.tsx, update the updateMarkers function
  const updateMarkers = useCallback(() => {
    // Add debugging
    console.log("Centers data:", centers);

    // Early return if map is null or moving
    if (!mapRef.current || isMovingRef.current) {
      console.log("Early return - map not ready or moving");
      return;
    }

    markerElementsRef.current.forEach((marker) => marker.remove());
    markerElementsRef.current = [];

    if (activeCardMarkerRef.current) {
      activeCardMarkerRef.current.remove();
      activeCardMarkerRef.current = null;
    }

    const validCenters = centers.filter(
      (center) => center.latitude && center.longitude
    );

    console.log("Valid centers with coordinates:", validCenters.length);

    // Safely get bounds, with fallback
    const bounds = mapRef.current?.getBounds() ?? null;
    console.log("Map bounds:", bounds);

    let markersInBounds = 0;

    validCenters.forEach((center) => {
      try {
        // IMPORTANT: This check might be the issue
        // Remove the bounds check temporarily to see if markers appear
        /*
      if (
        !bounds ||
        !bounds.contains([Number(center.longitude), Number(center.latitude)])
      ) {
        console.log(`Center ${center.id} outside bounds`);
        return;
      }
      */

        // Create marker regardless of bounds for testing
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

        if (activePin === center.id) {
          pinElement.classList.add(styles.activeMarker, styles.hoveredMarker);
        } else if (hoveredItem === center.id) {
          pinElement.classList.add(styles.hoveredMarker);
        }

        if (!mapRef.current) return;

        const marker = new mapboxgl.Marker({
          element: pinElement,
          anchor: "bottom",
        })
          .setLngLat([Number(center.longitude), Number(center.latitude)])
          .addTo(mapRef.current);

        markerElementsRef.current.push(marker);
        markersInBounds++;

        // Rest of your event listener code...
      } catch (error) {
        console.error(`Error creating marker for center ${center.id}:`, error);
      }
    });

    console.log(
      `Created ${markersInBounds} markers out of ${validCenters.length} valid centers`
    );
  }, [centers, mapRef, activePin, hoveredItem, dispatch]);

  const createCard = (center: Center) => {
    if (!mapRef.current || !mapContainer.current) return;

    if (activeCardMarkerRef.current) {
      activeCardMarkerRef.current.remove();
      activeCardMarkerRef.current = null;
    }

    const cardElement = document.createElement("div");
    cardElement.className = styles.cardWrapper;
    cardElement.setAttribute("data-for-center", center.id);

    const position = mapRef.current.project([
      Number(center.longitude),
      Number(center.latitude),
    ]);

    const mapHeight = mapContainer.current.clientHeight;
    const isTopHalf = position.y < mapHeight / 2;

    cardElement.classList.add(
      isTopHalf ? styles.placementBottom : styles.placementTop
    );

    cardElement.innerHTML = `
      <div class="${styles.card}">
        <div class="${styles.imageContainer}">
          ${
            center.images && center.images.length > 0
              ? `<img src="${center.images[0]}" alt="${center.name}" class="${styles.image}" />`
              : `<div class="${styles.placeholderImage}"></div>`
          }
        </div>
        <div class="${styles.description}">
        ${
          center.sports && center.sports.length > 0
            ? `<div class="${styles.sportContainer}">
                ${center.sports
                  .slice(0, 3)
                  .map(
                    (sport) =>
                      `<span class="${styles.sportPill}">${sport}</span>`
                  )
                  .join("")}
              </div>`
            : ""
        }
          <h2>${center.name}</h2>
          ${
            center.address
              ? `<div class="${styles.carousel__location}">
                <span class="${styles.carousel__icon}">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 1C4.07 1 2.5 2.57 2.5 4.5C2.5 7.25 6 11 6 11C6 11 9.5 7.25 9.5 4.5C9.5 2.57 7.93 1 6 1ZM6 5.75C5.31 5.75 4.75 5.19 4.75 4.5C4.75 3.81 5.31 3.25 6 3.25C6.69 3.25 7.25 3.81 7.25 4.5C7.25 5.19 6.69 5.75 6 5.75Z" fill="#7E807E"/>
                  </svg>
                </span>
                <span class="${styles.carousel__address}">${center.address}</span>
              </div>`
              : ""
          }
        </div>
      </div>
    `;

    cardElement.addEventListener("click", (e) => {
      e.stopPropagation();
      window.location.href = `/centers/${center.id}`;
    });

    const cardMarker = new mapboxgl.Marker({
      element: cardElement,
      anchor: "center",
      offset: [0, isTopHalf ? 125 : -285],
    })
      .setLngLat([Number(center.longitude), Number(center.latitude)])
      .addTo(mapRef.current);

    activeCardMarkerRef.current = cardMarker;
  };

  useEffect(() => {
    if (mapRef.current) {
      const handleMoveStart = () => {
        isMovingRef.current = true;
      };

      const handleMoveEnd = () => {
        isMovingRef.current = false;
        updateMarkers();
      };

      mapRef.current.on("movestart", handleMoveStart);
      mapRef.current.on("moveend", handleMoveEnd);

      return () => {
        if (mapRef.current) {
          mapRef.current.off("movestart", handleMoveStart);
          mapRef.current.off("moveend", handleMoveEnd);
        }
      };
    }
  }, [mapRef, updateMarkers]);

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
  }, [activePin, centers, mapRef]);

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

  useEffect(() => {
    markerElementsRef.current.forEach((marker) => {
      const pinElement = marker.getElement();
      const centerId = pinElement.getAttribute("data-center-id");

      // Ensure active pin is always hovered
      if (activePin === centerId) {
        pinElement.classList.add(styles.activeMarker);
        pinElement.classList.add(styles.hoveredMarker);
      } else {
        // Reset states for other pins
        pinElement.classList.remove(styles.activeMarker);
        pinElement.classList.remove(styles.hoveredMarker);

        // Add hover only for non-active, hovered item
        if (hoveredItem === centerId) {
          pinElement.classList.add(styles.hoveredMarker);
        }
      }

      // Update pin image
      const markerImage = pinElement.querySelector("img");
      if (markerImage) {
        markerImage.src =
          activePin === centerId
            ? "/images/map/active-pin.svg"
            : "/images/map/base-pin.svg";
      }
    });
  }, [hoveredItem, activePin]);

  return null;
};

export default MapMarkers;
