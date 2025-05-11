// app/search/SearchClient.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  setCenters,
  setActivePin,
  setHoveredItem,
  setLoading,
  setError,
  setMapView,
  setSearchTerm,
  resetActiveStates,
} from "@/store/features/searchSlice";
import { useGeolocation } from "@/hooks/useGeolocation";
import { searchCenters } from "@/app/actions/search/searchCenters";
import SearchMap from "@/components/search/SearchMap";
import SearchResults from "@/components/search/SearchResults";
import SearchBar from "@/components/ui/SearchBar";
import type { MapBounds, MapView } from "@/types/map";
import styles from "./Search.module.css";

interface SearchClientProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function SearchClient({ searchParams = {} }: SearchClientProps) {
  // Get location and dispatch actions
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const urlSearchParams = useSearchParams();
  const searchInProgressRef = useRef(false);
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Access Redux state
  const {
    // State
    centers,
    activePin,
    hoveredItem,
    isLoading,
    error,
    userLocation,
    mapView,
    searchTerm,
  } = useAppSelector((state) => state.search);

  // Local state for view toggle on mobile
  const [isMapView, setIsMapView] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get user location from hook
  const {
    latitude,
    longitude,
    error: locationError,
    isLoading: locationLoading,
  } = useGeolocation();

  // Parse URL parameters - run only once on initial load
  useEffect(() => {
    if (isInitialized) return;

    // Parse search term from URL
    const qParam = searchParams?.q;
    if (qParam !== undefined) {
      const searchQuery = Array.isArray(qParam) ? qParam[0] : qParam;
      dispatch(setSearchTerm(searchQuery));
    }

    // Parse center and distance from URL
    const centerParam = searchParams?.center;
    const distanceParam = searchParams?.distance;

    if (centerParam !== undefined && distanceParam !== undefined) {
      try {
        const centerStr = Array.isArray(centerParam)
          ? centerParam[0]
          : centerParam;
        const distanceStr = Array.isArray(distanceParam)
          ? distanceParam[0]
          : distanceParam;

        const [lat, lng] = centerStr.split(",").map(Number);
        const distance = Number(distanceStr);

        if (!isNaN(lat) && !isNaN(lng) && !isNaN(distance)) {
          dispatch(
            setMapView({
              center: { latitude: lat, longitude: lng },
              distance,
            })
          );

          // Mark as initialized to prevent repeated parsing
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Failed to parse map parameters from URL:", error);
      }
    }
  }, [searchParams, dispatch, isInitialized]);

  // Check screen size for responsive view - runs only on client
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 768);
    };

    // Initial check
    checkScreenSize();

    // Add listener for resize
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Update URL with map view and search term
  const updateUrl = useCallback(
    (newMapView: MapView, newSearchTerm = searchTerm) => {
      // Clear any existing timeout
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current);
      }

      // Debounce URL updates to avoid excessive history entries
      urlUpdateTimeoutRef.current = setTimeout(() => {
        const params = new URLSearchParams();

        // Preserve search term
        if (newSearchTerm) {
          params.set("q", newSearchTerm);
        }

        // Add map view parameters
        params.set(
          "center",
          `${newMapView.center.latitude},${newMapView.center.longitude}`
        );
        params.set("distance", newMapView.distance.toString());

        // Construct new URL
        const newUrl = `${pathname}?${params.toString()}`;
        console.log("Updating URL to:", newUrl);

        // Update URL without triggering navigation
        router.replace(newUrl, { scroll: false });
      }, 300);
    },
    [pathname, router, searchTerm]
  );

  // Execute search based on map bounds AND search term
  const executeSearch = useCallback(
    async (
      bounds: MapBounds & { center: MapView["center"]; distance: number },
      term: string = searchTerm
    ) => {
      // Prevent multiple simultaneous searches
      if (searchInProgressRef.current) return;
      searchInProgressRef.current = true;

      dispatch(setLoading(true));

      try {
        console.log(`Executing search with term "${term}" and bounds:`, bounds);
        const results = await searchCenters({
          bounds,
          searchTerm: term,
        });

        dispatch(setCenters(results));
      } catch (error) {
        console.error("Search error:", error);
        dispatch(setError("Failed to load centers. Please try again."));
      } finally {
        dispatch(setLoading(false));
        searchInProgressRef.current = false;
      }
    },
    [dispatch, searchTerm]
  );

  // Handle map bounds change
  const handleBoundsChange = useCallback(
    (
      newMapView: MapBounds & { center: MapView["center"]; distance: number }
    ) => {
      console.log("Map bounds changed:", newMapView);

      // Update map view in Redux
      dispatch(
        setMapView({
          center: newMapView.center,
          distance: newMapView.distance,
        })
      );

      // Update URL with new map bounds AND current search term
      updateUrl(
        {
          center: newMapView.center,
          distance: newMapView.distance,
        },
        searchTerm
      );

      // Execute search with new bounds AND current search term
      executeSearch(newMapView, searchTerm);
    },
    [dispatch, updateUrl, executeSearch, searchTerm]
  );

  // Handle search term change
  const handleSearchChange = useCallback(
    (term: string) => {
      console.log("Search term changed:", term);
      dispatch(setSearchTerm(term));

      if (mapView) {
        // Update URL with current map view AND new search term
        updateUrl(mapView, term);

        // Calculate bounds from current mapView if not already available
        const bounds = {
          ...mapView,
          north:
            mapView.north || mapView.center.latitude + mapView.distance / 111,
          south:
            mapView.south || mapView.center.latitude - mapView.distance / 111,
          east:
            mapView.east ||
            mapView.center.longitude +
              mapView.distance /
                (111 * Math.cos((mapView.center.latitude * Math.PI) / 180)),
          west:
            mapView.west ||
            mapView.center.longitude -
              mapView.distance /
                (111 * Math.cos((mapView.center.latitude * Math.PI) / 180)),
        };

        // Execute search with current bounds AND new search term
        executeSearch(bounds, term);
      }
    },
    [dispatch, mapView, updateUrl, executeSearch]
  );

  // Handle center click
  const handleCenterClick = useCallback(
    (id: string) => {
      dispatch(setActivePin(id));
    },
    [dispatch]
  );

  // Handle center hover
  const handleCenterHover = useCallback(
    (id: string | null) => {
      dispatch(setHoveredItem(id));
    },
    [dispatch]
  );

  // Toggle between map and list view on mobile
  const toggleView = useCallback(() => {
    setIsMapView((prev) => !prev);
  }, []);

  // Execute initial search when map view is not available but user location is
  useEffect(() => {
    if (!isInitialized && !mapView && latitude && longitude) {
      console.log(
        "Initializing map view with user location:",
        latitude,
        longitude
      );

      // Initialize map view with user location
      const initialMapView = {
        center: { latitude, longitude },
        distance: 5, // Default 5km radius
      };

      dispatch(setMapView(initialMapView));
      setIsInitialized(true);

      // Update URL with initial map view AND current search term
      updateUrl(initialMapView, searchTerm);

      // Calculate bounds
      const bounds = {
        ...initialMapView,
        north: latitude + 0.045, // Approximate 5km
        south: latitude - 0.045,
        east: longitude + 0.045 / Math.cos((latitude * Math.PI) / 180),
        west: longitude - 0.045 / Math.cos((latitude * Math.PI) / 180),
      };

      // Execute search with initial bounds AND current search term
      executeSearch(bounds, searchTerm);
    }
  }, [
    latitude,
    longitude,
    mapView,
    searchTerm,
    dispatch,
    updateUrl,
    executeSearch,
    isInitialized,
  ]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      {/* Mobile header with search and toggle */}
      {!isLargeScreen && (
        <div className={styles.mobileHeader}>
          <SearchBar
            placeholder="Search for sports & places"
            onSearch={handleSearchChange}
            initialSearchTerm={searchTerm}
            className={styles.mobileSearchBar}
          />

          <button
<<<<<<< HEAD
            className={styles.mapToggleButton}
            onClick={toggleMapView}
=======
            className={styles.viewToggleButton}
            onClick={toggleView}
>>>>>>> test-map
            type="button"
            aria-label={isMapView ? "Show list" : "Show map"}
          >
            {isMapView ? "List" : "Map"}
          </button>
        </div>
      )}

      {/* Main content */}
      <div className={styles.content}>
        {/* Left panel (search results) */}
        <div
          className={`${styles.leftPanel} ${
            !isLargeScreen && isMapView ? styles.hidden : ""
          }`}
        >
          {isLargeScreen && (
            <div className={styles.desktopSearchContainer}>
              <SearchBar
                placeholder="Search for sports & places"
                onSearch={handleSearchChange}
                initialSearchTerm={searchTerm}
                className={styles.desktopSearchBar}
              />
            </div>
          )}

          <SearchResults
            centers={centers}
            isLoading={isLoading}
            activePin={activePin}
            searchTerm={searchTerm}
            onCenterClick={handleCenterClick}
            onCenterHover={handleCenterHover}
          />
        </div>

        {/* Right panel (map) */}
        <div
          className={`${styles.rightPanel} ${
            !isLargeScreen && !isMapView ? styles.hidden : ""
          }`}
        >
          {!locationLoading && latitude !== null && longitude !== null && (
            <SearchMap
              centers={centers}
              userLocation={userLocation || { latitude, longitude }}
              onBoundsChange={handleBoundsChange}
              initialCenter={
                mapView
                  ? [mapView.center.latitude, mapView.center.longitude]
                  : [latitude, longitude]
              }
              initialDistance={mapView?.distance || 5}
              activePin={activePin}
              onMarkerClick={handleCenterClick}
              onMapClick={() => dispatch(resetActiveStates())}
            />
          )}
        </div>
      </div>
    </div>
  );
}
