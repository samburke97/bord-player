"use client";

import { useState, useEffect, useCallback, Suspense, type FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import debounce from "lodash/debounce";
import { Map1, TextalignJustifyleft } from "iconsax-react";
import styles from "./Search.module.css";
import SearchItem from "@/app/ui/search/SeachItem";
import SearchItemSkeleton from "@/app/ui/search/Skeletons/SearchItemSkeleton";
import { SearchMap } from "@/app/ui/search/SearchMap";
import SearchBar from "@/app/ui/components/SearchBar/SearchBarClient";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import {
  setUserLocation,
  fetchCentersByBounds,
} from "@/store/features/searchSlice";
import type { AppDispatch } from "@/store/store";
import type { RootState, MapBounds } from "@/app/types/index.ts";

interface SearchProps {
  params: {
    slug: string;
  };
}

const Search: FC<SearchProps> = ({ params }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { centers, activePin, userLocation, isLoading } = useSelector(
    (state: RootState) => state.search
  );

  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [isMapView, setIsMapView] = useState(false);
  const searchTerm = decodeURIComponent(params.slug);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          dispatch(setUserLocation(location));
        },
        (error) => {
          console.error("Geolocation error:", error);
          dispatch(
            setUserLocation({
              latitude: 51.5074,
              longitude: -0.1278,
            })
          );
        }
      );
    }
  }, [dispatch]);

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
    debouncedBoundsChange(bounds);
  };

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
          <div className={styles.leftPanelInner}>
            <Suspense fallback={<SearchItemSkeleton />}>
              {!userLocation || isLoading ? (
                <SearchItemSkeleton />
              ) : (
                <SearchItem centers={centers} activePin={activePin} />
              )}
            </Suspense>
          </div>
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
};

export default Search;
