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

// Define types for our context
interface SearchContextType {
  // State
  centers: Center[];
  isLoading: boolean;
  userLocation: { latitude: number; longitude: number } | null;
  activePin: string | null;
  hoveredPin: string | null;
  mapView: MapView | null;
  searchTerm: string;

  // Actions
  setActivePin: (id: string | null) => void;
  setHoveredPin: (id: string | null) => void;
  setMapView: (view: MapView) => void;
  setSearchTerm: (term: string) => void;
  initializeSearch: () => Promise<void>;
  refreshSearch: () => Promise<void>;
}

// Default map view centered on London
const defaultMapView: MapView = {
  center: { latitude: 51.5074, longitude: -0.1278 },
  distance: 10, // Default 10km radius
};

// Create a default context value to avoid the "must be used within a provider" error
const defaultContextValue: SearchContextType = {
  centers: [],
  isLoading: false,
  userLocation: null,
  activePin: null,
  hoveredPin: null,
  mapView: null,
  searchTerm: "",
  setActivePin: () => {},
  setHoveredPin: () => {},
  setMapView: () => {},
  setSearchTerm: () => {},
  initializeSearch: async () => {},
  refreshSearch: async () => {},
};

// Create the context with default values
const SearchContext = createContext<SearchContextType>(defaultContextValue);

export function SearchProvider({ children }: { children: ReactNode }) {
  // Router and search params
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State
  const [centers, setCenters] = useState<Center[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [activePin, setActivePin] = useState<string | null>(null);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [mapView, setMapView] = useState<MapView | null>(null);
  const [searchTerm, setSearchTermState] = useState<string>("");

  // Get initial searchTerm from URL
  useEffect(() => {
    const term = searchParams.get("q") || "";
    setSearchTermState(term);
  }, [searchParams]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to London if geolocation fails
          setUserLocation(defaultMapView.center);
        }
      );
    } else {
      // Default to London if geolocation is not available
      setUserLocation(defaultMapView.center);
    }
  }, []);

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
    if (!userLocation) return;

    // Set initial map view from URL or defaults
    const initialMapView: MapView = {
      center: userLocation,
      distance: 10,
    };

    setMapView(initialMapView);

    // Perform initial search
    await executeSearch(initialMapView, searchTerm);
  }, [userLocation, searchTerm]);

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
    if (mapView) {
      executeSearch(mapView, searchTerm);
    }
  }, [mapView, searchTerm, executeSearch]);

  // Manual refresh function
  const refreshSearch = useCallback(async () => {
    if (mapView) {
      await executeSearch(mapView, searchTerm);
    }
  }, [mapView, searchTerm, executeSearch]);

  // Construct the context value
  const value: SearchContextType = {
    centers,
    isLoading,
    userLocation,
    activePin,
    hoveredPin,
    mapView,
    searchTerm,
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
