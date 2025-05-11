"use client";

import { useEffect } from "react";
import { Map1, TextalignJustifyleft } from "iconsax-react";
import { useSearchWithMap } from "@/hooks/useSearchWithMap";
import { useAppDispatch } from "@/store/hooks";
import { setActivePin } from "@/store/redux/features/searchSlice";

// UI Components
import RefinedSearchBar from "@/components/ui/SearchBar";
import SearchMap from "@/components/search/SearchMap";
import OptimizedSearchItem from "@/components/search/SearchItem";
import SearchItemSkeleton from "@/components/search/skeletons/SearchItemSkeleton";

// Styles
import styles from "./Search.module.css";

export default function SearchClient() {
  const dispatch = useAppDispatch();

  // Use our optimized hook for search and map state
  const {
    // State
    centers,
    activePin,
    userLocation,
    isLoading,
    mapView,
    searchTerm,
    isMapView,
    isSearchDropdownOpen,
    isLargeScreen,

    // Handlers
    setIsSearchDropdownOpen,
    toggleMapView,
    handleBoundsChange,
    handleSearchChange,
    resetActiveStates,
  } = useSearchWithMap();

  // Handle map click to reset active pin
  const handleMapClick = () => {
    resetActiveStates();
  };

  // Handle marker click
  const handleMarkerClick = (id: string) => {
    dispatch(setActivePin(id));
  };

  // Class names for container with responsive states
  const containerClassName = `
    ${styles.container} 
    ${isMapView && !isLargeScreen ? styles.mapViewActive : ""}
  `;

  // Navbar class based on view mode
  const navbarClassName =
    isMapView && !isLargeScreen ? styles.navbarMap : styles.navbarList;

  return (
    <div className={containerClassName}>
      {/* Navigation Bar */}
      <div className={navbarClassName}>
        {/* Search Bar */}
        <RefinedSearchBar
          className={styles.searchBar}
          onDropdownChange={setIsSearchDropdownOpen}
          initialSearchTerm={searchTerm || ""}
          onSearch={handleSearchChange}
        />

        {/* Mobile View Toggle */}
        {!isLargeScreen && !isSearchDropdownOpen && (
          <button
            className={styles.mapToggleButton}
            onClick={toggleMapView}
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
            {!userLocation || isLoading ? (
              <SearchItemSkeleton />
            ) : (
              <OptimizedSearchItem
                centers={centers}
                activePin={activePin}
                onCenterClick={handleMarkerClick}
              />
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
              isLoading={isLoading}
              initialCenter={[
                mapView.center.latitude,
                mapView.center.longitude,
              ]}
              initialDistance={mapView.distance}
              onBoundsChange={handleBoundsChange}
              onMarkerClick={handleMarkerClick}
              onMapClick={handleMapClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
