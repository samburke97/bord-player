"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setUserLocation } from "@/store/redux/features/searchSlice";

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
  isLocationPromptVisible: boolean;
  retryBrowserLocation: () => void;
}

/**
 * Get user location with fallback strategies and location prompt
 */
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
    isLocationPromptVisible: false,
    retryBrowserLocation: () => {},
  });

  // Keep track of permission states
  const permissionRequestedRef = useRef(false);
  const permissionStateRef = useRef<PermissionState | null>(null);
  const ipFallbackAttemptedRef = useRef(false);

  const dispatch = useDispatch();

  // Function to check browser permission state
  const checkPermissionState = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({
          name: "geolocation" as PermissionName,
        });
        console.log("Geolocation permission state:", result.state);
        permissionStateRef.current = result.state;
        return result.state;
      }
    } catch (error) {
      console.error("Error checking permission state:", error);
    }
    return null;
  };

  // Try to get location from browser with proper permission handling
  const tryBrowserLocation = async () => {
    if (!navigator.geolocation) {
      console.log("Browser geolocation not supported, using IP");
      getLocationFromIP();
      return;
    }

    // Check permission state first
    const permissionState = await checkPermissionState();

    // If permission is already denied, go straight to IP fallback
    if (permissionState === "denied") {
      console.log("Geolocation permission already denied, using IP");
      getLocationFromIP();
      return;
    }

    // If we've already requested permission but it wasn't granted, don't ask again
    if (permissionRequestedRef.current && permissionState !== "granted") {
      console.log("Permission already requested but not granted, using IP");
      getLocationFromIP();
      return;
    }

    const geoOptions = {
      enableHighAccuracy: options.enableHighAccuracy || true,
      timeout: options.timeout || 10000,
      maximumAge: options.maximumAge || 60000,
    };

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      isLocationPromptVisible: false,
    }));

    console.log("Requesting browser geolocation...");
    permissionRequestedRef.current = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        console.log("✅ Browser geolocation successful:", userLocation);
        setState((prev) => ({
          ...prev,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          error: null,
          isLoading: false,
          locationSource: "browser",
          city: null,
          country: null,
          isLocationPromptVisible: false,
        }));

        if (saveToRedux) {
          dispatch(setUserLocation(userLocation));
        }
      },
      async (error) => {
        console.log("❌ Browser geolocation error:", error.message);

        // Check permission state again after error
        await checkPermissionState();

        getLocationFromIP();
      },
      geoOptions
    );
  };

  // Get location from IP using server-side API
  const getLocationFromIP = async () => {
    // Mark that we've attempted IP fallback
    ipFallbackAttemptedRef.current = true;

    try {
      console.log("Getting location from IP address...");
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        isLocationPromptVisible: false,
      }));

      // Call the server action to get IP-based location
      const response = await fetch("/api/geolocation");

      if (!response.ok) {
        throw new Error(`IP geolocation failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("📍 IP geolocation response:", data);

      if (!data.latitude || !data.longitude) {
        throw new Error("Invalid location data from IP");
      }

      const userLocation = {
        latitude: data.latitude,
        longitude: data.longitude,
      };

      console.log("✅ Using IP-based location:", userLocation);
      setState((prev) => ({
        ...prev,
        latitude: data.latitude,
        longitude: data.longitude,
        error: "Using approximate location based on your network",
        isLoading: false,
        locationSource: "ip",
        city: data.city || null,
        country: data.country || null,
        isLocationPromptVisible: false,
      }));

      if (saveToRedux) {
        dispatch(setUserLocation(userLocation));
      }
    } catch (error) {
      console.error("❌ IP Geolocation error:", error);
      setState((prev) => ({
        ...prev,
        latitude: null,
        longitude: null,
        error: "Unable to determine your location",
        isLoading: false,
        locationSource: null,
        city: null,
        country: null,
        isLocationPromptVisible: true,
      }));
    }
  };

  // Allow manually retrying browser location with a proper reset
  const retryBrowserLocation = () => {
    console.log("User clicked 'Enable Location' button, retrying...");

    // Reset permission requested flag to force a new permission request
    permissionRequestedRef.current = false;

    // Reset the prompt visibility and error first
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      isLocationPromptVisible: false,
    }));

    // Wait a bit before requesting to ensure UI updates
    setTimeout(() => {
      tryBrowserLocation();
    }, 100);
  };

  // Initialize location detection on component mount
  useEffect(() => {
    let isMounted = true;

    const initLocation = async () => {
      // First check permissions
      await checkPermissionState();

      // Then try browser location
      tryBrowserLocation();
    };

    initLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    ...state,
    retryBrowserLocation,
  };
}
