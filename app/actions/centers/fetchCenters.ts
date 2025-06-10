import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";
import { Center } from "@/types/index";

export default async function fetchCenters(): Promise<Center[]> {
  noStore();

  try {
    const centers = await prisma.center.findMany({
      where: {
        isActive: true,
        isDeleted: false,
      },
      include: {
        images: {
          orderBy: {
            order: "asc",
          },
        },
        facilities: {
          include: {
            tag: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        sportCenters: {
          include: {
            sport: true,
          },
        },
        openingHours: true, // Include opening hours
        activities: {
          include: {
            activity: {
              include: {
                pricingVariants: true, // Include pricing if needed
              },
            },
          },
          orderBy: {
            displayOrder: "asc",
          },
        },
        links: true,
        socials: true,
        establishment: true,
      },
    });

    return centers.map((center) => ({
      id: center.id,
      name: center.name,
      address: center.address,
      description: center.description,
      latitude: center.latitude ? Number(center.latitude) : null,
      longitude: center.longitude ? Number(center.longitude) : null,
      logoUrl: center.logoUrl,
      phone: center.phone,
      email: center.email,
      isActive: center.isActive, // Fixed: use isActive instead of is_active
      isOpenNow: false, // TODO: Implement opening hours logic to determine if open
      type: center.establishment?.name || null,

      // Transform images array to match expected format
      images: center.images.map((img) => img.imageUrl),

      // Map facilities from the facilities relationship
      facilities: center.facilities.map((f) => ({
        id: f.tag.id,
        name: f.tag.name,
        imageUrl: f.tag.imageUrl,
      })),

      // Map tags from the tags relationship - should be Tag[] not string[]
      tags: center.tags.map((t) => ({
        id: t.tag.id,
        name: t.tag.name,
      })),

      // Map sports from the sportCenters relationship
      sports: center.sportCenters.map((sc) => ({
        id: sc.sport.id,
        name: sc.sport.name,
      })),

      // Map opening hours
      openingHours: center.openingHours.map((oh) => ({
        dayOfWeek: oh.dayOfWeek,
        isOpen: oh.isOpen,
        openTime: oh.openTime,
        closeTime: oh.closeTime,
        isToday: false, // TODO: Implement logic to check if it's today
      })),

      // Map social links
      socials: center.socials.map((social) => ({
        id: social.id,
        platform: social.platform || "",
        url: social.url || "",
      })),

      // Map web links
      links: center.links.map((link) => ({
        id: link.id,
        type: link.type || "",
        url: link.url || "",
      })),

      // Map activities
      activities: center.activities.map((ca) => ({
        id: ca.activity.id,
        title: ca.activity.title,
        description: ca.activity.description || "",
        imageUrl: ca.activity.imageUrl || "",
        buttonTitle: ca.activity.buttonTitle || "",
        buttonLink: ca.activity.buttonLink || "",
        type: "", // TODO: Map activity type if needed
        displayOrder: ca.displayOrder,
        pricing: ca.activity.pricingVariants.map((pv) => ({
          id: pv.id,
          price: Number(pv.price),
          playerType: pv.playerType,
          duration: pv.duration,
          priceType: pv.priceType,
        })),
      })),
    }));
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        "Error occurred while fetching centers data:",
        error.message
      );
      throw new Error(`Failed to fetch centers data: ${error.message}`);
    } else {
      console.error("An unknown error occurred:", error);
      throw new Error("Failed to fetch centers data: Unknown error");
    }
  }
}
