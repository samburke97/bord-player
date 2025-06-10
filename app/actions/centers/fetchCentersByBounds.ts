// app/actions/search.ts
"use server";

import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";
import type { MapBounds } from "@/types/map";

// Define the interface for search parameters
interface SearchCentersParams {
  searchTerm?: string;
  bounds: MapBounds;
  limit?: number;
}

// Define the return type for search results
interface SearchCenterResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  logoUrl: string;
  images: string[];
  sports: Array<{
    id: string;
    name: string;
  }>;
}

export async function searchCenters({
  searchTerm,
  bounds,
  limit = 100,
}: SearchCentersParams): Promise<SearchCenterResult[]> {
  noStore();

  console.log("SEARCH TERM:", searchTerm);
  console.log("BOUNDS:", JSON.stringify(bounds));

  try {
    // Debug: First get all active centers to see what's available
    const allActiveCenters = await prisma.center.count({
      where: {
        isActive: true,
        isDeleted: false,
      },
    });

    console.log(`Total active centers in database: ${allActiveCenters}`);

    // Handle case-insensitive search for 'Golf' which may appear in different forms
    const normalizedSearchTerm = searchTerm?.toLowerCase() || "";

    // Build our search query
    const searchQuery = await prisma.center.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        OR: [
          // Direct center name match
          {
            name: {
              contains: searchTerm || "",
              mode: "insensitive",
            },
          },
          // Match centers linked to a sport with matching name
          {
            sportCenters: {
              some: {
                sport: {
                  name: {
                    contains: searchTerm || "",
                    mode: "insensitive",
                  },
                },
              },
            },
          },
          // Match centers with a related tag containing the search term
          {
            tags: {
              some: {
                tag: {
                  name: {
                    contains: searchTerm || "",
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        logoUrl: true,
        images: {
          select: {
            imageUrl: true,
          },
          orderBy: {
            order: "asc",
          },
          take: 5,
        },
        sportCenters: {
          select: {
            sport: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          take: 10,
        },
      },
      take: limit,
    });

    console.log(
      `Found ${searchQuery.length} centers matching search term: ${searchTerm}`
    );

    // Filter by bounds with defensive coding
    const filteredCenters = searchQuery.filter((center) => {
      if (!center.latitude || !center.longitude) {
        return false;
      }

      try {
        const lat = parseFloat(center.latitude.toString());
        const lng = parseFloat(center.longitude.toString());

        // Use more permissive bounds checking with slight buffer (0.01 degrees ≈ 1km)
        return (
          lat >= bounds.south - 0.01 &&
          lat <= bounds.north + 0.01 &&
          lng >= bounds.west - 0.01 &&
          lng <= bounds.east + 0.01
        );
      } catch (error) {
        console.error("Error parsing coordinates for center:", center.id);
        return false;
      }
    });

    console.log(`Filtered to ${filteredCenters.length} centers within bounds`);

    // Format response for frontend
    const formattedCenters: SearchCenterResult[] = filteredCenters.map(
      (center) => ({
        id: center.id,
        name: center.name,
        address: center.address || "",
        latitude: parseFloat(center.latitude?.toString() || "0"),
        longitude: parseFloat(center.longitude?.toString() || "0"),
        logoUrl: center.logoUrl || "/images/default-center.svg",
        images: center.images.map((img) => img.imageUrl),
        sports: center.sportCenters.map((sc) => ({
          id: sc.sport.id,
          name: sc.sport.name,
        })),
      })
    );

    return formattedCenters;
  } catch (error) {
    console.error("Error searching centers:", error);
    return [];
  }
}
