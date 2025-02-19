import { sql } from "@vercel/postgres";
import { Center } from "../../../types/types";
import { unstable_noStore as noStore } from "next/cache";
import { calculateDistance } from "../../utils/calculateDistance";

export default async function fetchCentersByLocationAndSearchTerm(
  searchTerm: string | null,
  userLocation: { latitude: number; longitude: number },
  radius: number = 25
): Promise<Center[]> {
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
      array_agg(jsonb_build_object('id', t.id, 'name', t.name)) AS facilities,  
      array_agg(t2.name) AS tags,
      array_agg(jsonb_build_object('id', t3.id, 'name', t3.name)) AS sports
    FROM centers g
    LEFT JOIN center_images i ON g.id = i.center_id
    LEFT JOIN center_facilities f ON g.id = f.center_id
    LEFT JOIN tags t ON f.tag_id = t.id 
    LEFT JOIN center_tags ct ON g.id = ct.center_id
    LEFT JOIN tags t2 ON ct.tag_id = t2.id 
    LEFT JOIN center_sports cs ON g.id = cs.center_id   
    LEFT JOIN sports t3 ON cs.sport_id = t3.id
    WHERE g.is_active = true
    AND (
      (${searchTerm ? "g.name ILIKE" : "TRUE"}) 
      ${searchTerm ? `AND g.name ILIKE '%${searchTerm}%'` : ""}
    )
    GROUP BY g.id
    HAVING calculateDistance(g.latitude, g.longitude, ${
      userLocation.latitude
    }, ${userLocation.longitude}) <= ${radius}
    `;

    return data.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description || "",
      images: row.images || [],
      last_edited: row.last_edited ? new Date(row.last_edited) : null,
      phone: row.phone || "",
      email: row.email || "",
      latitude: row.latitude,
      longitude: row.longitude,
      address: row.address || "",
      is_active: row.is_active,
      sports: row.sports || [],
      facilities: row.facilities || [],
      tags: row.tags || [],
    }));
  } catch (error: unknown) {
    console.error("Error occurred while fetching centers:", error);
    throw new Error("Failed to fetch centers data");
  }
}
