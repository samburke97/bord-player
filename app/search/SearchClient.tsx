"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Map1, TextalignJustifyleft } from "iconsax-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useSearchParams } from "next/navigation";
import { RootState } from "@/store/store";
import {
  setMapView,
  resetActiveStates,
  setSearchTerm,
} from "@/store/redux/features/searchSlice";
import { executeSearch } from "@/store/redux/features/searchThunk";
import type { MapView } from "@/types";
import { debounce } from "lodash";

// UI Components
import SearchBar from "@/components/ui/SearchBar";
import SearchMap from "@/components/search/SearchMap";
import SearchItem from "@/components/search/SearchItem";
import SearchItemSkeleton from "@/components/search/skeletons/SearchItemSkeleton";

// Styles
import styles from "./Search.module.css";

export default function SearchClient() {
  // Hooks and State Management
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { isLoading: isLoadingLocation } = useGeolocation();
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const containerRef = useRef<HTMLDivElement>(null);

  // Redux State
  const {
    centers,
    activePin,
    userLocation,
    isLoading: isFetching,
    mapView,
    searchTerm,
  } = useAppSelector((state: RootState) => state.search);

  // Local Component State
  const [isMapView, setIsMapView] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  // Store last search time to avoid excessive searches
  const lastSearchTimeRef = useRef(0);
  // Track if component is mounted
  const isMountedRef = useRef(false);

  // Check if map parameters exist in URL
  const hasMapParams = useMemo(
    () => searchParams.has("center") && searchParams.has("distance"),
    [searchParams]
  );

  // Initialize search term from URL
  useEffect(() => {
    const queryParam = searchParams.get("q");

    // Only update if it's different to avoid loops
    if (queryParam !== null && queryParam !== searchTerm) {
      dispatch(setSearchTerm(queryParam));
    }
  }, [searchParams, dispatch, searchTerm]);

  // Create debounced search function - only execute after 500ms of no changes
  const debouncedSearch = useMemo(
    () =>
      debounce(() => {
        if (!mapView || !isMountedRef.current) return;

        const now = Date.now();
        // Limit search frequency to at most once every 1 second
        if (now - lastSearchTimeRef.current < 1000) {
          return;
        }

        lastSearchTimeRef.current = now;
        dispatch(executeSearch());
      }, 500),
    [dispatch, mapView]
  );

  // Execute search when searchTerm changes
  useEffect(() => {
    // Skip the initial render and ensure we have mapView
    if (isInitialLoadComplete && mapView) {
      debouncedSearch();
    }
  }, [searchTerm, isInitialLoadComplete, mapView, debouncedSearch]);

  // Clean up debounced function on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Perform initial search once
  const performInitialSearch = useCallback(async () => {
    // Prevent multiple initial searches
    if (isInitialLoadComplete) return;

    // Determine initial map view
    let initialMapView: MapView | null = null;

    // Try to get map view from URL parameters
    if (hasMapParams) {
      const centerParam = searchParams.get("center");
      const distanceParam = searchParams.get("distance");

      if (centerParam && distanceParam) {
        const [lat, lng] = centerParam.split(",").map(Number);
        const distance = Number(distanceParam);

        if (!isNaN(lat) && !isNaN(lng) && !isNaN(distance)) {
          initialMapView = {
            center: { latitude: lat, longitude: lng },
            distance: distance,
          };
        }
      }
    }

    // Fallback to user location if no URL params
    if (!initialMapView && userLocation) {
      initialMapView = {
        center: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
        distance: 5, // Default search radius
      };
    }

    // If we have a valid map view, proceed with search
    if (initialMapView) {
      try {
        // Dispatch map view to store
        dispatch(setMapView(initialMapView));

        // Execute initial search
        await dispatch(executeSearch({ forceUpdate: true }));

        // Record time of search
        lastSearchTimeRef.current = Date.now();

        // Mark initial load as complete
        setIsInitialLoadComplete(true);
      } catch (error) {
        setIsInitialLoadComplete(true);
      }
    }
  }, [
    dispatch,
    executeSearch,
    hasMapParams,
    isInitialLoadComplete,
    searchParams,
    userLocation,
    searchTerm,
  ]);

  // Toggle map/list view on mobile
  const handleToggleView = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMapView((prev) => !prev);
  }, []);

  // Handle search dropdown state
  const handleSearchDropdownChange = useCallback((isOpen: boolean) => {
    setIsSearchDropdownOpen(isOpen);
  }, []);

  // Create debounced map bounds change handler
  const handleBoundsChange = useMemo(
    () =>
      debounce((bounds: any) => {
        dispatch(resetActiveStates());

        dispatch(
          setMapView({
            center: {
              latitude: bounds.center.latitude,
              longitude: bounds.center.longitude,
            },
            distance: bounds.distance,
          })
        );

        // Execute search with small delay
        setTimeout(() => {
          if (isMountedRef.current) {
            const now = Date.now();
            // Don't search if we just did
            if (now - lastSearchTimeRef.current < 800) {
              return;
            }

            lastSearchTimeRef.current = now;
            dispatch(executeSearch());
          }
        }, 100);
      }, 800),
    [dispatch]
  );

  // Trigger initial search on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      performInitialSearch();
    }
  }, [performInitialSearch]);

  // Handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setIsMapView(false);
      }
    };

    // Add and remove resize listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Manage body styles for map view on mobile
  useEffect(() => {
    // Apply fixed positioning when map view is active on small screens
    if (isMapView && !isLargeScreen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100%";

      // Force map reflow
      const resizeTimer = setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 50);

      return () => {
        clearTimeout(resizeTimer);
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.height = "";
      };
    }
  }, [isMapView, isLargeScreen]);

  const mapLocation = useMemo(() => {
    // Only use userLocation if it's actually available
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      return userLocation;
    }

    // Return null to indicate we're waiting for location
    return null;
  }, [userLocation]);

  // Ensure map is properly sized after initial render
  useEffect(() => {
    if (isInitialLoadComplete) {
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("resize"));
      });
    }
  }, [isInitialLoadComplete]);

  // Render
  return (
    <div
      ref={containerRef}
      className={`
        ${styles.container} 
        ${isMapView && !isLargeScreen ? styles.mapViewActive : ""}
      `}
    >
      {/* Navigation Bar */}
      <div
        className={
          isMapView && !isLargeScreen ? styles.navbarMap : styles.navbarList
        }
      >
        {/* Search Bar */}
        <SearchBar
          className={styles.searchBar}
          onDropdownChange={handleSearchDropdownChange}
          initialSearchTerm={searchTerm || ""}
        />

        {/* Mobile View Toggle */}
        {!isLargeScreen && !isSearchDropdownOpen && (
          <button
            className={styles.mapToggleButton}
            onClick={handleToggleView}
            type="button"
            aria-label={isMapView ? "Show list view" : "Show map view"}
          >
            <div className={styles.icon}>
              {isMapView ? (
                <TextalignJustifyleft
                  className={styles.iconImg}
                  variant="Bold"
                />
              ) : (
                <Map1 className={styles.iconImg} variant="Bold" />
              )}
            </div>
          </button>
        )}
      </div>

      {/* Content Container */}
      <div className={styles.contentContainer}>
        {/* Left Panel (Search Results) */}
        <div
          className={`
            ${styles.leftPanel} 
            ${isMapView && !isLargeScreen ? styles.hiddenOnSmallScreens : ""}
          `}
        >
          <div className={styles.leftPanelInner}>
            {!userLocation || isLoadingLocation ? (
              <SearchItemSkeleton />
            ) : (
              <SearchItem centers={centers} activePin={activePin} />
            )}
          </div>
        </div>

        {/* Right Panel (Map) */}
        <div
          className={`
            ${styles.rightPanel} 
            ${!isMapView && !isLargeScreen ? styles.hiddenOnSmallScreens : ""}
          `}
        >
          {userLocation && mapView && (
            <SearchMap
              centers={centers}
              userLocation={userLocation}
              isLoading={isFetching}
              initialCenter={[
                mapView.center.latitude,
                mapView.center.longitude,
              ]}
              initialDistance={mapView.distance}
              onBoundsChange={handleBoundsChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
