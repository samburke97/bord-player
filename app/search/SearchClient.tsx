"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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

  // Check if map parameters exist in URL
  const hasMapParams = useMemo(
    () => searchParams.has("center") && searchParams.has("distance"),
    [searchParams]
  );

  useEffect(() => {
    const queryParam = searchParams.get("q");

    // Only update if it's different to avoid loops
    if (queryParam !== null && queryParam !== searchTerm) {
      console.log(`📝 Setting search term from URL: "${queryParam}"`);
      dispatch(setSearchTerm(queryParam));
    }
  }, [searchParams, dispatch, searchTerm]);

  // Execute search when searchTerm changes
  useEffect(() => {
    // Skip the initial render
    if (isInitialLoadComplete && mapView) {
      console.log(
        `🔄 Search term changed to "${searchTerm}" - executing new search`
      );
      dispatch(executeSearch());
    }
  }, [searchTerm, isInitialLoadComplete, mapView, dispatch]);

  // Get search term from URL
  useEffect(() => {
    const queryParam = searchParams.get("q");

    // Only update if it's different to avoid loops
    if (queryParam !== null && queryParam !== searchTerm) {
      console.log(`📝 Setting search term from URL: "${queryParam}"`);
      dispatch(setSearchTerm(queryParam));
    }
  }, [searchParams, dispatch, searchTerm]);

  // Perform initial search
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
        console.log("🚀 Initializing search with map view:", initialMapView);

        // Dispatch map view to store
        dispatch(setMapView(initialMapView));

        // Log current search term
        console.log("🔍 Current search term:", searchTerm || "[NONE]");

        // Execute initial search
        await dispatch(executeSearch({ forceUpdate: true }));

        // Mark initial load as complete
        setIsInitialLoadComplete(true);
      } catch (error) {
        console.error("❌ Initial search failed:", error);
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

  // Log whenever centers change
  useEffect(() => {
    console.log(`📋 Centers array updated. Count: ${centers.length}`);
  }, [centers]);

  // Render
  return (
    <div
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
              onBoundsChange={(bounds) => {
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

                dispatch(executeSearch());
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
