// app/api/centers/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Skip if no database available
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    const center = await prisma.center.findUnique({
      where: {
        id: params.id,
        isActive: true,
        isDeleted: false,
      },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        facilities: {
          include: { tag: true },
        },
        tags: {
          include: { tag: true },
        },
        sportCenters: {
          include: { sport: true },
        },
        openingHours: {
          orderBy: { dayOfWeek: "asc" },
        },
        establishment: true,
        socials: true,
        links: true,
        activities: {
          include: {
            activity: {
              include: {
                pricingVariants: true,
                activityType: true,
              },
            },
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!center) {
      return NextResponse.json({ error: "Center not found" }, { status: 404 });
    }

    // Transform data (copy from your fetchCenterById)
    const now = new Date();
    const currentDay = now.getDay();
    const currentDayIndex = currentDay === 0 ? 6 : currentDay - 1;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeString = `${currentHour
      .toString()
      .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

    const todayHours = center.openingHours.find(
      (oh) => oh.dayOfWeek === currentDayIndex
    );
    const isOpenNow =
      todayHours?.isOpen &&
      todayHours.openTime <= currentTimeString &&
      todayHours.closeTime > currentTimeString;

    const transformedCenter = {
      id: center.id,
      name: center.name,
      address: center.address,
      description: center.description,
      latitude: center.latitude ? Number(center.latitude) : null,
      longitude: center.longitude ? Number(center.longitude) : null,
      logoUrl: center.logoUrl,
      phone: center.phone,
      email: center.email,
      isActive: center.isActive,
      isOpenNow: isOpenNow ?? false,
      type: center.establishment?.name || null,
      images: center.images.map((img) => img.imageUrl),
      facilities: center.facilities.map((f) => ({
        id: f.tag.id,
        name: f.tag.name,
        imageUrl: f.tag.imageUrl || null,
      })),
      sports: center.sportCenters.map((sc) => ({
        id: sc.sport.id,
        name: sc.sport.name,
      })),
      tags: center.tags.map((t) => ({
        id: t.tag.id,
        name: t.tag.name,
      })),
      socials: center.socials.map((social) => ({
        id: social.id,
        platform: social.platform || "",
        url: social.url || "",
      })),
      links: center.links.map((link) => ({
        id: link.id,
        type: link.type || "",
        url: link.url || "",
      })),
      activities: center.activities.map((ca) => ({
        id: ca.activity.id,
        title: ca.activity.title,
        description: ca.activity.description || "",
        imageUrl: ca.activity.imageUrl || "",
        buttonTitle: ca.activity.buttonTitle || "Learn More",
        buttonLink: ca.activity.buttonLink || "",
        type: ca.activity.activityType?.name || "",
        displayOrder: ca.displayOrder,
        pricing: ca.activity.pricingVariants.map((p) => ({
          id: p.id,
          price: Number(p.price),
          playerType: p.playerType,
          duration: p.duration || null,
          priceType: p.priceType,
        })),
      })),
      openingHours: center.openingHours.map((oh) => ({
        dayOfWeek: oh.dayOfWeek,
        isOpen: oh.isOpen,
        openTime: oh.openTime,
        closeTime: oh.closeTime,
        isToday: oh.dayOfWeek === currentDayIndex,
      })),
    };

    return NextResponse.json(transformedCenter);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
