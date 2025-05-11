// hooks/useMapWithSearch.ts
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAppDispatch } from "@/store/hooks";
import { debounce } from "lodash";
import mapboxgl from "mapbox-gl";
import {
  setMapView,
  resetActiveStates,
} from "@/store/redux/features/searchSlice";
import { executeSearch } from "@/store/redux/features/searchThunk";
import { convertMapboxBoundsToBounds } from "@/lib/api";
import type { MapView, Center } from "@/types";

// Ensure access token is set
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface UseMapWithSearchProps {
  containerId: string;
  userLocation: { latitude: number; longitude: number } | null;
  initialCenter?: [number, number];
  initialDistance?: number;
  onViewChange?: (view: MapView) => void;
}

export function useMapWithSearch({
  containerId,
  userLocation,
  initialCenter,
  initialDistance,
  onViewChange,
}: UseMapWithSearchProps) {
  const dispatch = useAppDispatch();
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const activeMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapView, setLocalMapView] = useState<MapView | null>(null);
  const [visibleCenters, setVisibleCenters] = useState<Center[]>([]);
  const [allCenters, setAllCenters] = useState<Center[]>([]);

  // Update visible centers based on map bounds
  const updateVisibleCenters = useCallback(() => {
    if (!mapRef.current || !allCenters.length) return;

    const bounds = mapRef.current.getBounds();
    const filtered = allCenters.filter((center) => {
      if (!center.latitude || !center.longitude) return false;
      const lng = Number(center.longitude);
      const lat = Number(center.latitude);
      return bounds.contains([lng, lat]);
    });

    setVisibleCenters(filtered);
  }, [allCenters]);

  // Debounced map view update to prevent excessive searches
  const updateMapView = useCallback(
    debounce(() => {
      if (!mapRef.current || !isMapReady) return;

      const bounds = mapRef.current.getBounds();
      const boundsObj = convertMapboxBoundsToBounds(bounds);

      const newMapView = {
        center: {
          latitude: boundsObj.center.latitude,
          longitude: boundsObj.center.longitude,
        },
        distance: boundsObj.distance,
        north: boundsObj.north,
        south: boundsObj.south,
        east: boundsObj.east,
        west: boundsObj.west,
      };

      setLocalMapView(newMapView);
      dispatch(setMapView(newMapView));

      // Update visible centers
      updateVisibleCenters();

      // Trigger search with the new bounds
      setIsLoading(true);
      dispatch(executeSearch()).finally(() => {
        setIsLoading(false);
      });

      if (onViewChange) {
        onViewChange(newMapView);
      }
    }, 300),
    [isMapReady, dispatch, onViewChange, updateVisibleCenters]
  );

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) {
      containerRef.current = document.getElementById(
        containerId
      ) as HTMLDivElement;
    }

    if (!containerRef.current || mapRef.current) return;

    const defaultLocation = { latitude: 51.5074, longitude: -0.1278 };
    const initialUserLocation = userLocation || defaultLocation;
    const startCenter = initialCenter
      ? [initialCenter[1], initialCenter[0]]
      : [initialUserLocation.longitude, initialUserLocation.latitude];

    const startZoom = initialDistance
      ? 13 - Math.log2(initialDistance / 5)
      : 13;

    try {
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        attributionControl: false,
        center: startCenter as [number, number],
        zoom: startZoom,
        projection: "mercator",
        preserveDrawingBuffer: true,
      });

      mapRef.current = map;

      map.on("load", () => {
        setIsMapReady(true);

        // Get initial bounds and update map view
        const bounds = map.getBounds();
        const boundsObj = convertMapboxBoundsToBounds(bounds);

        const initialMapView = {
          center: {
            latitude: boundsObj.center.latitude,
            longitude: boundsObj.center.longitude,
          },
          distance: boundsObj.distance,
          north: boundsObj.north,
          south: boundsObj.south,
          east: boundsObj.east,
          west: boundsObj.west,
        };

        setLocalMapView(initialMapView);
        dispatch(setMapView(initialMapView));

        // Initial search with the map bounds
        setIsLoading(true);
        dispatch(executeSearch({ forceUpdate: true })).finally(() => {
          setIsLoading(false);
        });
      });

      // Map interaction handlers
      map.on("dragend", () => {
        dispatch(resetActiveStates());
        updateMapView();
      });

      map.on("zoomend", () => {
        updateMapView();
      });

      return () => {
        // Clean up markers
        markersRef.current.forEach((marker) => marker.remove());
        if (activeMarkerRef.current) {
          activeMarkerRef.current.remove();
        }

        // Remove map
        map.remove();
        mapRef.current = null;
      };
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }, [
    containerId,
    initialCenter,
    initialDistance,
    userLocation,
    dispatch,
    updateMapView,
  ]);

  // Update centers when Redux state changes
  useEffect(() => {
    if (allCenters.length > 0) {
      updateVisibleCenters();
    }
  }, [allCenters, updateVisibleCenters]);

  // Map controls
  const mapControls = useMemo(
    () => ({
      zoomIn: () => {
        if (mapRef.current) {
          mapRef.current.zoomIn({ duration: 300 });
        }
      },
      zoomOut: () => {
        if (mapRef.current) {
          mapRef.current.zoomOut({ duration: 300 });
        }
      },
      geolocate: () => {
        if (mapRef.current && userLocation) {
          dispatch(resetActiveStates());
          mapRef.current.flyTo({
            center: [userLocation.longitude, userLocation.latitude],
            zoom: 13,
            speed: 1.2,
            curve: 1.42,
          });
        }
      },
      flyTo: (center: [number, number], zoom?: number) => {
        if (mapRef.current) {
          mapRef.current.flyTo({
            center,
            zoom: zoom || mapRef.current.getZoom(),
            speed: 1.2,
          });
        }
      },
    }),
    [userLocation, dispatch]
  );

  // Set active center and fly to it
  const setActiveCenter = useCallback(
    (centerId: string | null) => {
      const center = allCenters.find((c) => c.id === centerId);

      if (center && center.latitude && center.longitude && mapRef.current) {
        mapControls.flyTo([Number(center.longitude), Number(center.latitude)]);
      }
    },
    [allCenters, mapControls]
  );

  return {
    mapRef,
    isMapReady,
    isLoading,
    mapView,
    visibleCenters,
    allCenters,
    setAllCenters,
    updateMapView,
    setActiveCenter,
    mapControls,
    updateVisibleCenters,
  };
}
