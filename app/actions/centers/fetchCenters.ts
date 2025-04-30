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

        links: true,
        socials: true,
        establishment: true, // This gets the establishment tag
      },
    });

    return centers.map((center) => ({
      id: center.id,
      name: center.name,
      description: center.description || "",
      // Transform images array to match expected format
      images: center.images.map((img) => img.imageUrl),
      last_edited: center.lastEdited,
      phone: center.phone || "",
      email: center.email || "",
      // Map links from the relationship
      links: center.links.map((link) => ({
        id: link.id,
        type: link.type || "",
        url: link.url || "",
      })),
      latitude: center.latitude,
      longitude: center.longitude,
      // Map socials from the relationship
      socials: center.socials.map((social) => ({
        id: social.id,
        platform: social.platform || "",
        url: social.url || "",
      })),
      // Map establishment details
      establishment: center.establishment
        ? [{ id: center.establishment.id, name: center.establishment.name }]
        : [],
      // Map sports from the sportCenters relationship
      sports: center.sportCenters.map((sc) => ({
        id: sc.sport.id,
        name: sc.sport.name,
      })),
      // Map facilities from the facilities relationship
      facilities: center.facilities.map((f) => ({
        id: f.tag.id,
        name: f.tag.name,
      })),
      address: center.address || "",
      is_active: center.isActive,
      // Map tags from the tags relationship
      tags: center.tags.map((t) => t.tag.name),
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
