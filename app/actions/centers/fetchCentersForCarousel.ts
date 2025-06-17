// app/actions/centers/fetchCentersForCarousel.ts
"use server";

import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

interface CarouselParams {
  type: "recent" | "popular";
  limit?: number;
}

export async function fetchCentersForCarousel({
  type,
  limit = 12,
}: CarouselParams) {
  noStore();

  try {
    // Check if we're in a build environment without database access
    if (!process.env.DATABASE_URL) {
      console.warn("No database URL available, returning empty array");
      return [];
    }

    // Check if Prisma is available
    if (!prisma) {
      console.warn("Prisma client not available, returning empty array");
      return [];
    }

    // Test database connection
    await prisma.$connect();

    const centers = await prisma.center.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        // Add conditions based on type
        ...(type === "recent" ? {} : {}), // You can add specific conditions here
      },
      include: {
        images: {
          select: { imageUrl: true },
          orderBy: { order: "asc" },
          take: 1,
        },
        sportCenters: {
          select: {
            sport: {
              select: { id: true, name: true },
            },
          },
          take: 3,
        },
        facilities: {
          select: {
            tag: {
              select: { id: true, name: true },
            },
          },
          take: 3,
        },
      },
      orderBy:
        type === "recent" ? { createdAt: "desc" } : { createdAt: "desc" }, // You can change this to popularity metric
      take: limit,
    });

    return centers.map((center) => ({
      id: center.id,
      name: center.name,
      address: center.address,
      imageUrl: center.images[0]?.imageUrl || null,
      sports: center.sportCenters.map((sc) => ({
        id: sc.sport.id,
        name: sc.sport.name,
      })),
      facilities: center.facilities.map((f) => ({
        id: f.tag.id,
        name: f.tag.name,
      })),
      isActive: center.isActive,
    }));
  } catch (error) {
    console.error(`Error fetching ${type} centers:`, error);

    // Return empty array instead of throwing
    return [];
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.warn("Error disconnecting from database:", disconnectError);
    }
  }
}
