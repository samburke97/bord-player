import { sql } from "@vercel/postgres";
import { Center } from "../../../types/types";
import { unstable_noStore as noStore } from "next/cache";

export default async function fetchCenterBySlug(
  slug: string
): Promise<Center | null> {
  noStore();

  try {
    const data = await sql<Center>`
  SELECT 
    g.id, 
    g.name, 
    g.description, 
    array_agg(i.image_url) AS images, 
    g.last_edited, 
    g.phone, 
    g.email, 
    g.latitude, 
    g.longitude, 
    g.address, 
    g.is_active,
    array_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) AS facilities,  
    array_agg(DISTINCT t2.name) AS tags,
    array_agg(DISTINCT jsonb_build_object('id', t3.id, 'name', t3.name)) AS sports
  FROM centers g
  LEFT JOIN center_images i ON g.id = i.center_id
  LEFT JOIN center_facilities f ON g.id = f.center_id
  LEFT JOIN tags t ON f.tag_id = t.id 
  LEFT JOIN center_tags ct ON g.id = ct.center_id
  LEFT JOIN tags t2 ON ct.tag_id = t2.id 
  LEFT JOIN center_sports cs ON g.id = cs.center_id   
  LEFT JOIN sports t3 ON cs.sport_id = t3.id           
  WHERE g.id = ${slug} AND g.is_active = true
  GROUP BY g.id;
`;

    if (data.rows.length === 0) {
      console.log("No center found for slug:", slug);
      return null;
    }

    const row = data.rows[0];

    return {
      id: row.id,
      name: row.name,
      description: row.description || "",
      images: row.images || [],
      last_edited: row.last_edited ? new Date(row.last_edited) : null,
      phone: row.phone || "",
      email: row.email || "",
      links: [],
      latitude: row.latitude,
      longitude: row.longitude,
      socials: [],
      establishment: [],
      sports: row.sports || [],
      facilities: row.facilities || [],
      address: row.address || "",
      is_active: row.is_active,
      tags: row.tags || [],
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        "Error occurred while fetching center data by slug:",
        error.message
      );
      throw new Error(`Failed to fetch center data by slug: ${error.message}`);
    } else {
      console.error("An unknown error occurred", error);
      throw new Error("Failed to fetch center data by slug: Unknown error");
    }
  }
}
