"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface LocationContextType {
  location: { latitude: number; longitude: number } | null;
  error: string | null;
  requestLocation: () => void;
}

// Create the context with a proper type
const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

/**
 * Provider component to fetch and provide user geolocation
 */
export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locationRequested, setLocationRequested] = useState(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser");
      setError("Geolocation is not supported by your browser.");
      return;
    }

    // Mark that we've requested location
    setLocationRequested(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);
      },
      (error) => {
        console.error(
          "LocationProvider: Error getting location:",
          error.code,
          error.message
        );

        let errorMessage = "An unknown error occurred.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "The request to get location timed out.";
            break;
        }

        setError(errorMessage);

        // Set a default fallback location (London)
        setLocation({
          latitude: 51.5074,
          longitude: -0.1278,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  useEffect(() => {
    if (!locationRequested) {
      requestLocation();
    }
  }, [locationRequested]);

  const contextValue: LocationContextType = {
    location,
    error,
    requestLocation,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
}

/**
 * Custom hook to access location context.
 * Returns a default safe fallback if the provider is not in the tree.
 */
export function useLocation(): LocationContextType {
  const context = useContext(LocationContext);

  if (context === undefined) {
    console.warn("useLocation hook used outside of LocationProvider!");
    return {
      location: null,
      error: "LocationProvider is missing in the component tree.",
      requestLocation: () => {
        console.warn("requestLocation called but LocationProvider is missing");
      },
    };
  }

  return context;
}
