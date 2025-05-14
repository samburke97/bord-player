// lib/api.ts
import { searchCenters } from "@/app/actions/search/searchCenters";
import type { Center } from "@/types";

export async function fetchCentersByBounds({
  bounds,
  searchTerm = "",
  signal, // This won't be used with server actions
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
    // Directly call the server action instead of making a fetch request
    return await searchCenters({
      bounds,
      searchTerm,
      // You can pass any other parameters needed by your server action
    });
  } catch (error: any) {
    console.error("Search error:", error);
    throw error;
  }
}
