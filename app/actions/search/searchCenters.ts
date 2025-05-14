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
  noStore();

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

  try {
    // Create base conditions
    let whereClause: any = {
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
        { isActive: true },
        { isDeleted: false },
      ],
    };

    if (searchTerm && searchTerm.trim()) {
      const trimmedTerm = searchTerm.trim();
      whereClause.AND.push({
        OR: [
          { name: { contains: trimmedTerm, mode: "insensitive" } },
          { description: { contains: trimmedTerm, mode: "insensitive" } },
          {
            sportCenters: {
              some: {
                sport: {
                  name: { contains: trimmedTerm, mode: "insensitive" },
                },
              },
            },
          },
          {
            facilities: {
              some: {
                tag: {
                  name: { contains: trimmedTerm, mode: "insensitive" },
                },
              },
            },
          },
        ],
      });
    }

    // Add sport filters if provided
    if (sportIds.length > 0) {
      whereClause.AND.push({
        sportCenters: {
          some: {
            sportId: { in: sportIds },
          },
        },
      });
    }

    // Add facility filters if provided
    if (facilityIds.length > 0) {
      whereClause.AND.push({
        facilities: {
          some: {
            tagId: { in: facilityIds },
          },
        },
      });
    }

    // Run the query
    const centers = await prisma.center.findMany({
      where: whereClause,
      include: {
        images: {
          select: { imageUrl: true },
          orderBy: { order: "asc" },
          take: 5,
        },
        sportCenters: {
          select: {
            sport: {
              select: { id: true, name: true, imageUrl: true },
            },
          },
          take: 10,
        },
        facilities: {
          select: {
            tag: {
              select: { id: true, name: true, imageUrl: true },
            },
          },
        },
      },
    });

    // Transform centers to match the expected format
    const formattedCenters = centers.map((center) => ({
      id: center.id,
      name: center.name,
      address: center.address || null,
      description: center.description || null,
      latitude: parseFloat(center.latitude?.toString() || "0"),
      longitude: parseFloat(center.longitude?.toString() || "0"),
      logoUrl: center.logoUrl || "/images/default-center.svg",
      phone: center.phone || null,
      email: center.email || null,
      isActive: center.isActive !== undefined ? center.isActive : true,
      isOpenNow: false,
      type: null,
      locationNotice: undefined,
      images: center.images.map((img) => img.imageUrl),
      sports: center.sportCenters.map((sc) => ({
        id: sc.sport.id,
        name: sc.sport.name,
        imageUrl: sc.sport.imageUrl || null,
      })),
      facilities: center.facilities.map((f) => ({
        id: f.tag.id,
        name: f.tag.name,
        imageUrl: f.tag.imageUrl || null,
      })),
      tags: [],
      openingHours: [],
      socials: [],
      links: [],
      activities: [],
    }));

    return formattedCenters;
  } catch (error) {
    console.error("Search centers error:", error);
    throw error;
  }
}
