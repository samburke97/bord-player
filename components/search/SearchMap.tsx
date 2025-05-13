// components/search/SearchMap.tsx (with fixed dependencies)
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
  userLocation: { latitude: number; longitude: number } | null;
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
  activePin,
  onMarkerClick,
  onMapClick,
  isLoading, // Added this prop to the destructuring
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const handleBoundsChangeRef = useRef(onBoundsChange); // Use ref to avoid dependencies

  // Track when the map is being moved by the user
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
    const center = map.current.getCenter();
    const zoom = map.current.getZoom();

    // Calculate distance in km from zoom level
    const distance = 5 * Math.pow(2, 13 - zoom);

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
  }, [isMapReady]); // Only depends on isMapReady, not on props

  // Initialize map when component mounts - ONLY ONCE
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const defaultLocation = { latitude: -27.4698, longitude: 153.0251 }; // Brisbane
    const startLocation = userLocation || defaultLocation;

    const startCenter = initialCenter
      ? [initialCenter[1], initialCenter[0]]
      : [startLocation.longitude, startLocation.latitude];

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
      mapInstance.on("load", () => {
        console.log("Map loaded successfully");
        mapInstance.resize();
        setIsMapReady(true);

        // Trigger initial bounds update after map is loaded
        setTimeout(() => {
          if (mapInstance && handleBoundsChangeRef.current) {
            const bounds = mapInstance.getBounds();
            const center = mapInstance.getCenter();
            const zoom = mapInstance.getZoom();
            const distance = 5 * Math.pow(2, 13 - zoom);

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
      });

      // Track when user starts dragging or zooming
      mapInstance.on("dragstart", () => {
        userMovingMapRef.current = true;
      });

      mapInstance.on("zoomstart", () => {
        userMovingMapRef.current = true;
      });

      // Handle move end - this fires after drag, zoom, or programmatic movement
      mapInstance.on("moveend", () => {
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
      });

      // Also handle zoom end separately
      mapInstance.on("zoomend", () => {
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
      });

      // Map click handler
      mapInstance.on("click", (e) => {
        if (onMapClick) {
          onMapClick();
        }
      });

      return () => {
        // Clean up
        if (moveEndTimeoutRef.current) {
          clearTimeout(moveEndTimeoutRef.current);
        }

        if (mapInstance) {
          mapInstance.off("dragstart");
          mapInstance.off("zoomstart");
          mapInstance.off("moveend");
          mapInstance.off("zoomend");
          mapInstance.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }, [handleBoundsChange]);

  useEffect(() => {
    if (map.current && isMapReady) {
      // Force a resize after a tiny delay to ensure DOM updates
      setTimeout(() => {
        map.current?.resize();
      }, 100);
    }
  }, [isFullscreen, isMapReady]);

  // Effect for active pin
  useEffect(() => {
    if (!map.current || !isMapReady || !activePin) return;

    const activeCenter = centers.find((c) => c.id === activePin);

    if (activeCenter && activeCenter.latitude && activeCenter.longitude) {
      // This is a programmatic move, not user-initiated
      userMovingMapRef.current = false;

      map.current.flyTo({
        center: [Number(activeCenter.longitude), Number(activeCenter.latitude)],
        zoom: map.current.getZoom(),
        speed: 0.8,
        curve: 1.42,
      });
    }
  }, [activePin, centers, isMapReady]);

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
    if (map.current && userLocation) {
      userMovingMapRef.current = false;
      map.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 14,
        speed: 1.2,
      });
    }
  }, [userLocation]);

  return (
    <div className={styles.mapContainer}>
      <div ref={mapContainer} className={styles.map} />
      {isMapReady && map.current && (
        <>
          <MapMarkers centers={centers} mapRef={map} />
          <UserLocationMarker mapRef={map} userLocation={userLocation} />
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onGeolocate={handleGeolocate}
          />
          <LoadingIndicator isLoading={isLoading} />
        </>
      )}
    </div>
  );
};

export default React.memo(SearchMap);
