import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query") || "";

  if (!query || query.length < 2) {
    return NextResponse.json({ tags: [], sports: [] });
  }

  try {
    // Get tags matching query
    const tags = await prisma.tag.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
        isDeleted: false,
      },
      take: 5,
      orderBy: { name: "asc" },
    });

    // Get sports matching query
    const sports = await prisma.sport.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
        isDeleted: false,
      },
      take: 5,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      tags: tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        imageUrl: tag.imageUrl,
      })),
      sports: sports.map((sport) => ({
        id: sport.id,
        name: sport.name,
        imageUrl: sport.imageUrl,
      })),
    });
  } catch (error) {
    console.error("Error getting suggestions:", error);
    return NextResponse.json(
      { error: "Failed to get suggestions" },
      { status: 500 }
    );
  }
}
