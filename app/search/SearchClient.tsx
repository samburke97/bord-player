// Simplified SearchClient.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
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
} from "@/store/features/searchSlice";
import { useGeolocation } from "@/hooks/useGeolocation";
import { searchCenters } from "@/app/actions/search/searchCenters";
import SearchMap from "@/components/search/SearchMap";
import SearchResults from "@/components/search/SearchResults";
import SearchBar from "@/components/ui/searchbar/SearchBar";
import IconButton from "@/components/ui/IconButton";
import type { MapView } from "@/types/map";
import styles from "./Search.module.css";

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
  const [mapRendered, setMapRendered] = useState(false);

  // Get user location
  const {
    latitude,
    longitude,
    error: locationError,
    isLoading: locationLoading,
  } = useGeolocation();

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

  // React directly to URL parameter changes
  useEffect(() => {
    // Get search parameters
    const qParam = searchParams.get("q");
    const centerParam = searchParams.get("center");
    const distanceParam = searchParams.get("distance");

    // Update search term in Redux state
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

          // Calculate bounds
          const bounds = {
            north: lat + distance / 111,
            south: lat - distance / 111,
            east: lng + distance / (111 * Math.cos(lat * (Math.PI / 180))),
            west: lng - distance / (111 * Math.cos(lat * (Math.PI / 180))),
          };

          // Execute search with current parameters
          dispatch(setLoading(true));
          searchCenters({
            bounds,
            searchTerm: qParam || "",
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
      } catch (error) {
        console.error("Failed to parse map parameters from URL:", error);
      }
    } else if (latitude && longitude) {
      // Fall back to user location if no map parameters
      const initialMapView = {
        center: { latitude, longitude },
        distance: 5, // Default radius
      };

      dispatch(setMapView(initialMapView));
      updateUrl(initialMapView, qParam || "");
    }
  }, [searchParams, dispatch, searchTerm, latitude, longitude]);

  // Update URL with current view state
  const updateUrl = useCallback(
    (newMapView: MapView, newSearchTerm = searchTerm) => {
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

      // Construct and update URL - always use push
      const newUrl = `${pathname}?${params.toString()}`;
      router.push(newUrl);
    },
    [pathname, router, searchTerm]
  );

  // Handle map bounds change
  const handleBoundsChange = useCallback(
    (newMapView: MapView) => {
      dispatch(resetActiveStates());
      dispatch(setMapView(newMapView));
      updateUrl(newMapView);
    },
    [dispatch, updateUrl]
  );

  // Handle search term change
  const handleSearchChange = useCallback(
    (term: string) => {
      if (mapView) {
        updateUrl(mapView, term);
      }
    },
    [mapView, updateUrl]
  );

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
            />
          </div>

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
