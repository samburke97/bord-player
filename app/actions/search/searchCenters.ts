// app/actions/search/searchCenters.ts - Enhanced with thorough debugging
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

  // Log the function call
  console.log("🔍 searchCenters called with:", {
    searchTerm,
    bounds,
    sportIds,
    facilityIds,
  });

  // Validate bounds
  if (
    !bounds ||
    bounds.north === undefined ||
    bounds.south === undefined ||
    bounds.east === undefined ||
    bounds.west === undefined
  ) {
    console.error("❌ Invalid map bounds:", bounds);
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

    // Add search term condition if provided
    if (searchTerm && searchTerm.trim()) {
      const trimmedTerm = searchTerm.trim();
      console.log(`🔎 Adding search term filter: "${trimmedTerm}"`);

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
      console.log(`🏀 Adding sport filters:`, sportIds);
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
      console.log(`🏢 Adding facility filters:`, facilityIds);
      whereClause.AND.push({
        facilities: {
          some: {
            tagId: { in: facilityIds },
          },
        },
      });
    }

    // Log the query we're about to run
    console.log("🔍 Database query:", JSON.stringify(whereClause, null, 2));

    // Get total count first (for debugging)
    const totalCount = await prisma.center.count({
      where: { isActive: true, isDeleted: false },
    });
    console.log(`📊 Total active centers in database: ${totalCount}`);

    // Run a simplified query first to check if centers exist in the area
    const areaCount = await prisma.center.count({
      where: {
        latitude: {
          lte: bounds.north,
          gte: bounds.south,
        },
        longitude: {
          lte: bounds.east,
          gte: bounds.west,
        },
        isActive: true,
        isDeleted: false,
      },
    });
    console.log(`📊 Centers in the search area: ${areaCount}`);

    // If we have a search term, check how many match just that term
    if (searchTerm && searchTerm.trim()) {
      const termCount = await prisma.center.count({
        where: {
          OR: [
            { name: { contains: searchTerm.trim(), mode: "insensitive" } },
            {
              description: { contains: searchTerm.trim(), mode: "insensitive" },
            },
          ],
          isActive: true,
          isDeleted: false,
        },
      });
      console.log(`📊 Centers matching term "${searchTerm}": ${termCount}`);
    }

    // Now run the actual query
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

    console.log(`✅ Found ${centers.length} centers matching all criteria`);

    // If no centers found, log some debug info
    if (centers.length === 0) {
      console.log("⚠️ No centers found. Debugging details:");
      console.log("Search term:", searchTerm);
      console.log("Bounds:", bounds);

      // Check for any centers with "swimming" in their name (case insensitive)
      const swimmingCenters = await prisma.center.findMany({
        where: {
          name: { contains: "swim", mode: "insensitive" },
          isActive: true,
          isDeleted: false,
        },
        select: { id: true, name: true, latitude: true, longitude: true },
      });

      console.log(`📊 Centers with "swim" in name: ${swimmingCenters.length}`);
      if (swimmingCenters.length > 0) {
        console.log("Sample centers:", swimmingCenters.slice(0, 3));
      }
    }

    // Format the results
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

    console.log(`🏁 Returning ${formattedCenters.length} formatted centers`);

    return formattedCenters;
  } catch (error) {
    console.error("❌ Search error:", error);
    throw error;
  }
}
