"use client";

import { useState, useEffect } from "react";
import SearchItem from "@/app/ui/Search/SeachItem";
import SearchMap from "@/app/ui/Search/SearchMap";
import styles from "./Search.module.css";
import SearchBar from "@/app/ui/components/SearchBar/SearchBarClient";
import { Map1, TextalignJustifyleft } from "iconsax-react";

const SearchClient: React.FC<{ centers: any[] }> = ({ centers }) => {
  const [activePin, setActivePin] = useState<string | null>(null);
  const [isMapView, setIsMapView] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 1024);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    // Handle screen resize
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 1024);
      if (window.innerWidth > 1024) {
        setIsMapView(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  if (!userLocation) {
    // Optionally display a loading spinner or fallback UI while fetching the location
    return <div>Loading map...</div>;
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
          <div className={styles.scrollableContainer}>
            <SearchItem centers={centers} activePin={activePin} />
          </div>
        </div>

        <div
          className={`${styles.rightPanel} ${
            !isMapView && !isLargeScreen ? styles.hiddenOnSmallScreens : ""
          }`}
        >
          {/* Pass userLocation to SearchMap */}
          <SearchMap
            centers={centers}
            setActivePin={setActivePin}
            userLocation={userLocation}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchClient;
