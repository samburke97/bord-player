"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserLocation } from "@/store/features/searchSlice";
import { getLocation } from "@/app/actions/geolocation/getLocation";

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

interface UseGeolocationResult {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isLoading: boolean;
  locationSource: "browser" | "ip" | null;
  city: string | null;
  country: string | null;
}

export function useGeolocation(
  options: GeolocationOptions = {},
  saveToRedux = true
): UseGeolocationResult {
  const [state, setState] = useState<UseGeolocationResult>({
    latitude: null,
    longitude: null,
    error: null,
    isLoading: true,
    locationSource: null,
    city: null,
    country: null,
  });

  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;

    // Helper function to fetch location from IP using server action
    const getLocationFromIP = async () => {
      try {
        console.log("Getting IP-based location");

        // Call the server action to get location
        const data = await getLocation();

        console.log("IP geolocation response:", data);

        if (!data.latitude || !data.longitude) {
          throw new Error("Invalid location data");
        }

        if (isMounted) {
          const userLocation = {
            latitude: data.latitude,
            longitude: data.longitude,
            source: "ip",
          };

          console.log("Using IP-based location:", userLocation);
          setState({
            latitude: data.latitude,
            longitude: data.longitude,
            error: "Using approximate location based on your network",
            isLoading: false,
            locationSource: "ip",
            city: data.city,
            country: data.country,
          });

          if (saveToRedux) {
            dispatch(setUserLocation(userLocation));
          }
        }
      } catch (error) {
        console.error("IP Geolocation error:", error);
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            error: "Unable to determine your location",
            isLoading: false,
          }));
        }
      }
    };

    // First try browser geolocation
    if (!navigator.geolocation) {
      console.log("Browser geolocation not supported, using IP");
      getLocationFromIP();
      return;
    }

    const geoOptions = {
      enableHighAccuracy: options.enableHighAccuracy || false,
      timeout: options.timeout || 10000,
      maximumAge: options.maximumAge || 60000,
    };

    const onSuccess = (position: GeolocationPosition) => {
      if (!isMounted) return;

      const userLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        source: "browser",
      };

      console.log("Using browser geolocation:", userLocation);
      setState({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        error: null,
        isLoading: false,
        locationSource: "browser",
        city: null,
        country: null,
      });

      if (saveToRedux) {
        dispatch(setUserLocation(userLocation));
      }
    };

    const onError = (error: GeolocationPositionError) => {
      console.log("Browser geolocation error:", error.message);
      getLocationFromIP();
    };

    console.log("Trying browser geolocation first");
    navigator.geolocation.getCurrentPosition(onSuccess, onError, geoOptions);

    return () => {
      isMounted = false;
    };
  }, [
    dispatch,
    options.enableHighAccuracy,
    options.timeout,
    options.maximumAge,
    saveToRedux,
  ]);

  return state;
}
