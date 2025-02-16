"use client";

import { useState, useEffect } from "react";
import SearchItem from "@/app/ui/Search/SeachItem";
import SearchMap from "@/app/ui/Search/SearchMap";
import { searchCenters } from "@/app/lib/actions/centerActions";
import styles from "./Search.module.css";
import SearchBar from "@/app/ui/components/SearchBar/SearchBarClient";
import { Map1, TextalignJustifyleft } from "iconsax-react";
import { Center } from "@/app/lib/definitions";

interface SearchClientProps {
  searchTerm: string;
}

const SearchClient: React.FC<SearchClientProps> = ({ searchTerm }) => {
  // State to store the list of sports centers retrieved from the API
  // Represents all centers that match the current search criteria
  const [centers, setCenters] = useState<Center[]>([]);

  // State to track which center's pin is currently selected/active on the map
  // Allows highlighting a specific center and showing its details
  const [activePin, setActivePin] = useState<string | null>(null);

  // State to control the view toggle between map and list on small screens
  // Determines whether the map or list view is currently visible
  const [isMapView, setIsMapView] = useState(false);

  // State to determine if the current screen width is considered "large"
  // Used for responsive design to adjust layout and interaction
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // State to store the user's current geographical location
  // Used for proximity-based search when no specific map bounds are set
  // Defaults to null, will be populated by browser geolocation
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // State to indicate the current loading status of data retrieval
  // Shows loading indicators while fetching centers from the API
  const [loading, setLoading] = useState(true);

  // State to define the search radius for finding nearby centers
  // Determines how far from the user's location to search for centers
  // Default is 25 (likely kilometers)
  const [searchRadius, setSearchRadius] = useState(25);

  // State to store the current map's geographical bounds
  // Allows searching for centers within a specific rectangular area
  // When null, falls back to location-based search
  const [mapBounds, setMapBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 1024);
      if (window.innerWidth > 1024) setIsMapView(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get user location
  useEffect(() => {
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
          // Fall back to default location (e.g., London)
          setUserLocation({
            latitude: 51.5074,
            longitude: -0.1278,
          });
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchCenters = async () => {
      // Skip if no user location
      if (!userLocation) return;

      setLoading(true);
      try {
        let centers: Center[];

        if (mapBounds) {
          // Bounds search
          centers = await searchCenters({
            searchTerm,
            north: mapBounds.north,
            south: mapBounds.south,
            east: mapBounds.east,
            west: mapBounds.west,
          });
        } else {
          // Location search
          centers = await searchCenters({
            searchTerm,
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            radius: searchRadius,
          });
        }

        setCenters(centers);
      } catch (error) {
        console.error("Error fetching centers:", error);
        setCenters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, [searchTerm, userLocation, mapBounds, searchRadius]);

  // Add handleBoundsChange method
  const handleBoundsChange = (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => {
    setMapBounds(bounds);
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
          <SearchItem centers={centers} activePin={activePin} />
        </div>
        <div
          className={`${styles.rightPanel} ${
            !isMapView && !isLargeScreen ? styles.hiddenOnSmallScreens : ""
          }`}
        >
          <SearchMap
            centers={centers}
            setActivePin={setActivePin}
            userLocation={userLocation}
            onBoundsChange={handleBoundsChange}
            searchTerm={searchTerm}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchClient;
