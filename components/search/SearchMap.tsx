"use client";

import React, {
  useRef,
  useCallback,
  useMemo,
  useEffect,
  useState,
} from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks"; // Add useAppSelector
import { debounce } from "lodash";
import type { Center } from "@/types";
import { useMap } from "@/hooks/useMap";
import { resetActiveStates } from "@/store/redux/features/searchSlice";
import { setMapView } from "@/store/redux/features/searchSlice";
import { executeSearch } from "@/store/redux/features/searchThunk";
import { convertMapboxBoundsToBounds } from "@/lib/api";
import MapMarkers from "./map/MapMarkers";
import UserLocationMarker from "./map/UserLocation";
import MapControls from "./map/MapControls";
import Loading from "../ui/Loading";
import styles from "./SearchMap.module.css";
import mapboxgl from "mapbox-gl";

interface SearchMapProps {
  centers: Center[];
  userLocation: { latitude: number; longitude: number } | null;
  isLoading?: boolean;
  initialCenter?: [number, number];
  initialDistance?: number;
}

export default function SearchMap({
  centers,
  userLocation,
  isLoading = false,
  initialCenter,
  initialDistance,
}: SearchMapProps) {
  const dispatch = useAppDispatch();
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);

  // Get mapView from Redux store
  const mapView = useAppSelector((state) => state.search.mapView);

  console.log("Centers passed to SearchMap:", centers);
  console.log("Map view being used:", mapView);

  // Calculate initial zoom from distance
  const initialZoom = useMemo(
    () => (initialDistance ? 13 - Math.log2(initialDistance / 5) : undefined),
    [initialDistance]
  );

  // Log centers data for debugging
  useEffect(() => {
    console.log("Centers data in SearchMap:", centers);
  }, [centers]);

  // Initialize map with user location - uses our single registry
  const mapRef = useMap({
    container: mapContainer.current,
    userLocation: userLocation || { latitude: 51.5074, longitude: -0.1278 },
    initialCenter,
    initialZoom,
    onLoad: (map) => {
      map.on("dragend", () => {
        dispatch(resetActiveStates());
      });

      // Set map ready flag when loaded
      setMapReady(true);

      // Always trigger initial search when map loads
      if (map.loaded()) {
        const bounds = map.getBounds();
        if (bounds) {
          const boundsObj = convertMapboxBoundsToBounds(bounds);
          console.log("Initial bounds:", boundsObj);
          handleBoundsChange(boundsObj);
        }
      }
    },
  });

  // Handle bounds change and search
  const handleBoundsChange = useCallback(
    (bounds: any) => {
      // Validate bounds before processing
      if (
        !bounds ||
        !bounds.center ||
        typeof bounds.center.latitude === "undefined"
      ) {
        console.error("Invalid bounds object:", bounds);
        return;
      }

      // Update map view in Redux store with full bounds information
      dispatch(
        setMapView({
          center: {
            latitude: bounds.center.latitude,
            longitude: bounds.center.longitude,
          },
          distance: bounds.distance,
          north: bounds.north,
          south: bounds.south,
          east: bounds.east,
          west: bounds.west,
        })
      );

      // Trigger search
      dispatch(executeSearch());
    },
    [dispatch]
  );

  // Debounced bounds change
  const debouncedBoundsChange = useMemo(() => {
    return debounce(handleBoundsChange, 300);
  }, [handleBoundsChange]);

  // Handler for map click to reset active states
  const handleMapClick = useCallback(
    (e: React.MouseEvent) => {
      // Check if we clicked on a marker or card
      if (
        (e.target as HTMLElement).closest(`.${styles.marker}`) ||
        (e.target as HTMLElement).closest(`.${styles.cardWrapper}`)
      ) {
        return;
      }
      dispatch(resetActiveStates());
    },
    [dispatch]
  );

  // Map control functions
  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      const newZoom = mapRef.current.getZoom() + 1;
      mapRef.current.zoomTo(newZoom, { duration: 300 });
    }
  }, [mapRef]);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      const newZoom = mapRef.current.getZoom() - 1;
      mapRef.current.zoomTo(newZoom, { duration: 300 });
    }
  }, [mapRef]);

  const handleGeolocate = useCallback(() => {
    if (mapRef.current && userLocation) {
      // Clear active states when changing location
      dispatch(resetActiveStates());

      mapRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 12,
        speed: 0.5,
        curve: 1,
      });
    }
  }, [mapRef, userLocation, dispatch]);

  // Set up map move event handler
  useEffect(() => {
    if (!mapRef.current) return;

    const handleMoveEnd = () => {
      if (mapRef.current) {
        const bounds = mapRef.current.getBounds();
        if (bounds) {
          const boundsObj = convertMapboxBoundsToBounds(bounds);
          console.log("Map moved, new bounds:", boundsObj);
          debouncedBoundsChange(boundsObj);
        }
      }
    };

    mapRef.current.on("moveend", handleMoveEnd);

    return () => {
      if (mapRef.current) {
        mapRef.current.off("moveend", handleMoveEnd);
      }
      // Cancel any pending debounced calls
      debouncedBoundsChange.cancel();
    };
  }, [mapRef, debouncedBoundsChange]);

  // Force map refresh when centers change
  useEffect(() => {
    if (mapRef.current && mapReady && centers.length > 0) {
      // Force map refresh to ensure markers are displayed
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      }, 100);
    }
  }, [centers, mapReady]);

  return (
    <div className={styles.map}>
      <div
        ref={mapContainer}
        className={styles.mapContainer}
        onClick={handleMapClick}
      >
        {mapReady && (
          <>
            <MapMarkers
              centers={centers}
              mapRef={mapRef}
              mapContainer={mapContainer}
            />

            <UserLocationMarker mapRef={mapRef} />

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
