// app/hooks/useUrlSync.ts
import { useCallback, useRef, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { MapView } from "@/types";

/**
 * Hook for synchronizing map state with URL parameters
 */
export function useUrlSync() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track the last search term to detect changes
  const lastSearchTermRef = useRef<string | null>(null);

  /**
   * Update URL with map view without triggering navigation
   */
  const updateUrlFromMapView = useCallback(
    (mapView: MapView) => {
      if (!mapView || !mapView.center) return;

      // Clear any existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce URL updates to prevent excessive history entries
      debounceTimerRef.current = setTimeout(() => {
        // Create a new URLSearchParams to build the query string
        const params = new URLSearchParams(searchParams.toString());

        // Set map parameters with proper precision
        params.set(
          "center",
          `${mapView.center.latitude.toFixed(
            6
          )},${mapView.center.longitude.toFixed(6)}`
        );
        params.set("distance", mapView.distance.toFixed(2));

        // Update URL without navigation
        const newUrl = `${pathname}?${params.toString()}`;
        window.history.replaceState(null, "", newUrl);

        debounceTimerRef.current = null;
      }, 250);
    },
    [pathname, searchParams]
  );

  /**
   * Update search term with full navigation (to force state reset)
   */
  const updateSearchTerm = useCallback(
    (term: string) => {
      if (term === lastSearchTermRef.current) return;

      // Clone current params
      const params = new URLSearchParams(searchParams.toString());

      if (term) {
        params.set("q", term);
      } else {
        params.delete("q");
      }

      // Use router.push to force a full navigation
      router.push(`${pathname}?${params.toString()}`);

      // Update last search term
      lastSearchTermRef.current = term;
    },
    [pathname, router, searchParams]
  );

  /**
   * Extract MapView parameters from URL
   */
  const getMapViewFromUrl = useCallback(() => {
    const centerParam = searchParams.get("center");
    const distanceParam = searchParams.get("distance");

    if (centerParam && distanceParam) {
      try {
        const [lat, lng] = centerParam.split(",").map(parseFloat);
        const distance = parseFloat(distanceParam);

        if (!isNaN(lat) && !isNaN(lng) && !isNaN(distance)) {
          return {
            center: { latitude: lat, longitude: lng },
            distance,
          };
        }
      } catch (error) {
        console.error("Failed to parse map parameters from URL:", error);
      }
    }

    return null;
  }, [searchParams]);

  /**
   * Get search parameters from URL
   */
  const getSearchParams = useCallback(() => {
    const currentTerm = searchParams.get("q") || "";

    // Update reference to track changes
    lastSearchTermRef.current = currentTerm;

    return {
      searchTerm: currentTerm,
      sportIds: searchParams.get("sports")?.split(",") || [],
      facilityIds: searchParams.get("facilities")?.split(",") || [],
    };
  }, [searchParams]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    updateUrlFromMapView,
    updateSearchTerm,
    getMapViewFromUrl,
    getSearchParams,
  };
}
