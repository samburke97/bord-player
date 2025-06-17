"use server";

import { prisma, safePrismaQuery } from "@/lib/prisma";
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

  return safePrismaQuery(async () => {
    const centers = await prisma!.center.findMany({
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
  }, []); // Return empty array as fallback
}

// app/actions/centers/fetchCenter.ts
("use server");

import { prisma, safePrismaQuery } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

export async function fetchCenter(id: string) {
  noStore();

  return safePrismaQuery(async () => {
    const center = await prisma!.center.findFirst({
      where: {
        id,
        isActive: true,
        isDeleted: false,
      },
      include: {
        images: {
          select: { imageUrl: true },
          orderBy: { order: "asc" },
        },
        facilities: {
          select: {
            tag: {
              select: { id: true, name: true },
            },
          },
        },
        sportCenters: {
          select: {
            sport: {
              select: { id: true, name: true },
            },
          },
        },
        openingHours: {
          orderBy: { dayOfWeek: "asc" },
        },
        socials: true,
        links: {
          where: { type: "website" },
          take: 1,
        },
        activities: {
          include: {
            pricingVariants: true,
          },
          orderBy: { displayOrder: "asc" },
        },
        establishment: {
          select: { name: true },
        },
      },
    });

    if (!center) {
      return null;
    }

    return {
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
      type: center.establishment?.name || "Sports Center",
      images: center.images.map((img) => img.imageUrl),
      facilities: center.facilities.map((f) => ({
        id: f.tag.id,
        name: f.tag.name,
      })),
      sports: center.sportCenters.map((sc) => ({
        id: sc.sport.id,
        name: sc.sport.name,
      })),
      openingHours: center.openingHours.map((oh) => ({
        dayOfWeek: oh.dayOfWeek,
        isOpen: oh.isOpen,
        openTime: oh.openTime,
        closeTime: oh.closeTime,
      })),
      socials: center.socials || [],
      websiteUrl: center.links[0]?.url || null,
      activities: center.activities.map((activity) => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        imageUrl: activity.imageUrl,
        buttonTitle: activity.buttonTitle,
        buttonLink: activity.buttonLink,
        type: center.establishment?.name || "Activity",
        pricing: activity.pricingVariants.map((pv) => ({
          id: pv.id,
          price: Number(pv.price),
          playerType: pv.playerType,
          duration: pv.duration,
          priceType: pv.priceType,
        })),
      })),
    };
  }, null); // Return null as fallback
}
