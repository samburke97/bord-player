// components/search/SearchMap.tsx
"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Center } from "@/types/entities";
import type { MapBounds, MapView } from "@/types/map";
import MapMarkers from "./map/MapMarkers";
import UserLocationMarker from "./map/UserLocation";
import MapControls from "./map/MapControls";
import LoadingIndicator from "./LoadingIndicator";
import styles from "./SearchMap.module.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface SearchMapProps {
  centers: Center[];
  userLocation: {
    latitude: number;
    longitude: number;
    isPrecise?: boolean;
  } | null;
  onBoundsChange?: (mapView: MapView & MapBounds) => void;
  initialCenter?: [number, number];
  initialDistance?: number;
  activePin?: string | null;
  onMarkerClick?: (id: string) => void;
  onMapClick?: () => void;
  isLoading?: boolean;
}

const SearchMap: React.FC<SearchMapProps> = ({
  centers,
  userLocation,
  onBoundsChange,
  initialCenter,
  initialDistance,
  activePin = null,
  onMarkerClick,
  onMapClick,
  isLoading = false,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentDistance, setCurrentDistance] = useState<number>(
    initialDistance || 5
  );
  const handleBoundsChangeRef = useRef(onBoundsChange);
  const userMovingMapRef = useRef(false);
  const moveEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate initial zoom from distance
  const initialZoom = initialDistance
    ? 13 - Math.log2(initialDistance / 5)
    : 13;

  // Update refs when props change
  useEffect(() => {
    handleBoundsChangeRef.current = onBoundsChange;
  }, [onBoundsChange]);

  // This function will be called when the map bounds change
  const handleBoundsChange = useCallback(() => {
    if (!map.current || !handleBoundsChangeRef.current || !isMapReady) return;

    // Get current map state
    const bounds = map.current.getBounds();
    if (!bounds) return;

    const center = map.current.getCenter();
    const zoom = map.current.getZoom();

    // Calculate distance in km from zoom level
    const distance = 5 * Math.pow(2, 13 - zoom);
    setCurrentDistance(distance);

    // Prepare the map view object to pass to the callback
    const mapView: MapView & MapBounds = {
      center: {
        latitude: center.lat,
        longitude: center.lng,
      },
      distance,
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    };

    // Call the callback with the new map view
    console.log("Map bounds changed, updating state:", mapView);
    handleBoundsChangeRef.current(mapView);
  }, [isMapReady]);

  // Initialize map when component mounts - ONLY ONCE
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Use the initialCenter, or userLocation, with no hard default
    const startCenter = initialCenter
      ? [initialCenter[1], initialCenter[0]]
      : userLocation
      ? [userLocation.longitude, userLocation.latitude]
      : [0, 0]; // Default world view - will be updated once we have location

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        projection: "mercator",
        center: startCenter as [number, number],
        zoom: initialZoom,
      });

      const mapInstance = map.current;

      // Handle map load
      const onLoad = () => {
        console.log("Map loaded successfully");
        mapInstance.resize();
        setIsMapReady(true);

        // Trigger initial bounds update after map is loaded
        setTimeout(() => {
          if (mapInstance && handleBoundsChangeRef.current) {
            const bounds = mapInstance.getBounds();
            if (!bounds) return;
            const center = mapInstance.getCenter();
            const zoom = mapInstance.getZoom();
            const distance = 5 * Math.pow(2, 13 - zoom);
            setCurrentDistance(distance);

            handleBoundsChangeRef.current({
              center: {
                latitude: center.lat,
                longitude: center.lng,
              },
              distance,
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest(),
            });
          }
        }, 500);
      };
      mapInstance.on("load", onLoad);

      // Track when user starts dragging or zooming
      const onDragStart = () => {
        userMovingMapRef.current = true;
      };
      const onZoomStart = () => {
        userMovingMapRef.current = true;
      };
      mapInstance.on("dragstart", onDragStart);
      mapInstance.on("zoomstart", onZoomStart);

      // Handle move end - this fires after drag, zoom, or programmatic movement
      const onMoveEnd = () => {
        // Clear any existing timeout
        if (moveEndTimeoutRef.current) {
          clearTimeout(moveEndTimeoutRef.current);
        }

        // Only trigger a bounds change if the user was moving the map (not if we're flying to a marker)
        if (userMovingMapRef.current) {
          // Set a small delay to avoid too many updates when panning
          moveEndTimeoutRef.current = setTimeout(() => {
            console.log("User finished moving map, updating bounds");
            handleBoundsChange();
            userMovingMapRef.current = false;
          }, 300);
        }
      };
      mapInstance.on("moveend", onMoveEnd);

      // Also handle zoom end separately
      const onZoomEnd = () => {
        // Clear any existing timeout
        if (moveEndTimeoutRef.current) {
          clearTimeout(moveEndTimeoutRef.current);
        }

        if (userMovingMapRef.current) {
          moveEndTimeoutRef.current = setTimeout(() => {
            console.log("User finished zooming map, updating bounds");
            handleBoundsChange();
            userMovingMapRef.current = false;
          }, 300);
        }
      };
      mapInstance.on("zoomend", onZoomEnd);

      // Map click handler
      const onMapClickHandler = (e: mapboxgl.MapMouseEvent) => {
        if (onMapClick) {
          onMapClick();
        }
      };
      mapInstance.on("click", onMapClickHandler);

      return () => {
        // Clean up
        if (moveEndTimeoutRef.current) {
          clearTimeout(moveEndTimeoutRef.current);
        }

        if (mapInstance) {
          mapInstance.off("load", onLoad);
          mapInstance.off("dragstart", onDragStart);
          mapInstance.off("zoomstart", onZoomStart);
          mapInstance.off("moveend", onMoveEnd);
          mapInstance.off("zoomend", onZoomEnd);
          mapInstance.off("click", onMapClickHandler);
          mapInstance.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }, [handleBoundsChange, userLocation]);

  // Update map center when userLocation changes and we don't have initialCenter
  useEffect(() => {
    if (map.current && userLocation && !initialCenter) {
      map.current.setCenter([userLocation.longitude, userLocation.latitude]);
    }
  }, [userLocation, initialCenter]);

  // Map control handlers
  const handleZoomIn = useCallback(() => {
    if (map.current) {
      userMovingMapRef.current = true;
      map.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (map.current) {
      userMovingMapRef.current = true;
      map.current.zoomOut();
    }
  }, []);

  const handleGeolocate = useCallback(() => {
    // Only fly to user location if we have precise location
    if (map.current && userLocation && userLocation.isPrecise) {
      userMovingMapRef.current = false;
      map.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 14,
        speed: 1.2,
      });
    }
  }, [userLocation]);

  // Create a wrapper function that handles the null case
  const handleMarkerClick = useCallback(
    (id: string | null) => {
      if (id && onMarkerClick) {
        onMarkerClick(id);
      }
    },
    [onMarkerClick]
  );

  return (
    <div className={styles.mapContainer}>
      <div ref={mapContainer} className={styles.map} />
      {isMapReady && map.current && (
        <>
          <MapMarkers
            centers={centers}
            mapRef={map}
            activePin={activePin}
            onMarkerClick={handleMarkerClick}
            distance={currentDistance}
          />
          {/* Only show UserLocationMarker if we have precise location */}
          {userLocation && userLocation.isPrecise && (
            <UserLocationMarker mapRef={map} userLocation={userLocation} />
          )}
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onGeolocate={userLocation?.isPrecise ? handleGeolocate : undefined}
          />
          <LoadingIndicator isLoading={isLoading} />
        </>
      )}
    </div>
  );
};

export default React.memo(SearchMap);
