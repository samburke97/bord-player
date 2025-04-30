import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { calculateDistance } from "@/app/utils/geo";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query") || "";
  const center = searchParams.get("center");
  const distance = searchParams.get("distance");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const sports = searchParams.get("sports")?.split(",") || [];
  const facilities = searchParams.get("facilities")?.split(",") || [];
  const tags = searchParams.get("tags")?.split(",") || [];

  let latitude: number | undefined;
  let longitude: number | undefined;
  let distanceKm: number | undefined;

  if (center) {
    const [lat, lng] = center.split(",").map(Number);
    if (!isNaN(lat) && !isNaN(lng)) {
      latitude = lat;
      longitude = lng;
    }
  }

  if (distance) {
    const dist = parseFloat(distance);
    if (!isNaN(dist)) {
      distanceKm = dist;
    }
  }

  try {
    // Build base query with filters
    const baseQuery: Prisma.CenterFindManyArgs = {
      where: {
        isActive: true,
        isDeleted: false,
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                {
                  tags: {
                    some: {
                      tag: { name: { contains: query, mode: "insensitive" } },
                    },
                  },
                },
                {
                  sportCenters: {
                    some: {
                      sport: { name: { contains: query, mode: "insensitive" } },
                    },
                  },
                },
              ],
            }
          : {}),
        ...(sports.length > 0
          ? {
              sportCenters: {
                some: {
                  sport: { name: { in: sports, mode: "insensitive" } },
                },
              },
            }
          : {}),
        ...(facilities.length > 0
          ? {
              facilities: {
                some: {
                  tag: { name: { in: facilities, mode: "insensitive" } },
                },
              },
            }
          : {}),
        ...(tags.length > 0
          ? {
              tags: {
                some: {
                  tag: { name: { in: tags, mode: "insensitive" } },
                },
              },
            }
          : {}),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        facilities: {
          include: {
            tag: true,
          },
        },
        sportCenters: {
          include: {
            sport: true,
          },
        },
        images: true,
        openingHours: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: "asc" },
    };

    // Get total count for pagination
    const totalCount = await prisma.center.count({
      where: baseQuery.where,
    });

    // Get centers
    const centers = await prisma.center.findMany(baseQuery);

    // Transform data for response
    const items = centers.map((center) => ({
      id: center.id,
      name: center.name,
      address: center.address,
      description: center.description,
      logoUrl: center.logoUrl,
      latitude: center.latitude ? parseFloat(center.latitude.toString()) : null,
      longitude: center.longitude
        ? parseFloat(center.longitude.toString())
        : null,
      isActive: center.isActive,
      // Calculate distance if coordinates provided
      ...(latitude &&
        longitude &&
        center.latitude &&
        center.longitude && {
          distance: calculateDistance(
            latitude,
            longitude,
            parseFloat(center.latitude.toString()),
            parseFloat(center.longitude.toString())
          ),
        }),
      tags: center.tags.map((t) => ({
        id: t.tag.id,
        name: t.tag.name,
        imageUrl: t.tag.imageUrl,
      })),
      facilities: center.facilities.map((f) => ({
        id: f.tag.id,
        name: f.tag.name,
        imageUrl: f.tag.imageUrl,
      })),
      sports: center.sportCenters.map((s) => ({
        id: s.sport.id,
        name: s.sport.name,
        imageUrl: s.sport.imageUrl,
      })),
      images: center.images
        .map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          order: img.order,
        }))
        .sort((a, b) => a.order - b.order),
      openingHours: center.openingHours,
    }));

    // Sort by distance if coordinates provided
    if (latitude && longitude) {
      items.sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
    }

    // Filter by distance if specified
    const filteredItems = distanceKm
      ? items.filter(
          (item) => item.distance !== undefined && item.distance <= distanceKm
        )
      : items;

    return NextResponse.json({
      items: filteredItems,
      totalCount: filteredItems.length,
      hasMore: page * limit < totalCount,
    });
  } catch (error) {
    console.error("Error searching centers:", error);
    return NextResponse.json(
      { error: "Failed to search centers" },
      { status: 500 }
    );
  }
}
