// components/search/SearchMap.tsx
<<<<<<< HEAD
import React, { useRef, useCallback, useMemo, memo, useEffect } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Center } from "@/types";
import OptimizedMapMarkers from "./map/MapMarkers";
=======
"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Center } from "@/types/entities";
import type { MapBounds, MapView } from "@/types/map";
import MapMarkers from "./map/MapMarkers";
>>>>>>> test-map
import UserLocationMarker from "./map/UserLocation";
import styles from "./SearchMap.module.css";
<<<<<<< HEAD
import mapboxgl from "mapbox-gl";
import { convertMapboxBoundsToBounds } from "@/lib/api";

// Ensure access token is set
=======

// Set Mapbox token
>>>>>>> test-map
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface SearchMapProps {
  centers: Center[];
  userLocation: { latitude: number; longitude: number } | null;
  onBoundsChange?: (mapView: MapView & MapBounds) => void;
  initialCenter?: [number, number];
  initialDistance?: number;
<<<<<<< HEAD
  onBoundsChange?: (bounds: any) => void;
=======
  activePin?: string | null;
>>>>>>> test-map
  onMarkerClick?: (id: string) => void;
  onMapClick?: () => void;
}

<<<<<<< HEAD
const SearchMap = memo(
  ({
    centers,
    userLocation,
    isLoading = false,
    initialCenter,
    initialDistance,
    onBoundsChange,
    onMarkerClick,
    onMapClick,
  }: SearchMapProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const isInitializedRef = useRef(false);

    // Check if userLocation is different from the default location
    const isUserLocationSet = useMemo(
      () =>
        userLocation &&
        (userLocation.latitude !== 51.5074 ||
          userLocation.longitude !== -0.1278),
      [userLocation]
    );

    // Calculate initial zoom from distance
    const initialZoom = useMemo(
      () => (initialDistance ? 13 - Math.log2(initialDistance / 5) : 13),
      [initialDistance]
    );

    // Initialize map
    useEffect(() => {
      if (!mapContainer.current || mapRef.current || isInitializedRef.current)
        return;

      isInitializedRef.current = true;

      const defaultLocation = { latitude: 51.5074, longitude: -0.1278 };
      const location = userLocation || defaultLocation;

      const startCenter = initialCenter
        ? [initialCenter[1], initialCenter[0]]
        : [location.longitude, location.latitude];

      try {
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/light-v11",
          attributionControl: false,
          center: startCenter as [number, number],
          zoom: initialZoom,
          projection: "mercator",
          preserveDrawingBuffer: true,
        });

        mapRef.current = map;

        map.on("load", () => {
          // Force resize to ensure proper rendering
          map.resize();

          // Trigger initial bounds change
          if (onBoundsChange) {
            const bounds = map.getBounds();
            const boundsObj = convertMapboxBoundsToBounds(bounds);
            onBoundsChange(boundsObj);
          }
        });

        // Map movement events
        map.on("moveend", () => {
          if (onBoundsChange && mapRef.current) {
            const bounds = mapRef.current.getBounds();
            const boundsObj = convertMapboxBoundsToBounds(bounds);
            onBoundsChange(boundsObj);
          }
        });

        map.on("zoomend", () => {
          if (onBoundsChange && mapRef.current) {
            const bounds = mapRef.current.getBounds();
            const boundsObj = convertMapboxBoundsToBounds(bounds);
            onBoundsChange(boundsObj);
          }
        });

        return () => {
          if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
          }
        };
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }, [
      mapContainer,
      initialCenter,
      initialDistance,
      initialZoom,
      userLocation,
      onBoundsChange,
    ]);

    // Force map resize when centers change
    useEffect(() => {
      if (mapRef.current && centers.length > 0) {
        // Use timeout to ensure resize happens after render
        const timer = setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.resize();
          }
        }, 100);

        return () => clearTimeout(timer);
      }
    }, [centers.length]);

    // Map controls
    const handleZoomIn = useCallback(() => {
      if (mapRef.current) {
        const newZoom = mapRef.current.getZoom() + 1;
        mapRef.current.zoomTo(newZoom, { duration: 300 });
      }
    }, []);

    const handleZoomOut = useCallback(() => {
      if (mapRef.current) {
        const newZoom = mapRef.current.getZoom() - 1;
        mapRef.current.zoomTo(newZoom, { duration: 300 });
      }
    }, []);

    const handleGeolocate = useCallback(() => {
      if (mapRef.current && userLocation) {
        mapRef.current.flyTo({
          center: [userLocation.longitude, userLocation.latitude],
          zoom: 12,
          speed: 1.2,
          curve: 1.42,
        });
      }
    }, [userLocation]);

    return (
      <div className={styles.map}>
        <div
          ref={mapContainer}
          className={styles.mapContainer}
          onClick={onMapClick}
        >
          {mapRef.current && (
            <>
              <OptimizedMapMarkers
                centers={centers}
                mapRef={mapRef}
                onMarkerClick={onMarkerClick}
              />

              {isUserLocationSet && <UserLocationMarker mapRef={mapRef} />}

              <MapControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onGeolocate={handleGeolocate}
              />
            </>
          )}

          {isLoading && (
            <div className={styles.loadingWrapper}>
              <Loading />
            </div>
          )}
        </div>
      </div>
    );
  }
);

SearchMap.displayName = "SearchMap";

export default SearchMap;
=======
const SearchMap: React.FC<SearchMapProps> = ({
  centers,
  userLocation,
  onBoundsChange,
  initialCenter,
  initialDistance,
  activePin,
  onMarkerClick,
  onMapClick,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const isUserInteractionRef = useRef(false);
  const boundsChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate initial zoom from distance
  const initialZoom = initialDistance
    ? 13 - Math.log2(initialDistance / 5)
    : 13;

  // Handle map bounds change - using manual debounce with setTimeout for more control
  const handleBoundsChange = useCallback(() => {
    if (!map.current || !onBoundsChange || !isMapReady) return;

    // Clear any existing timeout
    if (boundsChangeTimeoutRef.current) {
      clearTimeout(boundsChangeTimeoutRef.current);
    }

    // Set a timeout to debounce the bounds change event
    boundsChangeTimeoutRef.current = setTimeout(() => {
      if (!map.current) return;

      const bounds = map.current.getBounds();
      const center = map.current.getCenter();
      const zoom = map.current.getZoom();

      // Calculate distance in km from zoom level
      const distance = 5 * Math.pow(2, 13 - zoom);

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

      console.log(
        "Map bounds changed, updating URL:",
        isUserInteractionRef.current
      );
      onBoundsChange(mapView);

      // Reset the user interaction flag
      isUserInteractionRef.current = false;
    }, 200);
  }, [onBoundsChange, isMapReady]);

  // Initialize map when component mounts
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
        attributionControl: false,
        renderWorldCopies: false,
        minZoom: 5,
        maxPitch: 0,
        pitchWithRotate: false,
        dragRotate: false,
      });

      const mapInstance = map.current;

      // Track user interactions
      const handleUserInteractionStart = () => {
        isUserInteractionRef.current = true;
      };

      // Handle map load
      mapInstance.on("load", () => {
        console.log("Map loaded successfully");

        // Force map resize after load to fix rendering issues
        mapInstance.resize();

        // Initial bounds change
        setIsMapReady(true);

        // Initial bounds change won't be from user interaction
        isUserInteractionRef.current = false;
        handleBoundsChange();
      });

      // Add navigation controls
      const nav = new mapboxgl.NavigationControl({
        showCompass: false,
        visualizePitch: false,
      });
      mapInstance.addControl(nav, "bottom-right");

      // Add event listeners for user interactions
      mapInstance.on("dragstart", handleUserInteractionStart);
      mapInstance.on("zoomstart", handleUserInteractionStart);

      // Add event listeners for bounds changes
      mapInstance.on("moveend", handleBoundsChange);
      mapInstance.on("zoomend", handleBoundsChange);

      // Map click handler
      mapInstance.on("click", (e) => {
        // Only trigger onMapClick if the click was on the map itself, not a marker
        const features = mapInstance.queryRenderedFeatures(e.point);
        const clickedOnMarker = features.some(
          (f) =>
            f.layer?.id === "markers-layer" || f.properties?.type === "marker"
        );

        if (!clickedOnMarker && onMapClick) {
          onMapClick();
        }
      });

      return () => {
        // Clean up on unmount
        if (boundsChangeTimeoutRef.current) {
          clearTimeout(boundsChangeTimeoutRef.current);
        }

        if (mapInstance) {
          mapInstance.off("dragstart", handleUserInteractionStart);
          mapInstance.off("zoomstart", handleUserInteractionStart);
          mapInstance.off("moveend", handleBoundsChange);
          mapInstance.off("zoomend", handleBoundsChange);

          // Remove map
          mapInstance.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }, []);

  // Effect for when centers or activePin changes - avoid dependency on initialCenter/initialZoom
  useEffect(() => {
    // Only run if map is ready and active pin exists
    if (!map.current || !isMapReady || !activePin) return;

    // Find the active center
    const activeCenter = centers.find((c) => c.id === activePin);

    // Fly to active center if it exists and has coordinates
    if (activeCenter && activeCenter.latitude && activeCenter.longitude) {
      // This is NOT a user interaction
      isUserInteractionRef.current = false;

      // Fly to the center
      map.current.flyTo({
        center: [Number(activeCenter.longitude), Number(activeCenter.latitude)],
        zoom: map.current.getZoom(),
        speed: 0.8,
        curve: 1.42,
      });
    }
  }, [activePin, centers, isMapReady]);

  // Return the map container with markers
  return (
    <div className={styles.mapContainer}>
      <div ref={mapContainer} className={styles.map} />

      {isMapReady && map.current && (
        <>
          <MapMarkers centers={centers} mapRef={map} />
          <UserLocationMarker mapRef={map} userLocation={userLocation} />
        </>
      )}
    </div>
  );
};

export default React.memo(SearchMap);
>>>>>>> test-map
