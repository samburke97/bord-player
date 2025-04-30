import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get most popular sports by center count
    const sports = await prisma.sport.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: [{ centerCount: "desc" }, { name: "asc" }],
      take: 10,
    });

    return NextResponse.json(
      sports.map((sport) => ({
        id: sport.id,
        name: sport.name,
        imageUrl: sport.imageUrl,
      }))
    );
  } catch (error) {
    console.error("Error getting popular sports:", error);
    return NextResponse.json(
      { error: "Failed to get popular sports" },
      { status: 500 }
    );
  }
}
