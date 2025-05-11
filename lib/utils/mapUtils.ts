// lib/utils/mapUtils.ts
import mapboxgl from "mapbox-gl";
import type { MapView, MapBounds } from "@/types";

/**
 * Calculates zoom level from distance in km
 * @param distance - Distance in kilometers
 * @returns Zoom level (0-22)
 */
export function calculateZoomFromDistance(distance: number): number {
  // Inverse of the distance calculation
  // distance = 5 * Math.pow(2, 13 - zoom)
  return 13 - Math.log2(distance / 5);
}

/**
 * Calculates distance in km from zoom level
 * @param zoom - Zoom level (0-22)
 * @returns Approximate distance in kilometers
 */
export function calculateDistanceFromZoom(zoom: number): number {
  return 5 * Math.pow(2, 13 - zoom);
}

/**
 * Converts MapView to mapboxgl.LngLatBoundsLike for use with fitBounds
 * @param mapView - MapView object
 * @returns Bounds object compatible with mapboxgl
 */
export function mapViewToBounds(mapView: MapView): mapboxgl.LngLatBoundsLike {
  // If explicit bounds are provided, use them
  if (mapView.north && mapView.south && mapView.east && mapView.west) {
    return [
      [mapView.west, mapView.south], // Southwest corner
      [mapView.east, mapView.north], // Northeast corner
    ];
  }

  // Otherwise calculate from center and distance
  const latOffset = mapView.distance / 111; // ~111km per degree latitude
  const lngOffset =
    mapView.distance /
    (111 * Math.cos(mapView.center.latitude * (Math.PI / 180)));

  return [
    [mapView.center.longitude - lngOffset, mapView.center.latitude - latOffset],
    [mapView.center.longitude + lngOffset, mapView.center.latitude + latOffset],
  ];
}

/**
 * Converts mapboxgl bounds to our app's MapBounds format
 * @param bounds - mapboxgl.LngLatBounds
 * @returns MapBounds object
 */
export function convertMapboxBoundsToBounds(
  bounds: mapboxgl.LngLatBounds
): MapBounds & {
  center: { latitude: number; longitude: number };
  distance: number;
} {
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  const center = bounds.getCenter();

  // Estimate the distance (in km) covered by the bounding box
  const latitudeDiff = ne.lat - sw.lat;
  const longitudeDiff = ne.lng - sw.lng;

  // Use the larger of the two dimensions to approximate the radius in km
  const latDistance = latitudeDiff * 111; // ~111 km per degree of latitude
  const lngDistance =
    longitudeDiff * 111 * Math.cos(center.lat * (Math.PI / 180));
  const distance = Math.max(latDistance, lngDistance) / 2;

  return {
    north: ne.lat,
    south: sw.lat,
    east: ne.lng,
    west: sw.lng,
    center: {
      latitude: center.lat,
      longitude: center.lng,
    },
    distance,
  };
}

/**
 * Marker clustering function
 * @param centers - Array of centers
 * @param clusterRadius - Radius in pixels for clustering
 * @param zoom - Current zoom level
 * @returns Clustered centers
 */
export function clusterMarkers(
  centers: any[],
  clusterRadius: number,
  zoom: number
) {
  if (!centers.length) return [];

  // Skip clustering at high zoom levels
  if (zoom >= 15) return centers;

  const clusters: any[] = [];
  const processed = new Set();

  // Process each center
  centers.forEach((center, idx) => {
    if (processed.has(idx) || !center.latitude || !center.longitude) return;

    const cluster = {
      id: center.id,
      latitude: Number(center.latitude),
      longitude: Number(center.longitude),
      count: 1,
      centers: [center],
    };

    processed.add(idx);

    // Adjust cluster radius based on zoom level
    const effectiveRadius = clusterRadius * Math.pow(2, 15 - zoom);

    // Find nearby centers to cluster
    centers.forEach((otherCenter, otherIdx) => {
      if (
        idx === otherIdx ||
        processed.has(otherIdx) ||
        !otherCenter.latitude ||
        !otherCenter.longitude
      )
        return;

      const distance = calculateDistance(
        cluster.latitude,
        cluster.longitude,
        Number(otherCenter.latitude),
        Number(otherCenter.longitude)
      );

      if (distance <= effectiveRadius) {
        cluster.count++;
        cluster.centers.push(otherCenter);
        processed.add(otherIdx);
      }
    });

    clusters.push(cluster);
  });

  return clusters;
}

/**
 * Calculate distance between two points in kilometers
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns Distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
