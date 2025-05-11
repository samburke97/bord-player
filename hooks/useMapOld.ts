// app/hooks/useMap.ts
import { useRef, useEffect, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { useDispatch } from "react-redux";
import { debounce } from "lodash";
import {
  setMapView,
  resetActiveStates,
} from "@/store/redux/features/searchSlice";
import type { Location } from "@/types";
import "mapbox-gl/dist/mapbox-gl.css";

// Ensure access token is set
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// Registry pattern to avoid duplicate map init
interface MapRegistry {
  map: mapboxgl.Map | null;
  isInitializing: boolean;
}
const mapRegistry = new WeakMap<HTMLDivElement, MapRegistry>();

interface UseMapProps {
  container: HTMLDivElement | null;
  userLocation: Location;
  onMapChange?: (center: [number, number], zoom: number) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
  onLoad?: (map: mapboxgl.Map) => void;
}

export function useMap({
  container,
  userLocation,
  onMapChange,
  initialCenter,
  initialZoom,
  onLoad,
}: UseMapProps) {
  const dispatch = useDispatch();
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const isInitialMoveRef = useRef(true);

  const calculateDistanceFromZoom = useCallback((zoom: number): number => {
    return 5 * Math.pow(2, 13 - zoom); // Approximate km
  }, []);

  const updateUrlAndTriggerSearch = useCallback(
    debounce((center: mapboxgl.LngLat, zoom: number) => {
      const distance = calculateDistanceFromZoom(zoom);

      dispatch(
        setMapView({
          center: { latitude: center.lat, longitude: center.lng },
          distance,
        })
      );

      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("center", `${center.lat},${center.lng}`);
      searchParams.set("distance", distance.toString());

      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
      window.history.replaceState(null, "", newUrl);

      if (onMapChange) {
        onMapChange([center.lat, center.lng], zoom);
      }
    }, 300),
    [dispatch, calculateDistanceFromZoom, onMapChange]
  );

  useEffect(() => {
    if (!container) return;

    if (
      !userLocation ||
      isNaN(userLocation.latitude) ||
      isNaN(userLocation.longitude)
    ) {
      console.error("Invalid user location:", userLocation);
      return;
    }

    let registry = mapRegistry.get(container);

    if (registry?.map) {
      mapRef.current = registry.map;
      if (initialCenter) {
        mapRef.current.setCenter([initialCenter[1], initialCenter[0]]);
        if (initialZoom) {
          mapRef.current.setZoom(initialZoom);
        }
      }
      return;
    }

    if (registry?.isInitializing) return;

    if (!registry) {
      registry = { map: null, isInitializing: true };
      mapRegistry.set(container, registry);
    } else {
      registry.isInitializing = true;
    }

    const startCenter = initialCenter
      ? [initialCenter[1], initialCenter[0]]
      : [userLocation.longitude, userLocation.latitude];

    if (isNaN(startCenter[0]) || isNaN(startCenter[1])) {
      console.error("Invalid start center coordinates:", startCenter);
      registry.isInitializing = false;
      return;
    }

    const startZoom = initialZoom || 13;

    try {
      const map = new mapboxgl.Map({
        container,
        style: "mapbox://styles/mapbox/light-v11",
        attributionControl: false,
        center: startCenter,
        zoom: startZoom,
        projection: "mercator",
        preserveDrawingBuffer: true,
      });

      mapRef.current = map;
      registry.map = map;

      map.on("load", () => {
        map.resize();

        const initialCenter = map.getCenter();

        dispatch(
          setMapView({
            center: {
              latitude: initialCenter.lat,
              longitude: initialCenter.lng,
            },
            distance: calculateDistanceFromZoom(map.getZoom()),
          })
        );

        if (onMapChange && isInitialMoveRef.current) {
          isInitialMoveRef.current = false;

          const searchParams = new URLSearchParams(window.location.search);
          if (!searchParams.has("center") || !searchParams.has("distance")) {
            updateUrlAndTriggerSearch(initialCenter, map.getZoom());
          } else {
            onMapChange([initialCenter.lat, initialCenter.lng], map.getZoom());
          }
        }

        if (onLoad) onLoad(map);

        map.on("dragend", () => {
          dispatch(resetActiveStates());
        });

        registry!.isInitializing = false;
      });

      map.on("moveend", () => {
        const center = map.getCenter();
        const zoom = map.getZoom();

        if (isInitialMoveRef.current) {
          isInitialMoveRef.current = false;
          return;
        }

        updateUrlAndTriggerSearch(center, zoom);
      });

      map.on("error", (e) => {
        console.error("Mapbox error:", e);
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      registry.isInitializing = false;
    }

    return () => {
      updateUrlAndTriggerSearch.cancel();
    };
  }, [container]);

  return mapRef;
}
