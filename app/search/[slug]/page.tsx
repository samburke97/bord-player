"use client";

import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import debounce from "lodash/debounce";
import styles from "./Search.module.css";
import SearchItem from "@/app/ui/Search/SeachItem";
import SearchMap from "@/app/ui/Search/SearchMap";
import SearchBar from "@/app/ui/components/SearchBar/SearchBarClient";
import { Map1, TextalignJustifyleft } from "iconsax-react";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import {
  setUserLocation,
  fetchCentersByLocation,
  fetchCentersByBounds,
} from "@/store/features/searchSlice";
import LoadingIndicator from "../../ui/Search/LoadingIndicator";
import type { AppDispatch } from "@/store/store";
import type { RootState, MapBounds } from "@/app/types/types";

export default function Search({ params }: { params: { slug: string } }) {
  const dispatch = useDispatch<AppDispatch>();
  const { centers, activePin, userLocation, isLoading, view } = useSelector(
    (state: RootState) => state.search
  );

  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [isMapView, setIsMapView] = useState(false);
  const [initialBoundsFetched, setInitialBoundsFetched] = useState(false);
  const searchTerm = decodeURIComponent(params.slug);

  // Handle initial location and data fetch
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          dispatch(setUserLocation(location));
          // Only fetch by location if bounds haven't been fetched yet
          if (!initialBoundsFetched) {
            dispatch(
              fetchCentersByLocation({
                searchTerm,
                ...location,
                radius: 25,
              })
            );
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          const defaultLocation = {
            latitude: 51.5074,
            longitude: -0.1278,
          };
          dispatch(setUserLocation(defaultLocation));
          // Only fetch by location if bounds haven't been fetched yet
          if (!initialBoundsFetched) {
            dispatch(
              fetchCentersByLocation({
                searchTerm,
                ...defaultLocation,
                radius: 25,
              })
            );
          }
        }
      );
    }
  }, [dispatch, searchTerm, initialBoundsFetched]);

  useEffect(() => {
    const handleResize = () => {
      setIsMapView(false);
    };

    if (isLargeScreen) {
      handleResize();
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isLargeScreen]);

  const debouncedBoundsChange = useCallback(
    debounce((bounds: MapBounds) => {
      dispatch(fetchCentersByBounds({ bounds, searchTerm }));
    }, 300),
    [dispatch, searchTerm]
  );

  const handleBoundsChange = (bounds: MapBounds) => {
    if (!initialBoundsFetched) {
      setInitialBoundsFetched(true);
    }
    debouncedBoundsChange(bounds);
  };

  if (!userLocation && isLoading) {
    return <div>Getting your location...</div>;
  }

  return (
    <div className={styles.container}>
      <div
        className={
          isMapView && !isLargeScreen ? styles.navbarRight : styles.navbarLeft
        }
      >
        <SearchBar className={styles.searchBar} />
        {!isLargeScreen && (
          <button
            className={styles.mapToggleButton}
            onClick={() => setIsMapView(!isMapView)}
          >
            <div className={styles.icon}>
              {isMapView ? (
                <Map1 className={styles.iconImg} variant="Bold" />
              ) : (
                <TextalignJustifyleft
                  className={styles.iconImg}
                  variant="Bold"
                />
              )}
            </div>
          </button>
        )}
      </div>
      <div className={styles.contentContainer}>
        <div
          className={`${styles.leftPanel} ${
            isMapView && !isLargeScreen ? styles.hiddenOnSmallScreens : ""
          }`}
        >
          <SearchItem centers={centers} activePin={activePin} />
        </div>

        <div
          className={`${styles.rightPanel} ${
            !isMapView && !isLargeScreen ? styles.hiddenOnSmallScreens : ""
          }`}
        >
          {userLocation && (
            <SearchMap
              centers={centers}
              userLocation={userLocation}
              onBoundsChange={handleBoundsChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
