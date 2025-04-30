"use server";

import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

export async function fetchSearchResults(query: string) {
  noStore();

  if (!query || query.length < 2) {
    return {
      tags: [],
      sports: [],
      centers: [],
      query,
    };
  }

  // Normalize the search query to improve matching
  const searchTerm = `%${query.toLowerCase()}%`;

  try {
    // Perform parallel queries to different tables with proper filtering
    const [tags, sports, centers] = await Promise.all([
      // Fetch matching tags with limit
      prisma.tag.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive", // Case-insensitive search
          },
          isDeleted: false,
        },
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
        take: 5, // Limit results per category
      }),

      // Fetch matching sports with limit
      prisma.sport.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
          isDeleted: false,
        },
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
        take: 5,
      }),

      // Fetch matching centers with limit
      prisma.center.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
          isActive: true,
          isDeleted: false,
        },
        select: {
          id: true,
          name: true,
          logoUrl: true,
        },
        take: 5,
      }),
    ]);

    // Return structured results
    return {
      tags,
      sports,
      centers,
      query,
    };
  } catch (error) {
    console.error("Search error:", error);
    throw new Error("Failed to perform search");
  }
}
