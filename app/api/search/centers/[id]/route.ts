import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const center = await prisma.center.findUnique({
      where: {
        id,
        isDeleted: false,
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
        socials: true,
        links: true,
      },
    });

    if (!center) {
      return NextResponse.json({ error: "Center not found" }, { status: 404 });
    }

    // Transform the data
    const response = {
      id: center.id,
      name: center.name,
      address: center.address,
      description: center.description,
      highlights: center.highlights,
      logoUrl: center.logoUrl,
      latitude: center.latitude ? parseFloat(center.latitude.toString()) : null,
      longitude: center.longitude
        ? parseFloat(center.longitude.toString())
        : null,
      isActive: center.isActive,
      phone: center.phone,
      email: center.email,
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
      socials: center.socials,
      links: center.links,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error getting center:", error);
    return NextResponse.json(
      { error: "Failed to get center details" },
      { status: 500 }
    );
  }
}
