"use server";

import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface SearchParams {
  searchTerm?: string;
  bounds: Bounds;
  sportIds?: string[];
  facilityIds?: string[];
  limit?: number;
}

export async function searchCenters({
  searchTerm = "",
  bounds,
  sportIds = [],
  facilityIds = [],
  limit = 100,
}: SearchParams) {
  noStore();

  console.log("🔍 Server action searchCenters called with:", {
    searchTerm: searchTerm || "[EMPTY]",
    bounds,
    sportIds,
    facilityIds,
  });

  try {
    // Build the where conditions based on search term and bounds
    const whereConditions: any = {
      isActive: true,
      isDeleted: false,
      latitude: { not: null },
      longitude: { not: null },
      latitude: {
        gte: bounds.south,
        lte: bounds.north,
      },
      longitude: {
        gte: bounds.west,
        lte: bounds.east,
      },
    };

    if (searchTerm && searchTerm.trim() !== "") {
      whereConditions.OR = [
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
      ];
    }

    // Fetch centers based on the filters, directly from the database
    const centers = await prisma.center.findMany({
      where: whereConditions,
      include: {
        images: {
          orderBy: {
            order: "asc",
          },
          take: 5,
        },
        sportCenters: {
          include: {
            sport: true,
          },
          take: 5,
        },
      },
      take: limit,
    });

    console.log(`📋 Found ${centers.length} centers`);

    // Format for frontend
    const formattedCenters = centers.map((center) => ({
      id: center.id,
      name: center.name,
      address: center.address,
      latitude: parseFloat(center.latitude.toString()),
      longitude: parseFloat(center.longitude.toString()),
      logoUrl: center.logoUrl || "/images/default-center.svg",
      images: center.images.map((img) => img.imageUrl),
      sports: center.sportCenters.map((sc) => ({
        id: sc.sport.id,
        name: sc.sport.name,
      })),
    }));

    return formattedCenters;
  } catch (error) {
    console.error("❌ Error in searchCenters server action:", error);
    return [];
  }
}
