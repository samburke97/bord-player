// lib/api/centers.ts
import { Center, SearchApiParams } from "@/types";

/**
 * Search for centers based on map bounds, search term and filters
 */
export async function searchCenters({
  bounds,
  searchTerm = "",
  filters = {},
  signal,
}: SearchApiParams): Promise<Center[]> {
  try {
    // Build URL with search parameters
    const params = new URLSearchParams();

    // Add search term if provided
    if (searchTerm) params.append("q", searchTerm);

    // Add bounds parameters
    params.append("north", bounds.north.toString());
    params.append("south", bounds.south.toString());
    params.append("east", bounds.east.toString());
    params.append("west", bounds.west.toString());

    // Add sport and facility filters if provided
    if (filters.sports && filters.sports.length) {
      params.append("sports", filters.sports.join(","));
    }

    if (filters.facilities && filters.facilities.length) {
      params.append("facilities", filters.facilities.join(","));
    }

    if (filters.tags && filters.tags.length) {
      params.append("tags", filters.tags.join(","));
    }

    // Log the search request
    console.log(
      `API Request: Searching with term "${searchTerm}" and bounds:`,
      bounds
    );

    const url = `/api/search?${params.toString()}`;
    const fetchOptions: RequestInit = {};

    if (signal) {
      fetchOptions.signal = signal;
    }

    // Execute the fetch request
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(
        `Search API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(`API Response: Received ${data.length} centers`);

    return data;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("API request aborted");
      return [];
    }
    console.error("API error:", error);
    throw error;
  }
}

/**
 * Fetch a single center by ID
 */
export async function fetchCenterById(id: string): Promise<Center | null> {
  try {
    const response = await fetch(`/api/centers/${id}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch center: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching center ${id}:`, error);
    return null;
  }
}
