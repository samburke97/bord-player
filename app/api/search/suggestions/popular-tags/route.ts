import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get most popular tags
    const tags = await prisma.tag.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: [
        {
          groupTag: {
            _count: "desc",
          },
        },
        { name: "asc" },
      ],
      take: 10,
    });

    return NextResponse.json(
      tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        imageUrl: tag.imageUrl,
      }))
    );
  } catch (error) {
    console.error("Error getting popular tags:", error);
    return NextResponse.json(
      { error: "Failed to get popular tags" },
      { status: 500 }
    );
  }
}
