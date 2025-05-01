// lib/utils/geo.ts
import { SearchBounds } from "@/types";
import mapboxgl from "mapbox-gl";

/**
 * Calculate search bounds from center point and distance
 */
export function calculateBoundsFromCenter(
  center: { latitude: number; longitude: number },
  distance: number // in kilometers
): SearchBounds {
  // Approximate conversion from km to degrees
  // ~111km per degree of latitude
  const latOffset = distance / 111;

  // ~111km * cos(latitude) per degree of longitude at the equator,
  // but less as you move away from the equator
  const latRad = center.latitude * (Math.PI / 180);
  const lngOffset = distance / (111 * Math.cos(latRad));

  return {
    north: center.latitude + latOffset,
    south: center.latitude - latOffset,
    east: center.longitude + lngOffset,
    west: center.longitude - lngOffset,
    center: center,
    distance: distance,
  };
}

/**
 * Convert Mapbox bounds to our bounds format
 */
export function convertMapboxBoundsToBounds(
  bounds: mapboxgl.LngLatBounds
): SearchBounds {
  const northeast = bounds.getNorthEast();
  const southwest = bounds.getSouthWest();
  const center = bounds.getCenter();

  // Calculate approximate distance covered by the bounds
  // This is an approximation of the radius of the bounding box in km
  const centerLat = center.lat;
  const centerLng = center.lng;
  const northeastLat = northeast.lat;
  const northeastLng = northeast.lng;

  // Calculate using the Haversine formula for distance
  const latDistance = calculateDistance(
    centerLat,
    centerLng,
    northeastLat,
    centerLng
  );

  const lngDistance = calculateDistance(
    centerLat,
    centerLng,
    centerLat,
    northeastLng
  );

  // Use the larger of the two distances as an approximation for the radius
  const distance = Math.max(latDistance, lngDistance) * 2;

  return {
    north: northeast.lat,
    south: southwest.lat,
    east: northeast.lng,
    west: southwest.lng,
    center: {
      latitude: center.lat,
      longitude: center.lng,
    },
    distance: distance,
  };
}

/**
 * Calculate the distance between two points using the Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate zoom level from distance
 */
export function calculateZoomFromDistance(distance: number): number {
  // Inverse of the distance calculation in the map component
  // distance = 5 * Math.pow(2, 13 - zoom)
  // zoom = 13 - Math.log2(distance / 5)
  return 13 - Math.log2(distance / 5);
}

/**
 * Create a properly formatted search URL
 */
export function createSearchUrl({
  query,
  center,
  distance,
  sports,
  facilities,
}: {
  query?: string;
  center?: [number, number];
  distance?: number;
  sports?: string[];
  facilities?: string[];
}): string {
  // Create a URL object with the base search path
  const url = new URL("/search", window.location.origin);

  // Add search query if provided
  if (query) {
    url.searchParams.set("q", query);
  }

  // Add center coordinates if provided
  if (center && center.length === 2) {
    url.searchParams.set("center", `${center[0]},${center[1]}`);
  }

  // Add distance if provided
  if (distance) {
    url.searchParams.set("distance", distance.toString());
  }

  // Add sports filter if provided
  if (sports && sports.length > 0) {
    url.searchParams.set("sports", sports.join(","));
  }

  // Add facilities filter if provided
  if (facilities && facilities.length > 0) {
    url.searchParams.set("facilities", facilities.join(","));
  }

  return url.toString();
}
