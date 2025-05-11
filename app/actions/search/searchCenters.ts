// app/actions/searchCenters.ts
"use server";

import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";
import type { MapBounds } from "@/types/map";

interface SearchParams {
  bounds: MapBounds;
  searchTerm?: string;
  sportIds?: string[];
  facilityIds?: string[];
}

export async function searchCenters({
  bounds,
  searchTerm = "",
  sportIds = [],
  facilityIds = [],
}: SearchParams) {
  noStore(); // Disable caching for this dynamic data

  try {
    // Validate bounds
    if (
      !bounds ||
      !bounds.north ||
      !bounds.south ||
      !bounds.east ||
      !bounds.west
    ) {
      throw new Error("Invalid map bounds");
    }

    // Build prisma query
    const whereClause: any = {
      // Location filters using map bounds
      AND: [
        {
          latitude: {
            lte: bounds.north,
            gte: bounds.south,
          },
        },
        {
          longitude: {
            lte: bounds.east,
            gte: bounds.west,
          },
        },
      ],
      // Only show active and non-deleted centers
      isActive: true,
      isDeleted: false,
    };

    // Add search term filter if provided
    if (searchTerm) {
      whereClause.OR = [
        {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ];
    }

    // Add sports filter if provided
    if (sportIds.length > 0) {
      whereClause.sportCenters = {
        some: {
          sportId: {
            in: sportIds,
          },
        },
      };
    }

    // Add facilities filter if provided
    if (facilityIds.length > 0) {
      whereClause.facilities = {
        some: {
          tagId: {
            in: facilityIds,
          },
        },
      };
    }

    // Execute the query
    const centers = await prisma.center.findMany({
      where: whereClause,
      include: {
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        facilities: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
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
        },
        images: {
          select: {
            imageUrl: true,
            order: true,
          },
          orderBy: {
            order: "asc",
          },
          take: 5, // Limit to 5 images for performance
        },
      },
    });

    // Transform the result into the expected format
    const transformedCenters = centers.map((center) => ({
      id: center.id,
      name: center.name,
      address: center.address,
      latitude: center.latitude ? Number(center.latitude) : null,
      longitude: center.longitude ? Number(center.longitude) : null,
      logoUrl: center.logoUrl,
      description: center.description,
      // Format relations into the expected structure
      images: center.images.map((img) => img.imageUrl),
      sports: center.sportCenters.map((sc) => ({
        id: sc.sport.id,
        name: sc.sport.name,
      })),
      facilities: center.facilities.map((f) => ({
        id: f.tag.id,
        name: f.tag.name,
      })),
      tags: center.tags.map((t) => ({
        id: t.tag.id,
        name: t.tag.name,
      })),

      // Default values for other properties
      isActive: center.isActive,
      isOpenNow: true, // This would need a calculation with opening hours
      phone: center.phone,
      email: center.email,
      type: null,
      distance: null, // This would be calculated based on user location
    }));

    return transformedCenters;
  } catch (error) {
    console.error("Search centers error:", error);
    throw error;
  }
}
