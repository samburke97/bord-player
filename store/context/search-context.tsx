"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Center, MapView } from "@/types";
import { searchCenters } from "@/app/actions/search";
import { calculateBoundsFromCenter } from "@/lib/api";
import { useGeolocation } from "@/hooks/useGeolocation";

// Define types for our context
interface SearchContextType {
  // State
  centers: Center[];
  isLoading: boolean;
  userLocation: { latitude: number; longitude: number } | null;
  locationError: string | null;
  activePin: string | null;
  hoveredPin: string | null;
  mapView: MapView | null;
  searchTerm: string;
  isLocationLoading: boolean;

  // Actions
  setActivePin: (id: string | null) => void;
  setHoveredPin: (id: string | null) => void;
  setMapView: (view: MapView) => void;
  setSearchTerm: (term: string) => void;
  initializeSearch: () => Promise<void>;
  refreshSearch: () => Promise<void>;
}

// Create the context with default values
const defaultContextValue: SearchContextType = {
  centers: [],
  isLoading: false,
  userLocation: null,
  locationError: null,
  activePin: null,
  hoveredPin: null,
  mapView: null,
  searchTerm: "",
  isLocationLoading: true,
  setActivePin: () => {},
  setHoveredPin: () => {},
  setMapView: () => {},
  setSearchTerm: () => {},
  initializeSearch: async () => {},
  refreshSearch: async () => {},
};

// Create the context
const SearchContext = createContext<SearchContextType>(defaultContextValue);

export function SearchProvider({ children }: { children: ReactNode }) {
  // Router and search params
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State for search
  const [centers, setCenters] = useState<Center[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activePin, setActivePin] = useState<string | null>(null);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [mapView, setMapView] = useState<MapView | null>(null);
  const [searchTerm, setSearchTermState] = useState<string>("");

  // Get location from our hook
  const {
    latitude,
    longitude,
    error: locationError,
    isLoading: isLocationLoading,
  } = useGeolocation();

  // Create userLocation object only when we have valid coordinates
  const userLocation =
    latitude !== null && longitude !== null ? { latitude, longitude } : null;

  // Get initial searchTerm from URL
  useEffect(() => {
    const term = searchParams.get("q") || "";
    setSearchTermState(term);
  }, [searchParams]);

  // Update map view when user location becomes available
  useEffect(() => {
    // Only set map view once when user location becomes available and no map view exists yet
    if (userLocation && !mapView) {
      // Get any URL parameters for center and distance
      const centerParam = searchParams.get("center");
      const distanceParam = searchParams.get("distance");

      let initialMapView: MapView;

      // If URL has valid location parameters, use those
      if (centerParam && distanceParam) {
        try {
          const [lat, lng] = centerParam.split(",").map(Number);
          const distance = Number(distanceParam);

          if (!isNaN(lat) && !isNaN(lng) && !isNaN(distance)) {
            console.log("Using URL parameters for map view");
            initialMapView = {
              center: { latitude: lat, longitude: lng },
              distance: distance,
            };
          } else {
            throw new Error("Invalid URL parameters");
          }
        } catch (e) {
          console.error("Error parsing URL parameters:", e);
          // Fall back to user location
          initialMapView = {
            center: userLocation,
            distance: 10, // Default 10km radius
          };
        }
      } else {
        // Otherwise use user location
        console.log("No URL parameters - using user's location");
        initialMapView = {
          center: userLocation,
          distance: 10, // Default 10km radius
        };
      }

      // Update map view
      setMapView(initialMapView);

      // Update URL if we're not using URL parameters
      if (!centerParam || !distanceParam) {
        const params = new URLSearchParams(searchParams.toString());
        params.set(
          "center",
          `${initialMapView.center.latitude},${initialMapView.center.longitude}`
        );
        params.set("distance", initialMapView.distance.toString());

        // Update URL without causing a page reload
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }
  }, [userLocation, mapView, searchParams, pathname, router]);

  // Set search term and update URL
  const setSearchTerm = useCallback(
    (term: string) => {
      setSearchTermState(term);

      // Update URL
      const params = new URLSearchParams(searchParams.toString());
      if (term) {
        params.set("q", term);
      } else {
        params.delete("q");
      }

      // Push to history without full page reload
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Initialize search (called on first render)
  const initializeSearch = useCallback(async () => {
    if (!userLocation) {
      console.log("Waiting for user location before initializing search");
      return;
    }

    // Map view should already be set by the useEffect above
    if (!mapView) {
      console.log("Map view not yet set");
      return;
    }

    // Perform initial search
    await executeSearch(mapView, searchTerm);
  }, [userLocation, mapView, searchTerm]);

  // Execute search with current parameters
  const executeSearch = useCallback(
    async (currentMapView: MapView, currentSearchTerm: string) => {
      if (!currentMapView) return;

      setIsLoading(true);

      try {
        const bounds = calculateBoundsFromCenter(
          currentMapView.center,
          currentMapView.distance
        );

        console.log(`Searching with bounds: ${JSON.stringify(bounds)}`);
        console.log(`Search term: ${currentSearchTerm}`);

        const results = await searchCenters({
          searchTerm: currentSearchTerm,
          bounds,
        });

        setCenters(results || []);
      } catch (error) {
        console.error("Error searching centers:", error);
        setCenters([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Refresh search when parameters change
  useEffect(() => {
    if (mapView && !isLocationLoading) {
      // Add a slight delay to avoid hammering the API during initialization
      const searchDebounce = setTimeout(() => {
        executeSearch(mapView, searchTerm);
      }, 100);

      return () => clearTimeout(searchDebounce);
    }
  }, [mapView, searchTerm, executeSearch, isLocationLoading]);

  // Manual refresh function
  const refreshSearch = useCallback(async () => {
    if (mapView) {
      await executeSearch(mapView, searchTerm);
    }
  }, [mapView, searchTerm, executeSearch]);

  // Construct the context value
  const value: SearchContextType = {
    centers,
    isLoading: isLoading || isLocationLoading,
    userLocation,
    locationError,
    activePin,
    hoveredPin,
    mapView,
    searchTerm,
    isLocationLoading,
    setActivePin,
    setHoveredPin,
    setMapView,
    setSearchTerm,
    initializeSearch,
    refreshSearch,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}
