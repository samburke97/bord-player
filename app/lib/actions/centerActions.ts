"use server";

import { Center } from "@/app/lib/definitions";
import { fetchCentersByBounds } from "../data/centers/fetchCentersByBounds";
import { fetchCentersByLocation } from "../data/centers/fetchCentersByLocation";

// Interface for bounds-based search
interface BoundsSearch {
  searchTerm: string;
  north: number;
  south: number;
  east: number;
  west: number;
}

// Interface for location-based search
interface LocationSearch {
  searchTerm: string;
  latitude: number;
  longitude: number;
  radius?: number;
}

// Server action to search centers
export async function searchCenters(
  params: BoundsSearch | LocationSearch
): Promise<Center[]> {
  try {
    if ("north" in params) {
      // Bounds search
      return await fetchCentersByBounds(params.searchTerm, {
        north: params.north,
        south: params.south,
        east: params.east,
        west: params.west,
      });
    } else {
      // Location search
      return await fetchCentersByLocation(
        params.searchTerm,
        params.latitude,
        params.longitude,
        params.radius || 25
      );
    }
  } catch (error) {
    console.error("Error searching centers:", error);
    return [];
  }
}
