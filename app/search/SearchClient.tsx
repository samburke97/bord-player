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
  // Core hooks
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const urlSearchParams = useSearchParams();

  // Refs to manage async operations
  const searchInProgressRef = useRef(false);
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Redux state
  const { centers, activePin, isLoading, userLocation, mapView, searchTerm } =
    useAppSelector((state) => state.search);

  // UI state
  const [isMapView, setIsMapView] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get user location
  const {
    latitude,
    longitude,
    error: locationError,
    isLoading: locationLoading,
  } = useGeolocation();

  // Initialize from URL parameters
  useEffect(() => {
    if (isInitialized) return;

    // Parse search term
    const qParam = urlSearchParams.get("q");
    if (qParam !== undefined && qParam !== null) {
      dispatch(setSearchTerm(qParam));
    }

    // Parse map view parameters
    const centerParam = urlSearchParams.get("center");
    const distanceParam = urlSearchParams.get("distance");

    if (centerParam && distanceParam) {
      try {
        const [lat, lng] = centerParam.split(",").map(Number);
        const distance = Number(distanceParam);

        if (!isNaN(lat) && !isNaN(lng) && !isNaN(distance)) {
          dispatch(
            setMapView({
              center: { latitude: lat, longitude: lng },
              distance,
            })
          );
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Failed to parse map parameters from URL:", error);
      }
    }
  }, [urlSearchParams, dispatch, isInitialized]);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Update URL with current view state
  const updateUrl = useCallback(
    (newMapView: MapView, newSearchTerm = searchTerm) => {
      // Clear existing timeout
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current);
      }

      // Debounce URL updates
      urlUpdateTimeoutRef.current = setTimeout(() => {
        const params = new URLSearchParams(urlSearchParams.toString());

        // Update search term
        if (newSearchTerm) {
          params.set("q", newSearchTerm);
        } else {
          params.delete("q");
        }

        // Update map parameters
        params.set(
          "center",
          `${newMapView.center.latitude.toFixed(
            6
          )},${newMapView.center.longitude.toFixed(6)}`
        );
        params.set("distance", newMapView.distance.toFixed(2));

        // Construct and update URL
        const newUrl = `${pathname}?${params.toString()}`;
        console.log("Updating URL to:", newUrl);
        router.replace(newUrl, { scroll: false });
      }, 300);
    },
    [pathname, router, searchTerm, urlSearchParams]
  );

  const executeSearch = useCallback(
    async (
      bounds: MapBounds & { center: MapView["center"]; distance: number },
      term: string = searchTerm
    ) => {
      // Prevent multiple simultaneous searches
      if (searchInProgressRef.current) {
        console.log("Search already in progress, waiting...");
        await new Promise((resolve) => setTimeout(resolve, 300));
        if (searchInProgressRef.current) return;
      }

      searchInProgressRef.current = true;
      console.log(`Starting search execution with term "${term}"`);

      // Set loading state WITHOUT clearing centers
      dispatch(setLoading(true));

      try {
        // Log query parameters for debugging
        console.log(`Executing search with term "${term}" and bounds:`, {
          north: bounds.north.toFixed(6),
          south: bounds.south.toFixed(6),
          east: bounds.east.toFixed(6),
          west: bounds.west.toFixed(6),
        });

        const results = await searchCenters({
          bounds,
          searchTerm: term,
          // Add these if you're using them in your app
          // sportIds: [],
          // facilityIds: [],
        });

        console.log(`Search returned ${results.length} results for "${term}"`);

        // Update centers in Redux ONLY after we have results
        dispatch(setCenters(results));
        return results;
      } catch (error) {
        console.error("Search error:", error);
        dispatch(
          setError(error instanceof Error ? error.message : "Search failed")
        );
        // Don't clear centers on error - keep showing what we had
        return [];
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
      newBounds: MapBounds & { center: MapView["center"]; distance: number }
    ) => {
      console.log("Map bounds changed:", newBounds);

      // Update map view in Redux
      dispatch(
        setMapView({
          center: newBounds.center,
          distance: newBounds.distance,
          north: newBounds.north,
          south: newBounds.south,
          east: newBounds.east,
          west: newBounds.west,
        })
      );

      // Update URL
      updateUrl(
        {
          center: newBounds.center,
          distance: newBounds.distance,
        },
        searchTerm
      );

      // Execute search with new bounds and current search term
      executeSearch(newBounds, searchTerm);
    },
    [dispatch, executeSearch, searchTerm, updateUrl]
  );

  const handleSearchChange = useCallback(
    (term: string) => {
      console.log("Search term changed to:", term);

      // 1. Update the search term in Redux
      dispatch(setSearchTerm(term));

      // 2. Set loading state WITHOUT clearing centers
      dispatch(setLoading(true));

      // 3. If we have a map view, execute a fresh search
      if (mapView) {
        const bounds = {
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
          center: mapView.center,
          distance: mapView.distance,
        };

        // Force a fresh search with the new term
        searchCenters({
          bounds,
          searchTerm: term,
        })
          .then((results) => {
            console.log(
              `Search for "${term}" returned ${results.length} results`
            );
            // Only update centers when we have results
            dispatch(setCenters(results));
            dispatch(setLoading(false));
          })
          .catch((error) => {
            console.error("Search error:", error);
            dispatch(setError("Search failed"));
            dispatch(setLoading(false));
          });
      }

      // 4. Update URL with new search term
      if (mapView) {
        updateUrl(mapView, term);
      }
    },
    [dispatch, mapView, updateUrl]
  );

  // Initialize with user location if needed
  useEffect(() => {
    if (!isInitialized && !mapView && latitude && longitude) {
      console.log("Initializing with user location:", latitude, longitude);

      const initialMapView = {
        center: { latitude, longitude },
        distance: 5, // Default radius
      };

      dispatch(setMapView(initialMapView));
      setIsInitialized(true);

      // Update URL
      updateUrl(initialMapView, searchTerm);

      // Calculate bounds
      const bounds = {
        north: latitude + 5 / 111,
        south: latitude - 5 / 111,
        east: longitude + 5 / (111 * Math.cos(latitude * (Math.PI / 180))),
        west: longitude - 5 / (111 * Math.cos(latitude * (Math.PI / 180))),
        center: { latitude, longitude },
        distance: 5,
      };

      // Execute search
      executeSearch(bounds, searchTerm);
    }
  }, [
    dispatch,
    executeSearch,
    isInitialized,
    latitude,
    longitude,
    mapView,
    searchTerm,
    updateUrl,
  ]);

  // Center click handler
  const handleCenterClick = useCallback(
    (id: string) => {
      dispatch(setActivePin(id));
    },
    [dispatch]
  );

  // Center hover handler
  const handleCenterHover = useCallback(
    (id: string | null) => {
      dispatch(setHoveredItem(id));
    },
    [dispatch]
  );

  // Toggle view on mobile
  const toggleView = useCallback(() => {
    setIsMapView((prev) => !prev);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Modified useEffect for search term or map view changes
  useEffect(() => {
    // Only run if both are initialized
    if (!mapView || !isInitialized) return;

    // Build bounds from mapView
    const bounds = {
      north: mapView.north || mapView.center.latitude + mapView.distance / 111,
      south: mapView.south || mapView.center.latitude - mapView.distance / 111,
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
      center: mapView.center,
      distance: mapView.distance,
    };

    dispatch(setLoading(true));

    searchCenters({ bounds, searchTerm })
      .then((results) => {
        dispatch(setCenters(results));
        dispatch(setLoading(false));
      })
      .catch((error) => {
        console.error("Search error:", error);
        dispatch(setLoading(false));
      });
  }, [searchTerm, mapView, isInitialized, dispatch]);

  return (
    <div className={styles.container}>
      {!isLargeScreen && (
        <div className={styles.mobileHeader}>
          <SearchBar
            placeholder="Search for sports & places"
            onSearch={handleSearchChange}
            initialSearchTerm={searchTerm}
            className={styles.mobileSearchBar}
          />

          <button
            className={styles.viewToggleButton}
            onClick={toggleView}
            type="button"
            aria-label={isMapView ? "Show list" : "Show map"}
          >
            {isMapView ? "List" : "Map"}
          </button>
        </div>
      )}

      <div className={styles.content}>
        <div
          className={`${styles.leftPanel} ${
            !isLargeScreen && isMapView ? styles.hidden : ""
          }`}
        >
          <SearchResults
            centers={centers}
            isLoading={isLoading}
            activePin={activePin}
            searchTerm={searchTerm}
            onCenterClick={handleCenterClick}
            onCenterHover={handleCenterHover}
          />
        </div>

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
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
