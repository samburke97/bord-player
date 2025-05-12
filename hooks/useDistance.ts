// hooks/useDistance.ts
"use client";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/store";
import { calculateDistance } from "@/lib/utils/distance";

/**
 * Custom hook to calculate distance between user location and a target location
 * Only calculates distance when user has provided precise location permission
 *
 * @param targetLat - Target latitude
 * @param targetLng - Target longitude
 * @returns An object containing the calculated distance and loading/error states
 */
export function useDistance(
  targetLat: number | null,
  targetLng: number | null
) {
  const userLocation = useAppSelector((state) => state.search.userLocation);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    // Handle target coordinates not provided
    if (targetLat === null || targetLng === null) {
      setError("Target coordinates not provided");
      setLoading(false);
      return;
    }

    // Only calculate distance if we have precise location
    if (userLocation && userLocation.isPrecise && targetLat && targetLng) {
      try {
        const calculatedDistance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          targetLat,
          targetLng
        );
        setDistance(calculatedDistance);
        setError(null);
      } catch (err) {
        setError("Error calculating distance");
        console.error("Distance calculation error:", err);
      }
    } else {
      setDistance(null);
      if (!userLocation) {
        setError("User location not available");
      } else if (!userLocation.isPrecise) {
        setError("Precise location not available");
      }
    }

    setLoading(false);
  }, [userLocation, targetLat, targetLng]);

  return { distance, loading, error };
}
