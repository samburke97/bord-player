"use client";

import { useEffect, useState, useCallback } from "react";
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
import SearchBar from "@/components/ui/searchbar/SearchBar";
import type { MapView } from "@/types/map";
import styles from "./Search.module.css";

export default function SearchClient() {
  // Core hooks
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const urlSearchParams = useSearchParams();

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
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router, searchTerm, urlSearchParams]
  );

  // Handle map bounds change
  const handleBoundsChange = useCallback(
    (newMapView: MapView) => {
      dispatch(resetActiveStates());
      dispatch(setMapView(newMapView));

      updateUrl(newMapView);

      // Calculate bounds from mapView
      const bounds = {
        north:
          newMapView.north ||
          newMapView.center.latitude + newMapView.distance / 111,
        south:
          newMapView.south ||
          newMapView.center.latitude - newMapView.distance / 111,
        east:
          newMapView.east ||
          newMapView.center.longitude +
            newMapView.distance /
              (111 * Math.cos((newMapView.center.latitude * Math.PI) / 180)),
        west:
          newMapView.west ||
          newMapView.center.longitude -
            newMapView.distance /
              (111 * Math.cos((newMapView.center.latitude * Math.PI) / 180)),
      };

      dispatch(setLoading(true));
      searchCenters({
        bounds,
        searchTerm,
      })
        .then((results) => {
          dispatch(setCenters(results));
          dispatch(setLoading(false));
        })
        .catch((error) => {
          console.error("Search error:", error);
          dispatch(setError("Search failed"));
          dispatch(setLoading(false));
        });
    },
    [dispatch, searchTerm, updateUrl]
  );

  const handleSearchChange = useCallback(
    (term: string) => {
      dispatch(setSearchTerm(term));

      if (mapView) {
        updateUrl(mapView, term);

        // Calculate bounds
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
        };

        dispatch(setLoading(true));
        searchCenters({
          bounds,
          searchTerm: term,
        })
          .then((results) => {
            dispatch(setCenters(results));
            dispatch(setLoading(false));
          })
          .catch((error) => {
            console.error("Search error:", error);
            dispatch(setError("Search failed"));
            dispatch(setLoading(false));
          });
      }
    },
    [dispatch, mapView, updateUrl]
  );

  // Initialize with user location if needed
  useEffect(() => {
    if (!isInitialized && !mapView && latitude && longitude) {
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
      };

      // Search with initial location
      dispatch(setLoading(true));
      searchCenters({
        bounds,
        searchTerm,
      })
        .then((results) => {
          dispatch(setCenters(results));
          dispatch(setLoading(false));
        })
        .catch((error) => {
          console.error("Search error:", error);
          dispatch(setError("Search failed"));
          dispatch(setLoading(false));
        });
    }
  }, [
    dispatch,
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
          <div className={styles.resultsList}>
            <SearchResults
              centers={centers}
              isLoading={isLoading}
              activePin={activePin}
              searchTerm={searchTerm}
              onCenterClick={handleCenterClick}
              onCenterHover={handleCenterHover}
            />
          </div>
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
