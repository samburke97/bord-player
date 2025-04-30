// /app/hooks/useGeolocation.ts
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserLocation } from "@/store/features/searchSlice";

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
}

// Default location (London) if geolocation fails
const DEFAULT_LOCATION = {
  latitude: 51.5074,
  longitude: -0.1278,
};

export function useGeolocation(
  options: GeolocationOptions = {},
  saveToRedux = true
): UseGeolocationResult {
  const [state, setState] = useState<UseGeolocationResult>({
    latitude: null,
    longitude: null,
    error: null,
    isLoading: true,
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        latitude: DEFAULT_LOCATION.latitude,
        longitude: DEFAULT_LOCATION.longitude,
        error: "Geolocation is not supported by your browser",
        isLoading: false,
      });

      if (saveToRedux) {
        dispatch(setUserLocation(DEFAULT_LOCATION));
      }

      return;
    }

    const geoOptions = {
      enableHighAccuracy: options.enableHighAccuracy || false,
      timeout: options.timeout || 10000,
      maximumAge: options.maximumAge || 60000,
    };

    const onSuccess = (position: GeolocationPosition) => {
      const userLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setState({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        error: null,
        isLoading: false,
      });

      if (saveToRedux) {
        dispatch(setUserLocation(userLocation));
      }
    };

    const onError = (error: GeolocationPositionError) => {
      console.error("Geolocation error:", error);

      setState({
        latitude: DEFAULT_LOCATION.latitude,
        longitude: DEFAULT_LOCATION.longitude,
        error: error.message,
        isLoading: false,
      });

      if (saveToRedux) {
        dispatch(setUserLocation(DEFAULT_LOCATION));
      }
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, geoOptions);
  }, [
    dispatch,
    options.enableHighAccuracy,
    options.timeout,
    options.maximumAge,
    saveToRedux,
  ]);

  return state;
}
