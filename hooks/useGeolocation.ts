// hooks/useGeolocation.ts
import { useState, useEffect } from "react";
import { useAppDispatch } from "@/store/store";
import { setUserLocation } from "@/store/features/searchSlice";

export function useGeolocation() {
  const dispatch = useAppDispatch();
  const [state, setState] = useState({
    latitude: null as number | null,
    longitude: null as number | null,
    isPrecise: false,
    error: null as string | null,
    isLoading: true,
    showLocationHelp: false,
  });

  useEffect(() => {
    let isMounted = true;

    const getIpLocation = async () => {
      try {
        console.log("Attempting to get location from IP...");
        // IP geolocation API call
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        if (!isMounted) return;

        if (data.latitude && data.longitude) {
          console.log("IP location retrieved:", data);
          const location = {
            latitude: data.latitude,
            longitude: data.longitude,
            isPrecise: false,
          };

          setState((prev) => ({
            ...prev,
            latitude: location.latitude,
            longitude: location.longitude,
            isPrecise: false,
            error: "Using approximate location",
            isLoading: false,
          }));

          dispatch(setUserLocation(location));
        } else {
          throw new Error("IP location data is invalid");
        }
      } catch (error) {
        console.error("IP geolocation error:", error);
        if (!isMounted) return;
        setState((prev) => ({
          ...prev,
          error: "Unable to determine your location",
          isLoading: false,
          showLocationHelp: true,
        }));
      }
    };

    const getUserLocation = async () => {
      if (navigator.geolocation) {
        try {
          navigator.geolocation.getCurrentPosition(
            // Success handler - user granted permission
            (position) => {
              if (!isMounted) return;
              console.log("Precise location retrieved:", position.coords);

              const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                isPrecise: true,
              };

              setState({
                latitude: location.latitude,
                longitude: location.longitude,
                isPrecise: true,
                error: null,
                isLoading: false,
                showLocationHelp: false,
              });

              dispatch(setUserLocation(location));
            },

            // Error handler - permission denied or other error
            async (error) => {
              console.log(
                "Geolocation permission error:",
                error.code,
                error.message
              );

              // Check if it was a permission denied error specifically
              const permissionDenied = error.code === error.PERMISSION_DENIED;

              // Fall back to IP geolocation
              await getIpLocation();

              if (isMounted && permissionDenied) {
                setState((prev) => ({
                  ...prev,
                  showLocationHelp: true,
                }));
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 60000,
            }
          );
        } catch (error) {
          console.error("Geolocation API error:", error);
          if (isMounted) {
            await getIpLocation();
          }
        }
      } else {
        // Browser doesn't support geolocation
        console.log("Geolocation not supported by this browser");
        if (isMounted) {
          await getIpLocation();
        }
      }
    };

    getUserLocation();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return {
    ...state,
    // Helper function to show browser settings instructions
    showBrowserSettings: () => {
      setState((prev) => ({
        ...prev,
        showLocationHelp: true,
      }));
    },
  };
}
