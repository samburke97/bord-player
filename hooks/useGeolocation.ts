// hooks/useGeolocation.ts
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserLocation } from "@/store/features/searchSlice";
import { getGeolocation } from "@/app/actions/geolocation/getLocation";

export function useGeolocation() {
  const dispatch = useDispatch();
  const [state, setState] = useState({
    latitude: null as number | null,
    longitude: null as number | null,
    error: null as string | null,
    isLoading: true,
    // Only show our custom prompt if browser permission was denied
    showLocationHelp: false,
  });

  useEffect(() => {
    let isMounted = true;

    const getUserLocation = async () => {
      // Try browser geolocation first - this triggers the native browser prompt
      if (navigator.geolocation) {
        try {
          navigator.geolocation.getCurrentPosition(
            // Success handler - user clicked "Allow"
            (position) => {
              if (!isMounted) return;

              const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };

              setState((prev) => ({
                ...prev,
                latitude: location.latitude,
                longitude: location.longitude,
                error: null,
                isLoading: false,
                showLocationHelp: false,
              }));

              dispatch(setUserLocation(location));
            },

            // Error handler - user clicked "Block" or other error
            async (error) => {
              console.log("Browser geolocation error:", error.message);

              // Check if it was a permission denied error specifically
              const permissionDenied = error.code === error.PERMISSION_DENIED;

              // Fall back to IP geolocation
              try {
                const ipLocation = await getGeolocation();

                if (!isMounted) return;

                if (ipLocation.latitude && ipLocation.longitude) {
                  const location = {
                    latitude: ipLocation.latitude,
                    longitude: ipLocation.longitude,
                  };

                  setState((prev) => ({
                    ...prev,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    error: "Using approximate location",
                    isLoading: false,
                    showLocationHelp: permissionDenied, // Only show help if they denied permission
                  }));

                  dispatch(setUserLocation(location));
                } else {
                  setState((prev) => ({
                    ...prev,
                    error: "Unable to determine your location",
                    isLoading: false,
                    showLocationHelp: true,
                  }));
                }
              } catch (ipError) {
                if (!isMounted) return;

                setState((prev) => ({
                  ...prev,
                  error: "Unable to determine your location",
                  isLoading: false,
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
          console.error("Geolocation error:", error);
          // Fall back to IP geolocation
          // [... similar fallback code as above ...]
        }
      } else {
        // Browser doesn't support geolocation - fall back to IP
        // [... IP geolocation code as in previous answer ...]
      }
    };

    getUserLocation();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return {
    ...state,
    // This helps users understand how to enable location in their browser settings
    showBrowserSettings: () => {
      setState((prev) => ({
        ...prev,
        showLocationHelp: true,
      }));
    },
  };
}
