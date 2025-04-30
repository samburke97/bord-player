import type { MapView } from "@/types";
import type { Center } from "@prisma/client";
import type { LngLatBounds } from "mapbox-gl";

/**
 * Fetches centers based on map bounds, search term and filters
 */
export async function fetchCentersByBounds({
  bounds,
  searchTerm = "",
  sportIds,
  facilityIds,
  signal, // Optional AbortSignal for fetch
}: {
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  searchTerm?: string;
  sportIds?: string[];
  facilityIds?: string[];
  signal?: AbortSignal;
}): Promise<Center[]> {
  try {
    // Build URL with search parameters
    const params = new URLSearchParams();
    if (searchTerm) params.append("q", searchTerm);
    params.append("north", bounds.north.toString());
    params.append("south", bounds.south.toString());
    params.append("east", bounds.east.toString());
    params.append("west", bounds.west.toString());

    // Add sport and facility filters if provided
    if (sportIds && sportIds.length) {
      params.append("sports", sportIds.join(","));
    }

    if (facilityIds && facilityIds.length) {
      params.append("facilities", facilityIds.join(","));
    }

    const url = `/api/search?${params.toString()}`;
    const fetchOptions: RequestInit = {};

    if (signal) {
      fetchOptions.signal = signal;
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`Failed to fetch centers: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    if (error.name === "AbortError") {
      return [];
    }
    console.error("Fetch error:", error);
    throw error;
  }
}

/**
 * Calculates bounds from center point and distance
 */
export function calculateBoundsFromCenter(
  center: { latitude: number; longitude: number },
  distance: number
): {
  north: number;
  south: number;
  east: number;
  west: number;
} {
  const lat = center.latitude;
  const lng = center.longitude;

  // Roughly convert distance (km) to degrees
  // ~111km per degree of latitude
  // ~111km * cos(latitude) per degree of longitude
  const latOffset = distance / 111;
  const lngOffset = distance / (111 * Math.cos(lat * (Math.PI / 180)));

  return {
    north: lat + latOffset,
    south: lat - latOffset,
    east: lng + lngOffset,
    west: lng - lngOffset,
  };
}

/**
 * Converts Mapbox LngLatBounds to our bounds format
 */
export function convertMapboxBoundsToBounds(mapBounds: LngLatBounds): {
  north: number;
  south: number;
  east: number;
  west: number;
} {
  const ne = mapBounds.getNorthEast();
  const sw = mapBounds.getSouthWest();

  return {
    north: ne.lat,
    south: sw.lat,
    east: ne.lng,
    west: sw.lng,
  };
}

/**
 * Constructs a search URL from parameters
 */
export function buildSearchUrl({
  pathname,
  searchTerm,
  mapView,
  sportIds,
  facilityIds,
}: {
  pathname: string;
  searchTerm?: string;
  mapView?: MapView;
  sportIds?: string[];
  facilityIds?: string[];
}): string {
  const params = new URLSearchParams();

  // Add search term if provided
  if (searchTerm) {
    params.set("q", searchTerm);
  }

  // Add map parameters if provided
  if (mapView) {
    params.set(
      "center",
      `${mapView.center.latitude},${mapView.center.longitude}`
    );
    params.set("distance", mapView.distance.toString());
  }

  // Add sport IDs if provided
  if (sportIds && sportIds.length) {
    params.set("sports", sportIds.join(","));
  }

  // Add facility IDs if provided
  if (facilityIds && facilityIds.length) {
    params.set("facilities", facilityIds.join(","));
  }

  return `${pathname}?${params.toString()}`;
}

export function calculateZoomFromDistance(distance: number): number {
  // Inverse of the distance calculation in the map component
  return 13 - Math.log2(distance / 5);
}
