// components/search/SearchMap.tsx
import React, { useRef, useCallback, useMemo, memo, useEffect } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Center } from "@/types";
import OptimizedMapMarkers from "./map/MapMarkers";
import UserLocationMarker from "./map/UserLocation";
import MapControls from "./map/MapControls";
import Loading from "../ui/Loading";
import styles from "./SearchMap.module.css";
import mapboxgl from "mapbox-gl";
import { convertMapboxBoundsToBounds } from "@/lib/api";

// Ensure access token is set
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface SearchMapProps {
  centers: Center[];
  userLocation: { latitude: number; longitude: number } | null;
  isLoading?: boolean;
  initialCenter?: [number, number];
  initialDistance?: number;
  onBoundsChange?: (bounds: any) => void;
  onMarkerClick?: (id: string) => void;
  onMapClick?: () => void;
}

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
