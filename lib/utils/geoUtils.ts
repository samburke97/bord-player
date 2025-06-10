// lib/utils/optimizedGeoUtils.ts
/**
 * A collection of optimized geospatial utility functions
 */

import type { Center, MapBounds, MapView } from "@/types";

/**
 * Haversine distance calculation between two points
 * @param lat1 - First point latitude
 * @param lon1 - First point longitude
 * @param lat2 - Second point latitude
 * @param lon2 - Second point longitude
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Convert to radians
  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = 6371 * c; // Earth's radius in km

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate map bounds from center and distance
 * @param center - Center coordinates
 * @param distance - Distance in kilometers
 * @returns Bounds object
 */
export function calculateBoundsFromCenter(
  center: { latitude: number; longitude: number },
  distance: number
): MapBounds {
  // Convert distance (km) to degrees
  // ~111km per degree of latitude
  const latOffset = distance / 111;

  // Longitude degrees vary based on latitude
  // ~111km * cos(latitude) per degree of longitude
  const lngOffset =
    distance / (111 * Math.cos(center.latitude * (Math.PI / 180)));

  return {
    north: center.latitude + latOffset,
    south: center.latitude - latOffset,
    east: center.longitude + lngOffset,
    west: center.longitude - lngOffset,
  };
}

/**
 * Calculate zoom level from distance
 * @param distance - Distance in kilometers
 * @returns Zoom level (0-22)
 */
export function calculateZoomFromDistance(distance: number): number {
  return 13 - Math.log2(distance / 5);
}

/**
 * Calculate distance from zoom level
 * @param zoom - Zoom level (0-22)
 * @returns Distance in kilometers
 */
export function calculateDistanceFromZoom(zoom: number): number {
  return 5 * Math.pow(2, 13 - zoom);
}

/**
 * Sort centers by distance from a point
 * @param centers - Array of centers
 * @param point - Reference point
 * @returns Centers sorted by distance
 */
export function sortCentersByDistance(
  centers: Center[],
  point: { latitude: number; longitude: number }
): Center[] {
  return [...centers].sort((a, b) => {
    if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) {
      return 0;
    }

    const distanceA = haversineDistance(
      point.latitude,
      point.longitude,
      Number(a.latitude),
      Number(a.longitude)
    );

    const distanceB = haversineDistance(
      point.latitude,
      point.longitude,
      Number(b.latitude),
      Number(b.longitude)
    );

    return distanceA - distanceB;
  });
}

/**
 * Filter centers within a given bounds
 * @param centers - Array of centers
 * @param bounds - Map bounds
 * @returns Centers within bounds
 */
export function filterCentersWithinBounds(
  centers: Center[],
  bounds: MapBounds
): Center[] {
  return centers.filter((center) => {
    if (!center.latitude || !center.longitude) {
      return false;
    }

    const lat = Number(center.latitude);
    const lng = Number(center.longitude);

    return (
      lat <= bounds.north &&
      lat >= bounds.south &&
      lng <= bounds.east &&
      lng >= bounds.west
    );
  });
}

/**
 * Create map view from bounds
 * @param bounds - Map bounds
 * @returns MapView object with bounds information
 */
export function createMapViewFromBounds(
  bounds: MapBounds
): MapView & MapBounds {
  // Calculate the center point
  const centerLat = (bounds.north + bounds.south) / 2;
  const centerLng = (bounds.east + bounds.west) / 2;

  // Calculate the approximate distance (radius in km)
  // Use the larger of latitude and longitude distances for distance
  const latDistance = ((bounds.north - bounds.south) * 111) / 2;
  const lngDistance =
    ((bounds.east - bounds.west) *
      111 *
      Math.cos(centerLat * (Math.PI / 180))) /
    2;
  const distance = Math.max(latDistance, lngDistance);

  return {
    center: {
      latitude: centerLat,
      longitude: centerLng,
    },
    distance,
    north: bounds.north,
    south: bounds.south,
    east: bounds.east,
    west: bounds.west,
  };
}

/**
 * Cluster markers based on proximity
 * @param centers - Centers to cluster
 * @param clusterRadius - Radius in kilometers
 * @returns Clustered centers with count property
 */
export function clusterMarkers(
  centers: Center[],
  clusterRadius: number = 0.5
): Array<Center & { count?: number }> {
  if (centers.length <= 1) return centers;

  const clusters: Array<Center & { count?: number }> = [];
  const processed = new Set<string>();

  centers.forEach((center) => {
    if (processed.has(center.id) || !center.latitude || !center.longitude)
      return;

    // Create a new cluster with this center as the anchor
    const clusteredCenter = {
      ...center,
      count: 1,
    };

    processed.add(center.id);

    // Find nearby centers to cluster
    centers.forEach((otherCenter) => {
      if (
        center.id === otherCenter.id ||
        processed.has(otherCenter.id) ||
        !otherCenter.latitude ||
        !otherCenter.longitude
      )
        return;

      const distance = haversineDistance(
        Number(center.latitude),
        Number(center.longitude),
        Number(otherCenter.latitude),
        Number(otherCenter.longitude)
      );

      if (distance <= clusterRadius) {
        clusteredCenter.count = (clusteredCenter.count || 1) + 1;
        processed.add(otherCenter.id);
      }
    });

    clusters.push(clusteredCenter);
  });

  return clusters;
}
