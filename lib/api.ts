import { searchCenters } from "@/app/actions/search/searchCenters";
import type { Center } from "@/types";

export async function fetchCentersByBounds({
  bounds,
  searchTerm = "",
  signal,
}: {
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  searchTerm?: string;
  signal?: AbortSignal;
}): Promise<Center[]> {
  try {
    return await searchCenters({
      bounds,
      searchTerm,
    });
  } catch (error: any) {
    console.error("Search error:", error);
    throw error;
  }
}
