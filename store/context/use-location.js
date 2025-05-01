"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Define the shape of the context
const LocationContext = createContext(undefined);

/**
 * Provider component to fetch and provide user geolocation.
 */
export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError("Location permission denied.");
            break;
          case error.POSITION_UNAVAILABLE:
            setError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setError("The request to get location timed out.");
            break;
          default:
            setError("An unknown error occurred.");
        }
      }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ location, error, requestLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

/**
 * Custom hook to access location context.
 * Returns a default safe fallback if the provider is not in the tree.
 */
export function useLocation() {
  const context = useContext(LocationContext);

  if (context === undefined) {
    return {
      location: null,
      error: "LocationProvider is missing in the component tree.",
      requestLocation: () => {},
    };
  }

  return context;
}
