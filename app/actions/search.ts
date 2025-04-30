"use server";

import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
  center: {
    latitude: number;
    longitude: number;
  };
  distance: number;
}

interface SearchParams {
  searchTerm?: string;
  bounds: Bounds;
  limit?: number;
}

export async function searchCenters({
  searchTerm,
  bounds,
  limit = 100,
}: SearchParams) {
  noStore();

  console.log("Searching centers with bounds:", JSON.stringify(bounds));
  console.log("Search term:", searchTerm);

  try {
    // Build base query conditions
    const baseConditions = {
      isActive: true,
      isDeleted: false,
      // We'll filter by coordinates later to avoid type conversion issues
      latitude: { not: null },
      longitude: { not: null },
    };

    // Add search term condition if provided
    const searchConditions = searchTerm
      ? {
          OR: [
            {
              name: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              sportCenters: {
                some: {
                  sport: {
                    name: {
                      contains: searchTerm,
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
            {
              tags: {
                some: {
                  tag: {
                    name: {
                      contains: searchTerm,
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
          ],
        }
      : {};

    // Combine all conditions
    const whereConditions = {
      ...baseConditions,
      ...searchConditions,
    };

    // Execute the query with explicit selection of fields we need
    const centers = await prisma.center.findMany({
      where: whereConditions,
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
            order: true,
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
          take: 5,
        },
      },
      take: limit,
    });

    console.log(`Found ${centers.length} centers matching search criteria`);

    // Filter by bounds in JavaScript to avoid Decimal conversion issues
    const filteredCenters = centers.filter((center) => {
      if (!center.latitude || !center.longitude) return false;

      const lat = parseFloat(center.latitude.toString());
      const lng = parseFloat(center.longitude.toString());

      return (
        lat >= parseFloat(bounds.south.toString()) &&
        lat <= parseFloat(bounds.north.toString()) &&
        lng >= parseFloat(bounds.west.toString()) &&
        lng <= parseFloat(bounds.east.toString())
      );
    });

    console.log(`Filtered to ${filteredCenters.length} centers within bounds`);

    // Format data for frontend
    return filteredCenters.map((center) => {
      return {
        id: center.id,
        name: center.name,
        address: center.address || "",
        latitude: parseFloat(center.latitude.toString()),
        longitude: parseFloat(center.longitude.toString()),
        logoUrl: center.logoUrl || "/images/default-center.svg",
        images: center.images.map((img) => img.imageUrl),
        sports: center.sportCenters.map((sc) => ({
          id: sc.sport.id,
          name: sc.sport.name,
        })),
      };
    });
  } catch (error) {
    console.error("Error searching centers by bounds:", error);
    throw new Error("Failed to search centers by location");
  }
}
