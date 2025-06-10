// app/search/SearchClient.tsx
"use client";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
import Image from "next/image";
import {
  setCenters,
  setActivePin,
  setHoveredItem,
  setLoading,
  setError,
  setMapView,
  setSearchTerm,
  resetActiveStates,
  cleanupSearchState,
} from "@/store/features/searchSlice";
import { executeSearch } from "@/store/features/searchThunk";
import { useGeolocation } from "@/hooks/useGeolocation";
import SearchMap from "@/components/search/SearchMap";
import SearchResults from "@/components/search/SearchResults";
import SearchBar from "@/components/ui/searchbar/SearchBar";
import type { MapView, MapBounds } from "@/types/map";
import styles from "./Search.module.css";

// Helper function to calculate map bounds
function calculateBoundsFromMapView(mapView: MapView): MapBounds {
  const { center, distance } = mapView;
  const lat = center.latitude;
  const lng = center.longitude;
  return {
    north: lat + distance / 111,
    south: lat - distance / 111,
    east: lng + distance / (111 * Math.cos(lat * (Math.PI / 180))),
    west: lng - distance / (111 * Math.cos(lat * (Math.PI / 180))),
  };
}

export default function SearchClient() {
  // Core hooks
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Redux state
  const { centers, activePin, isLoading, userLocation, mapView, searchTerm } =
    useAppSelector((state) => state.search);

  // UI state
  const [isMapView, setIsMapView] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mapRendered, setMapRendered] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Request tracking for debouncing
  const lastSearchParamsRef = useRef("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get user location
  const {
    latitude,
    longitude,
    error: locationError,
    isLoading: locationLoading,
  } = useGeolocation();

  // Clean up state on mount and unmount
  useLayoutEffect(() => {
    // Clean up stale data when component mounts
    dispatch(cleanupSearchState());

    // Also clean up when component unmounts
    return () => {
      dispatch(cleanupSearchState());
    };
  }, [dispatch]);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    // Set map as rendered once we're ready
    setMapRendered(true);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // React to URL parameter changes - The source of truth
  useEffect(() => {
    if (initialLoadComplete) return; // Only run this on initial load

    // Get search parameters
    const qParam = searchParams.get("q");
    const centerParam = searchParams.get("center");
    const distanceParam = searchParams.get("distance");

    // Generate a key for this URL state for deduplication
    const urlStateKey = `${qParam || ""}-${centerParam || ""}-${
      distanceParam || ""
    }`;

    // Skip if the URL hasn't actually changed
    if (urlStateKey === lastSearchParamsRef.current) {
      return;
    }

    // Update our reference for next time
    lastSearchParamsRef.current = urlStateKey;

    // Update search term in Redux state if different
    if (qParam !== searchTerm) {
      dispatch(setSearchTerm(qParam || ""));
    }

    // Process map parameters
    if (centerParam && distanceParam) {
      try {
        const [lat, lng] = centerParam.split(",").map(Number);
        const distance = Number(distanceParam);

        if (!isNaN(lat) && !isNaN(lng) && !isNaN(distance)) {
          // Update map view
          const newMapView = {
            center: { latitude: lat, longitude: lng },
            distance,
          };

          dispatch(setMapView(newMapView));

          // Execute search with parameters
          dispatch(executeSearch())
            .then(() => {
              setInitialLoadComplete(true);
            })
            .catch((error) => {
              console.error("Initial search failed:", error);
              setInitialLoadComplete(true);
            });
        }
      } catch (error) {
        console.error("Failed to parse map parameters from URL:", error);
        setInitialLoadComplete(true);
      }
    } else if (latitude && longitude) {
      // Fall back to user location if no map parameters
      const initialMapView = {
        center: { latitude, longitude },
        distance: 5, // Default radius
      };

      dispatch(setMapView(initialMapView));
      updateUrl(initialMapView, qParam || "");

      // Set the initial load as complete
      setInitialLoadComplete(true);
    } else {
      // If there's nothing to load, mark as complete anyway
      setInitialLoadComplete(true);
    }
  }, [
    searchParams,
    dispatch,
    searchTerm,
    latitude,
    longitude,
    initialLoadComplete,
  ]);

  // Update URL with current view state - debounce to prevent too many history entries
  const updateUrl = useCallback(
    (newMapView: MapView, newSearchTerm = searchTerm) => {
      // Clear any existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce the URL update
      debounceTimerRef.current = setTimeout(() => {
        const params = new URLSearchParams();

        // Update search term
        if (newSearchTerm) {
          params.set("q", newSearchTerm);
        }

        // Update map parameters
        params.set(
          "center",
          `${newMapView.center.latitude.toFixed(
            6
          )},${newMapView.center.longitude.toFixed(6)}`
        );
        params.set("distance", newMapView.distance.toFixed(2));

        // Construct and update URL - use replace to avoid filling history
        const newUrl = `${pathname}?${params.toString()}`;
        router.replace(newUrl, { scroll: false });

        // Clear the timer reference
        debounceTimerRef.current = null;
      }, 300);
    },
    [pathname, router, searchTerm]
  );

  // Handle map bounds change
  const handleBoundsChange = useCallback(
    (newMapView: MapView) => {
      // Reset active states when user changes map
      dispatch(resetActiveStates());

      // Update map view
      dispatch(setMapView(newMapView));

      // Update URL (which will trigger the search via URL parameters effect)
      updateUrl(newMapView);

      // Execute search with the new bounds
      dispatch(setLoading(true));
      dispatch(executeSearch()).finally(() => {
        dispatch(setLoading(false));
      });
    },
    [dispatch, updateUrl]
  );

  // Handle search term change
  const handleSearchChange = useCallback(
    (newTerm: string) => {
      // Reset active pin when search term changes
      dispatch(resetActiveStates());

      // Update Redux state
      dispatch(setSearchTerm(newTerm));

      if (mapView) {
        // Update URL and trigger search
        updateUrl(mapView, newTerm);

        // Execute search with the current map view and new search term
        dispatch(setLoading(true));
        dispatch(executeSearch()).finally(() => {
          dispatch(setLoading(false));
        });
      } else if (latitude && longitude) {
        // Create default map view if we don't have one
        const defaultMapView = {
          center: { latitude, longitude },
          distance: 5,
        };
        dispatch(setMapView(defaultMapView));
        updateUrl(defaultMapView, newTerm);
      }
    },
    [dispatch, mapView, updateUrl, latitude, longitude]
  );

  // FIXED: Separate handlers for marker vs card clicks
  // This handler is ONLY for when a pin is clicked - just activates it
  const handleMarkerClick = useCallback(
    (id: string | null) => {
      dispatch(setActivePin(id));
    },
    [dispatch]
  );

  // This handler is ONLY for when a card is clicked - navigates to center page
  const handleCenterClick = useCallback(
    (id: string) => {
      router.push(`/centers/${id}`);
    },
    [router]
  );

  // Center hover handler
  const handleCenterHover = useCallback(
    (id: string | null) => {
      dispatch(setHoveredItem(id));
    },
    [dispatch]
  );

  // Handle search dropdown state
  const handleSearchDropdownChange = useCallback((isOpen: boolean) => {
    setIsDropdownOpen(isOpen);
  }, []);

  // Toggle view on tablet and mobile
  const toggleView = useCallback(() => {
    setIsMapView((prev) => !prev);

    // Force resize after toggle by dispatching a window resize event
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 10);
  }, []);

  // Handle body overflow for fullscreen map
  useEffect(() => {
    if (!isLargeScreen && isMapView) {
      // Lock body when fullscreen map is shown
      document.body.style.overflow = "hidden";
    } else {
      // Reset when not in fullscreen map
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isLargeScreen, isMapView]);

  return (
    <div
      className={`${styles.container} ${isMapView ? styles.mapViewActive : ""}`}
    >
      {/* Navigation Bar - Use separate classes for list and map views */}
      {!isLargeScreen && (
        <div className={isMapView ? styles.navbarMap : styles.navbarList}>
          <div className={styles.searchBar}>
            <SearchBar
              placeholder="Search for sports & places"
              onSearch={handleSearchChange}
              initialSearchTerm={searchTerm}
              onDropdownChange={handleSearchDropdownChange}
              className={styles.searchBarInput}
            />
          </div>

          {/* Always render the toggle button, don't conditionally hide it */}
          <button
            className={styles.mapToggleButton}
            onClick={toggleView}
            type="button"
            aria-label={isMapView ? "Show list" : "Show map"}
          >
            <div className={styles.icon}>
              <Image
                src={
                  isMapView
                    ? "/icons/utility-outline/list.svg"
                    : "/icons/utility-outline/map.svg"
                }
                alt={isMapView ? "Show list" : "Show map"}
                width={24}
                height={24}
                className={styles.iconImg}
              />
            </div>
          </button>
        </div>
      )}

      <div className={styles.content}>
        <div
          className={`${styles.leftPanel} ${
            !isLargeScreen && isMapView ? styles.hidden : ""
          }`}
        >
          <div className={styles.resultsList}>
            <SearchResults
              centers={centers}
              isLoading={isLoading}
              activePin={activePin}
              searchTerm={searchTerm}
              onCenterHover={handleCenterHover}
              onCenterClick={handleCenterClick} // For navigation when clicking a card
            />
          </div>
        </div>

        <div
          className={`${styles.rightPanel} ${
            !isLargeScreen && !isMapView ? styles.hidden : ""
          }`}
        >
          {!locationLoading &&
            latitude !== null &&
            longitude !== null &&
            mapRendered && (
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
                onMarkerClick={handleMarkerClick} // FIXED: Use the correct handler here
                onMapClick={() => dispatch(resetActiveStates())}
                isLoading={isLoading}
              />
            )}
        </div>
      </div>
    </div>
  );
}
