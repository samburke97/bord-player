"use server";

import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";
import type { SearchBounds } from "@/types";

interface SearchParams {
  searchTerm?: string;
  bounds: SearchBounds;
  sportIds?: string[];
  facilityIds?: string[];
}

/**
 * Server action to search for centers based on map bounds and filters
 */
export async function searchCenters({
  searchTerm = "",
  bounds,
  sportIds = [],
  facilityIds = [],
}: SearchParams) {
  noStore();

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
    const query: any = {
      where: {
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
      },
      // Include relations
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
        },
      },
    };

    // Add search term filter if provided
    if (searchTerm) {
      query.where.OR = [
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
      query.where.sportCenters = {
        some: {
          sportId: {
            in: sportIds,
          },
        },
      };
    }

    // Add facilities filter if provided
    if (facilityIds.length > 0) {
      query.where.facilities = {
        some: {
          tagId: {
            in: facilityIds,
          },
        },
      };
    }

    // Execute the query
    const centers = await prisma.center.findMany(query);

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
      isOpenNow: true, // This should be calculated if you have opening hours logic
      phone: center.phone,
      email: center.email,
      type: null,
      distance: 0, // This could be calculated based on user location in a future update
      openingHours: [],
      socials: [],
      links: [],
      activities: [],
    }));

    return transformedCenters;
  } catch (error) {
    console.error("Search centers error:", error);
    throw error;
  }
}
