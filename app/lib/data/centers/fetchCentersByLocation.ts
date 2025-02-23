import { sql } from "@vercel/postgres";
import { Center } from "@/app/types/index";
import { unstable_noStore as noStore } from "next/cache";

export async function fetchCentersByLocation(
  searchTerm: string,
  latitude: number,
  longitude: number,
  radius: number = 25
): Promise<Center[]> {
  noStore();

  try {
    const searchPattern = `%${searchTerm}%`;

    const data = await sql<Center>`
      WITH matched_centers AS (
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
          array_agg(jsonb_build_object('id', t.id, 'name', t.name)) AS facilities,  
          array_agg(t2.name) AS tags,
          array_agg(jsonb_build_object('id', t3.id, 'name', t3.name)) AS sports,
          (
            6371 * acos(
              cos(radians(${latitude})) * cos(radians(g.latitude)) *
              cos(radians(g.longitude) - radians(${longitude})) +
              sin(radians(${latitude})) * sin(radians(g.latitude))
            )
          ) as distance
        FROM centers g
        LEFT JOIN center_images i ON g.id = i.center_id
        LEFT JOIN center_facilities f ON g.id = f.center_id
        LEFT JOIN tags t ON f.tag_id = t.id 
        LEFT JOIN center_tags ct ON g.id = ct.center_id
        LEFT JOIN tags t2 ON ct.tag_id = t2.id 
        LEFT JOIN center_sports cs ON g.id = cs.center_id   
        LEFT JOIN sports t3 ON cs.sport_id = t3.id          
        WHERE g.is_active = true
        GROUP BY g.id
        HAVING 
          LOWER(g.name) LIKE LOWER(${searchPattern}) OR
          EXISTS (
            SELECT 1 FROM center_sports cs2
            JOIN sports s ON cs2.sport_id = s.id
            WHERE cs2.center_id = g.id AND LOWER(s.name) LIKE LOWER(${searchPattern})
          ) OR
          EXISTS (
            SELECT 1 FROM center_tags ct2
            JOIN tags t ON ct2.tag_id = t.id
            WHERE ct2.center_id = g.id AND LOWER(t.name) LIKE LOWER(${searchPattern})
          )
      )
      SELECT *
      FROM matched_centers
      WHERE distance <= ${radius}
      ORDER BY distance ASC;
    `;

    return data.rows.map((row) => ({
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
    }));
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        "Error occurred while fetching centers by location:",
        error.message
      );
      throw new Error(`Failed to fetch centers by location: ${error.message}`);
    } else {
      console.error("An unknown error occurred:", error);
      throw new Error("Failed to fetch centers by location: Unknown error");
    }
  }
}
