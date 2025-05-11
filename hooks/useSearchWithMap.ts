// hooks/useSearchWithMap.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setMapView,
  resetActiveStates,
  setSearchTerm,
  setCenters,
  setLoading,
  setError,
  setActivePin,
} from "@/store/redux/features/searchSlice";
import { executeSearch } from "@/store/redux/features/searchThunk";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { MapView } from "@/types";

export function useSearchWithMap() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  // Redux state
  const {
    centers,
    activePin,
    userLocation,
    isLoading,
    mapView,
    searchTerm,
    error,
  } = useAppSelector((state) => state.search);

  // Local UI state
  const [isMapView, setIsMapView] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  // Get parameters from URL
  const getMapViewFromUrl = useCallback(() => {
    const centerParam = searchParams.get("center");
    const distanceParam = searchParams.get("distance");

    if (centerParam && distanceParam) {
      try {
        const [lat, lng] = centerParam.split(",").map(Number);
        const distance = Number(distanceParam);

        if (!isNaN(lat) && !isNaN(lng) && !isNaN(distance)) {
          return {
            center: { latitude: lat, longitude: lng },
            distance,
          };
        }
      } catch (error) {
        console.error("Failed to parse map parameters from URL:", error);
      }
    }

    return null;
  }, [searchParams]);

  const getSearchTermFromUrl = useCallback(() => {
    return searchParams.get("q") || "";
  }, [searchParams]);

  // Initial search setup
  useEffect(() => {
    if (isInitialLoadComplete) return;

    const queryParam = getSearchTermFromUrl();
    if (queryParam !== searchTerm) {
      dispatch(setSearchTerm(queryParam));
    }

    // Try to get map view from URL
    let initialMapView = getMapViewFromUrl();

    // Fall back to user location if needed
    if (!initialMapView && userLocation) {
      initialMapView = {
        center: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
        distance: 5, // Default radius in km
      };
    }

    // Set map view and execute search
    if (initialMapView) {
      dispatch(setMapView(initialMapView));

      dispatch(setLoading(true));
      dispatch(executeSearch({ forceUpdate: true }))
        .then(() => {
          setIsInitialLoadComplete(true);
          dispatch(setLoading(false));
        })
        .catch((err) => {
          console.error("Initial search failed:", err);
          dispatch(setError(err.message || "Search failed"));
          dispatch(setLoading(false));
          setIsInitialLoadComplete(true);
        });
    }
  }, [
    dispatch,
    searchTerm,
    userLocation,
    isInitialLoadComplete,
    getMapViewFromUrl,
    getSearchTermFromUrl,
  ]);

  // Update URL when map view changes
  const updateUrl = useCallback(
    (newMapView: MapView, newSearchTerm: string = searchTerm) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newSearchTerm) {
        params.set("q", newSearchTerm);
      } else {
        params.delete("q");
      }

      params.set(
        "center",
        `${newMapView.center.latitude},${newMapView.center.longitude}`
      );
      params.set("distance", newMapView.distance.toString());

      const newUrl = `${pathname}?${params.toString()}`;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router, searchTerm, searchParams]
  );

  // Handle map bounds change
  const handleBoundsChange = useCallback(
    (newMapView: MapView) => {
      dispatch(resetActiveStates());
      dispatch(setMapView(newMapView));

      updateUrl(newMapView);

      dispatch(setLoading(true));
      dispatch(executeSearch()).finally(() => {
        dispatch(setLoading(false));
      });
    },
    [dispatch, updateUrl]
  );

  // Handle search term change
  const handleSearchChange = useCallback(
    (term: string) => {
      dispatch(setSearchTerm(term));

      if (mapView) {
        updateUrl(mapView, term);

        dispatch(setLoading(true));
        dispatch(executeSearch()).finally(() => {
          dispatch(setLoading(false));
        });
      }
    },
    [dispatch, mapView, updateUrl]
  );

  // Toggle map/list view on mobile
  const toggleMapView = useCallback(() => {
    setIsMapView((prev) => !prev);
  }, []);

  // Handle screen size changes
  useEffect(() => {
    if (isLargeScreen && isMapView) {
      setIsMapView(false);
    }
  }, [isLargeScreen, isMapView]);

  // Manage body styles for map view on mobile
  useEffect(() => {
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

  return {
    // State
    centers,
    activePin,
    userLocation,
    isLoading,
    mapView,
    searchTerm,
    error,
    isMapView,
    isSearchDropdownOpen,
    isInitialLoadComplete,
    isLargeScreen,

    // Handlers
    setIsSearchDropdownOpen,
    toggleMapView,
    handleBoundsChange,
    handleSearchChange,

    // Actions
    setActivePin: (id: string | null) => dispatch(setActivePin(id)),
    resetActiveStates: () => dispatch(resetActiveStates()),
  };
}
