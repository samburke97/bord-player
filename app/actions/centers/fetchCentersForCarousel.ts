import { prisma } from "@/lib/prisma";
import { CenterSummary } from "@/types";

/**
 * Fetch centers for carousel display with optimized data shape
 */
export async function fetchCentersForCarousel(options: {
  type: "recent" | "popular" | "bySport" | "all";
  limit?: number;
  sportId?: string;
}): Promise<CenterSummary[]> {
  // Skip during build - more aggressive check
  if (!process.env.DATABASE_URL || process.env.SKIP_ENV_VALIDATION) {
    return [];
  }

  const { type = "recent", limit = 16, sportId } = options;

  // Base query conditions
  const baseWhere = {
    isActive: true,
    isDeleted: false,
  };

  // Add type-specific conditions
  let where: any = { ...baseWhere };
  let orderBy: any = { createdAt: "desc" }; // Default sort by newest

  switch (type) {
    case "recent":
      // Already sorted by createdAt desc
      break;

    case "popular":
      orderBy = [{ sportCenters: { _count: "desc" } }, { createdAt: "desc" }];
      break;

    case "bySport":
      if (sportId) {
        where = {
          ...where,
          sportCenters: {
            some: {
              sportId: sportId,
            },
          },
        };
      }
      break;
  }

  try {
    const centers = await prisma.center.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        images: {
          orderBy: {
            order: "asc",
          },
          take: 1,
        },
        facilities: {
          include: {
            tag: true,
          },
          take: 3,
        },
        sportCenters: {
          include: {
            sport: true,
          },
          take: 3,
        },
      },
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
    console.error("Error fetching centers for carousel:", error);
    return [];
  }
}
