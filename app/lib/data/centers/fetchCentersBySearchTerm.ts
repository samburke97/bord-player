// app/lib/data/centers/fetchCentersBySearchTerm.ts (Server Function)
import { sql } from "@vercel/postgres";
import { Center } from "@/app/lib/definitions";

export default async function fetchCentersBySearchTerm(
  searchTerm: string
): Promise<Center[]> {
  const sanitizedSearchTerm = `%${searchTerm}%`;

  try {
    const { rows } = await sql<Center>`
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
        array_agg(t.name) AS facilities,  
        array_agg(t2.name) AS tags,
        array_agg(t3.name) AS sports   
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
          g.name ILIKE ${sanitizedSearchTerm} OR
          t2.name ILIKE ${sanitizedSearchTerm} OR
          t3.name ILIKE ${sanitizedSearchTerm}
        )
      GROUP BY g.id;
    `;
    return rows;
  } catch (error) {
    console.error("Error fetching centers:", error);
    return [];
  }
}
