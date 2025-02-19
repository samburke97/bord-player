import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import mapboxgl from "mapbox-gl";
import styles from "./SearchMap.module.css";
import MapCard from "./MapCard";
import LoadingIndicator from "./LoadingIndicator";
import { Center } from "@/app/types/types";
import { Gps, Add, Minus } from "iconsax-react";
import { RootState } from "@/store/store";
import {
  setActivePin,
  setMapBounds,
  setHoveredCenter,
} from "@/store/features/searchSlice";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface SearchMapProps {
  centers: Center[];
  userLocation: { latitude: number; longitude: number };
  onBoundsChange?: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
}

const SearchMap: React.FC<SearchMapProps> = ({
  centers,
  userLocation,
  onBoundsChange,
}) => {
  const dispatch = useDispatch();
  const activePin = useSelector((state: RootState) => state.search.activePin);
  const hoveredItem = useSelector(
    (state: RootState) => state.search.hoveredItem
  );

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [cardPosition, setCardPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [cardContent, setCardContent] = useState<Center | null>(null);
  const isLoading = useSelector((state: RootState) => state.search.isLoading);
  const boundsChangeTimeoutRef = useRef<NodeJS.Timeout>();

  const updateMarkers = useCallback(
    (centers: Center[]) => {
      // Clear existing markers from DOM
      const existingMarkers = document.querySelectorAll(`.${styles.marker}`);
      existingMarkers.forEach((marker) => marker.remove());

      centers.forEach((center) => {
        if (!center.latitude || !center.longitude) return;

        // Create the marker container div
        const markerElement = document.createElement("div");
        markerElement.className = `${styles.marker}`;
        markerElement.setAttribute("data-center-id", center.id);

        // Create the image element
        const markerImage = document.createElement("img");
        markerImage.src =
          activePin === center.id
            ? "/images/map/active-pin.svg"
            : "/images/map/base-pin.svg";
        markerImage.alt = "Location Marker";
        markerImage.className = styles.image;

        markerElement.appendChild(markerImage);

        // Position the marker based on coordinates
        const position = mapRef.current!.project([
          Number(center.longitude),
          Number(center.latitude),
        ]);

        markerElement.style.left = `${position.x}px`;
        markerElement.style.top = `${position.y}px`;

        // Apply hover state based on hoveredItem
        if (hoveredItem === center.id && activePin !== center.id) {
          markerElement.classList.add(styles.hoveredMarker);
        }

        // Add mouseenter and mouseleave event listeners
        markerElement.addEventListener("mouseenter", (e) => {
          const currentTarget = e.currentTarget as HTMLDivElement;
          const centerId = currentTarget.getAttribute("data-center-id");

          if (centerId && activePin !== centerId) {
            currentTarget.classList.add(styles.hoveredMarker);
            dispatch(setHoveredCenter(centerId));
          }
        });

        markerElement.addEventListener("mouseleave", (e) => {
          const currentTarget = e.currentTarget as HTMLDivElement;
          const centerId = currentTarget.getAttribute("data-center-id");

          if (centerId && activePin !== centerId) {
            currentTarget.classList.remove(styles.hoveredMarker);
            dispatch(setHoveredCenter(null));
          }
        });

        // Add click handler
        markerElement.addEventListener("click", (e) => {
          e.stopPropagation();
          dispatch(setActivePin(center.id));

          // Calculate card position based on center's coordinates
          const positionAfterMove = mapRef.current!.project([
            Number(center.longitude),
            Number(center.latitude),
          ]);

          // Position card right next to the marker
          const isTopHalf =
            positionAfterMove.y < mapContainer.current!.clientHeight / 2;
          const cardOffsetY = isTopHalf ? 10 : -380;

          setCardPosition({
            top: positionAfterMove.y + cardOffsetY,
            left: positionAfterMove.x - 175,
          });

          setCardContent(center);
        });

        // Add marker to the map container
        mapContainer.current?.appendChild(markerElement);

        // Update marker position and scale on map move/zoom
        mapRef.current?.on("move", () => {
          const newPosition = mapRef.current!.project([
            Number(center.longitude),
            Number(center.latitude),
          ]);
          markerElement.style.left = `${newPosition.x}px`;
          markerElement.style.top = `${newPosition.y}px`;

          // Update hover state during map movement
          if (hoveredItem === center.id && activePin !== center.id) {
            markerElement.classList.add(styles.hoveredMarker);
          } else {
            markerElement.classList.remove(styles.hoveredMarker);
          }

          // If a pin is active, update its card position as the map moves
          if (activePin === center.id) {
            const updatedPosition = mapRef.current!.project([
              Number(center.longitude),
              Number(center.latitude),
            ]);

            const isTopHalf =
              updatedPosition.y < mapContainer.current!.clientHeight / 2;
            const cardOffsetY = isTopHalf ? 10 : -380;

            setCardPosition({
              top: updatedPosition.y + cardOffsetY,
              left: updatedPosition.x - 175,
            });
          }
        });
      });
    },
    [dispatch, activePin, hoveredItem]
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !userLocation) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/samisbord/cm3h9lzqc002h01sq4zx18vbq",
      attributionControl: false,
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 10,
      projection: "mercator",
    });

    mapRef.current = map;

    // Function to deactivate pin
    const deactivatePin = () => {
      dispatch(setActivePin(null));
      setCardPosition(null);
      setCardContent(null);
    };

    map.on("load", () => {
      // Create user location marker
      const userMarkerElement = document.createElement("div");
      userMarkerElement.className = styles.userLocationMarker;

      const userMarkerImage = document.createElement("img");
      userMarkerImage.src = "/images/map/user-location.svg";
      userMarkerImage.alt = "User Location";
      userMarkerImage.className = styles.userLocationImage;

      userMarkerElement.appendChild(userMarkerImage);

      // Position marker
      const position = mapRef.current!.project([
        userLocation.longitude,
        userLocation.latitude,
      ]);

      userMarkerElement.style.left = `${position.x}px`;
      userMarkerElement.style.top = `${position.y}px`;
      userMarkerElement.style.transform = `translate(-50%, -50%)`;

      // Add to map container
      mapContainer.current?.appendChild(userMarkerElement);

      // Update position on map move
      mapRef.current?.on("move", () => {
        const newPosition = mapRef.current!.project([
          userLocation.longitude,
          userLocation.latitude,
        ]);
        userMarkerElement.style.left = `${newPosition.x}px`;
        userMarkerElement.style.top = `${newPosition.y}px`;
      });

      // Add event listeners to deactivate pin on map interaction
      map.on("click", deactivatePin);
      map.on("drag", deactivatePin);
      map.on("zoom", deactivatePin);
      map.on("rotate", deactivatePin);

      // Handle map movement with bounds comparison
      map.on("moveend", () => {
        if (!onBoundsChange) return;

        const currentBounds = map.getBounds();
        if (!currentBounds) return;

        const newBounds = {
          north: currentBounds.getNorth(),
          south: currentBounds.getSouth(),
          east: currentBounds.getEast(),
          west: currentBounds.getWest(),
        };

        dispatch(setMapBounds(newBounds));
        onBoundsChange(newBounds);
      });

      updateMarkers(centers);
    });

    return () => {
      if (boundsChangeTimeoutRef.current) {
        clearTimeout(boundsChangeTimeoutRef.current);
      }
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [userLocation, dispatch]);

  // Update markers when centers, activePin, or hoveredItem changes
  useEffect(() => {
    if (mapRef.current && !isLoading) {
      updateMarkers(centers);
    }
  }, [centers, activePin, hoveredItem, updateMarkers]);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleGeolocate = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 12,
        speed: 0.5,
        curve: 1,
      });
    }
  };

  return (
    <div className={styles.map}>
      <div ref={mapContainer} className={styles.mapContainer} />
      {activePin && cardPosition && cardContent && (
        <div
          className={styles.cardWrapper}
          style={{
            position: "absolute",
            top: `${cardPosition.top}px`,
            left: `${cardPosition.left}px`,
            zIndex: 10,
          }}
        >
          <MapCard
            centerName={cardContent.name}
            centerAddress={cardContent.address ?? null}
            centerSports={cardContent.sports?.map((sport) => sport.name) || []}
            centerImage={cardContent.images}
          />
        </div>
      )}

      <div className={styles.customControls}>
        <motion.button
          onClick={handleGeolocate}
          className={styles.controlButton}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Gps size={24} variant="Bold" />
        </motion.button>

        <motion.button
          onClick={handleZoomIn}
          className={styles.controlButton}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Add size={24} />
        </motion.button>

        <motion.button
          onClick={handleZoomOut}
          className={styles.controlButton}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Minus size={24} />
        </motion.button>
      </div>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.loadingWrapper}
        >
          <LoadingIndicator />
        </motion.div>
      )}
    </div>
  );
};

export default SearchMap;
