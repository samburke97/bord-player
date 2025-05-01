"use client";

import { useState, useEffect } from "react";
import { useLocation } from "@/store/use-location";
import { calculateDistance } from "@/lib/utils/distance";

/**
 * Custom hook to calculate distance between user location and a target location
 *
 * @param targetLat - Target latitude
 * @param targetLng - Target longitude
 * @returns An object containing the calculated distance and loading/error states
 */

export function useDistance(
  targetLat: number | null,
  targetLng: number | null
) {
  const { location, error: locationError } = useLocation();
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset loading state when dependencies change
    setLoading(true);

    // Handle target coordinates not provided
    if (targetLat === null || targetLng === null) {
      setError("Target coordinates not provided");
      setLoading(false);
      return;
    }

    // Handle location error
    if (locationError) {
      setError(locationError);
      setLoading(false);
      return;
    }

    // Calculate distance if we have both user location and target coordinates
    if (location && targetLat && targetLng) {
      try {
        const calculatedDistance = calculateDistance(
          location.latitude,
          location.longitude,
          targetLat,
          targetLng
        );
        setDistance(calculatedDistance);
        setError(null);
      } catch (err) {
        setError("Error calculating distance");
        console.error("Distance calculation error:", err);
      } finally {
        setLoading(false);
      }
    } else if (location === null && !locationError) {
      // Still waiting for location
      setLoading(true);
    }
  }, [location, targetLat, targetLng, locationError]);

  return { distance, loading, error };
}
