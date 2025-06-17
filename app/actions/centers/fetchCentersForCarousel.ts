// app/actions/centers/fetchCentersForCarousel.ts
"use server";

import { withPrisma } from "@/lib/prisma-safe";
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

  return withPrisma(
    async (prisma) => {
      const centers = await prisma.center.findMany({
        where: {
          isActive: true,
          isDeleted: false,
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
          type === "recent" ? { createdAt: "desc" } : { createdAt: "desc" },
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
    },
    [], // Empty array fallback
    `fetchCentersForCarousel(${type})`
  );
}
