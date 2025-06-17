// app/actions/search/fetchSearchResults.tsx
"use server";

import { withPrisma } from "@/lib/prisma-safe";
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

  return withPrisma(
    async (prisma) => {
      // Normalize the search query to improve matching
      const searchTerm = query.toLowerCase();

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
    },
    {
      tags: [],
      sports: [],
      centers: [],
      query,
    }, // Fallback empty results
    `fetchSearchResults(${query})`
  );
}
