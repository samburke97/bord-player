import { sql } from "@vercel/postgres";
import { Center } from "../../definitions";
import { unstable_noStore as noStore } from "next/cache";

export default async function fetchCenterBySlug(
  slug: string
): Promise<Center | null> {
  noStore();

  console.log("Fetching center with slug:", slug);

  try {
    const centerData = await sql`
      SELECT
        c.id,
        c.name,
        c.address,
        c.latitude,
        c.longitude,
        c.description,
        c.last_edited,
        c.phone,
        c.email,
        c.establishment,
        c.is_active
      FROM centers c
      WHERE c.id = ${slug} AND c.is_active = true;
    `;

    if (centerData.rows.length === 0) {
      console.log("No active center found for slug:", slug);
      return null;
    }

    const center = centerData.rows[0];

    // Fetch associated images
    const imagesData = await sql`
      SELECT image_url
      FROM center_images
      WHERE center_id = ${slug};
    `;
    const images = imagesData.rows
      .map((row) => row.image_url || "")
      .filter(Boolean);

    // Fetch associated establishment tag
    const establishmentData = await sql`
      SELECT t.id, t.name
      FROM tags t
      WHERE t.id = ${center.establishment}; 
    `;
    const establishment =
      establishmentData.rows.length > 0
        ? establishmentData.rows.map((row) => ({
            id: row.id,
            name: row.name,
          }))
        : [];

    // Fetch associated sports
    const sportsData = await sql`
      SELECT s.id, s.name
      FROM sports s
      JOIN center_sports cs ON s.id = cs.sport_id
      WHERE cs.center_id = ${slug};
    `;
    const sports = sportsData.rows.map((row) => ({
      id: row.id,
      name: row.name,
    }));

    // Fetch associated facilities
    const facilitiesData = await sql`
      SELECT t.id, t.name
      FROM tags t
      JOIN center_facilities cf ON t.id = cf.tag_id
      WHERE cf.center_id = ${slug}; 
    `;
    const facilities = facilitiesData.rows.map((row) => ({
      id: row.id,
      name: row.name,
    }));

    // Fetch associated center links
    const linksData = await sql`
      SELECT id, type, url
      FROM center_links
      WHERE center_id = ${slug};
    `;
    const links = linksData.rows.map((row) => ({
      id: row.id,
      type: row.type,
      url: row.url,
    }));

    // Fetch associated center socials
    const socialsData = await sql`
      SELECT id, platform, url
      FROM center_socials
      WHERE center_id = ${slug};
    `;
    const socials = socialsData.rows.map((row) => ({
      id: row.id,
      platform: row.platform,
      url: row.url,
    }));

    return {
      id: center.id,
      name: center.name,
      address: center.address || undefined,
      latitude: center.latitude || undefined,
      longitude: center.longitude || undefined,
      description: center.description || undefined,
      phone: center.phone || undefined,
      email: center.email || undefined,
      links: links || [],
      socials: socials || [],
      images,
      last_edited: center.last_edited ? new Date(center.last_edited) : null,
      establishment,
      sports,
      facilities,
      is_active: center.is_active,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch center data.");
  }
}
