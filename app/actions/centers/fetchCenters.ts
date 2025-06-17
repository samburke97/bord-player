// app/actions/centers/fetchCenter.ts
"use server";

import { withPrisma } from "@/lib/prisma-safe";
import { unstable_noStore as noStore } from "next/cache";

export async function fetchCenter(id: string) {
  noStore();

  return withPrisma(
    async (prisma) => {
      const center = await prisma.center.findFirst({
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
          // Fixed: Use the junction table relationship
          activities: {
            include: {
              activity: {
                include: {
                  pricingVariants: true,
                  activityType: {
                    select: { name: true },
                  },
                },
              },
            },
            orderBy: { displayOrder: "asc" },
          },
          // Fixed: This is the correct relationship name
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
        // Fixed: Map through the junction table to get activities
        activities: center.activities.map((centerActivity) => ({
          id: centerActivity.activity.id,
          title: centerActivity.activity.title,
          description: centerActivity.activity.description,
          imageUrl: centerActivity.activity.imageUrl,
          buttonTitle: centerActivity.activity.buttonTitle,
          buttonLink: centerActivity.activity.buttonLink,
          type: centerActivity.activity.activityType?.name || "Activity",
          pricing: centerActivity.activity.pricingVariants.map((pv) => ({
            id: pv.id,
            price: Number(pv.price),
            playerType: pv.playerType,
            duration: pv.duration,
            priceType: pv.priceType,
          })),
        })),
      };
    },
    null, // null fallback for single center
    `fetchCenter(${id})`
  );
}
