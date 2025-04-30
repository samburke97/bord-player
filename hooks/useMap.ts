// app/hooks/useMap.ts
import { useRef, useEffect, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { useDispatch } from "react-redux";
import { debounce } from "lodash";
import { setMapView, resetActiveStates } from "@/store/features/searchSlice";
import type { Location } from "@/types";
import styles from "@/components/search/SearchMap.module.css";
import "mapbox-gl/dist/mapbox-gl.css";

// Make sure this is properly set
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// Use a registry pattern to track map instances
interface MapRegistry {
  map: mapboxgl.Map | null;
  userMarker: HTMLDivElement | null;
  isInitializing: boolean;
}

// Global registry of containers to maps
const mapRegistry = new WeakMap<HTMLDivElement, MapRegistry>();

interface UseMapProps {
  container: HTMLDivElement | null;
  userLocation: Location;
  onMapChange?: (center: [number, number], zoom: number) => void;
  initialCenter?: [number, number]; // lat, lng
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

  // Helper functions
  const calculateDistanceFromZoom = useCallback((zoom: number): number => {
    // Approximate distance in km based on zoom level
    return 5 * Math.pow(2, 13 - zoom);
  }, []);

  // Create stable debounced URL updater
  const updateUrlAndTriggerSearch = useCallback(
    debounce((center: mapboxgl.LngLat, zoom: number) => {
      const distance = calculateDistanceFromZoom(zoom);

      // Update Redux state
      dispatch(
        setMapView({
          center: { latitude: center.lat, longitude: center.lng },
          distance: distance,
        })
      );

      // Update URL with new position
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("center", `${center.lat},${center.lng}`);
      searchParams.set("distance", distance.toString());

      // Build the new URL with updated parameters
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;

      // Update URL without navigation (preserves state)
      window.history.replaceState(null, "", newUrl);

      // Notify about map change
      if (onMapChange) {
        onMapChange([center.lat, center.lng], zoom);
      }
    }, 300),
    [dispatch, calculateDistanceFromZoom, onMapChange]
  );

  // Function to update user marker position
  const updateUserMarkerPosition = useCallback(() => {
    if (!container || !mapRef.current || !userLocation) return;

    // Get registry entry for this container
    const registry = mapRegistry.get(container);
    if (!registry || !registry.userMarker) return;

    try {
      const position = mapRef.current.project([
        userLocation.longitude,
        userLocation.latitude,
      ]);

      registry.userMarker.style.left = `${position.x}px`;
      registry.userMarker.style.top = `${position.y}px`;
      registry.userMarker.style.transform = `translate(-50%, -50%)`;
    } catch (error) {
      console.error("Error updating user marker position:", error);
    }
  }, [container, userLocation]);

  // Initialize map
  useEffect(() => {
    // Skip if no container
    if (!container) return;

    // Skip if user location is invalid
    if (
      !userLocation ||
      isNaN(userLocation.latitude) ||
      isNaN(userLocation.longitude)
    ) {
      console.error("Invalid user location:", userLocation);
      return;
    }

    // Check the registry for an existing map
    let registry = mapRegistry.get(container);

    // If we already have a map in this container, use it
    if (registry?.map) {
      mapRef.current = registry.map;

      // Update center if needed
      if (initialCenter) {
        try {
          mapRef.current.setCenter([initialCenter[1], initialCenter[0]]);
          if (initialZoom) {
            mapRef.current.setZoom(initialZoom);
          }
          updateUserMarkerPosition();
        } catch (error) {
          console.error("Error updating existing map:", error);
        }
      }
      return;
    }

    // If initialization is already in progress, skip
    if (registry?.isInitializing) {
      return;
    }

    // Mark this container as initializing
    if (!registry) {
      registry = { map: null, userMarker: null, isInitializing: true };
      mapRegistry.set(container, registry);
    } else {
      registry.isInitializing = true;
    }

    // Calculate initial center
    const startCenter = initialCenter
      ? [initialCenter[1], initialCenter[0]] // [lng, lat] format for Mapbox
      : [userLocation.longitude, userLocation.latitude];

    if (isNaN(startCenter[0]) || isNaN(startCenter[1])) {
      console.error("Invalid start center coordinates:", startCenter);
      console.log(
        "Deferring map initialization until valid coordinates available"
      );
      // Mark as not initializing to allow a retry when coordinates become available
      if (registry) {
        registry.isInitializing = false;
      }
      return;
    }

    const startZoom = initialZoom || 13;

    try {
      // Create new map
      const map = new mapboxgl.Map({
        container,
        style: "mapbox://styles/mapbox/light-v11",
        attributionControl: false,
        center: startCenter as [number, number],
        zoom: startZoom,
        projection: "mercator",
        preserveDrawingBuffer: true, // Helps with render consistency
      });

      // Store in ref and registry
      mapRef.current = map;
      registry.map = map;

      // Handle map load event
      map.on("load", () => {
        // Create user location marker
        const userMarkerElement = document.createElement("div");
        userMarkerElement.className = styles.userLocationMarker;
        registry!.userMarker = userMarkerElement;

        const userMarkerImage = document.createElement("img");
        userMarkerImage.src = "/images/map/user-location.svg";
        userMarkerImage.alt = "User Location";
        userMarkerImage.className = styles.userLocationImage;
        userMarkerImage.draggable = false;

        userMarkerElement.appendChild(userMarkerImage);
        container.appendChild(userMarkerElement);

        // Force a resize to ensure proper rendering
        map.resize();

        // Initial positioning of user marker
        updateUserMarkerPosition();

        // Initialize Redux state with map center
        const initialCenter = map.getCenter();

        // Set initial state in Redux without triggering a search
        dispatch(
          setMapView({
            center: {
              latitude: initialCenter.lat,
              longitude: initialCenter.lng,
            },
            distance: calculateDistanceFromZoom(map.getZoom()),
          })
        );

        // Only run initial change notification once
        if (onMapChange && isInitialMoveRef.current) {
          isInitialMoveRef.current = false;

          // If URL already has search parameters, don't update URL again
          const searchParams = new URLSearchParams(window.location.search);
          if (!searchParams.has("center") || !searchParams.has("distance")) {
            // First time loading - update URL only (parent will handle search)
            updateUrlAndTriggerSearch(initialCenter, map.getZoom());
          } else {
            // URL already has parameters, just notify parent (only once)
            onMapChange([initialCenter.lat, initialCenter.lng], map.getZoom());
          }
        }

        // Call the onLoad callback if provided
        if (onLoad) {
          onLoad(map);
        }

        // Add dragend event to reset active states
        map.on("dragend", () => {
          dispatch(resetActiveStates());
        });

        // Mark initialization as complete
        registry!.isInitializing = false;
      });

      // Map event listeners for movement
      map.on("move", () => {
        updateUserMarkerPosition();
      });

      map.on("moveend", () => {
        const center = map.getCenter();
        const zoom = map.getZoom();

        // Don't update URL or trigger search for the initial map setup
        if (isInitialMoveRef.current) {
          isInitialMoveRef.current = false;
          return;
        }

        // Only update URL and notify - don't trigger search directly
        updateUrlAndTriggerSearch(center, zoom);
      });

      // Add error handling for map
      map.on("error", (e) => {
        console.error("Mapbox error:", e);
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      if (registry) {
        registry.isInitializing = false;
      }
    }

    // Cleanup function
    return () => {
      // Cancel any pending debounced operations
      updateUrlAndTriggerSearch.cancel();

      // Don't destroy the map - just clean up instance-specific resources
      if (registry?.userMarker) {
        registry.userMarker.remove();
        registry.userMarker = null;
      }
    };
  }, [container]);

  return mapRef;
}
