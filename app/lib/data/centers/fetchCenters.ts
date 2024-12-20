import { sql } from "@vercel/postgres";
import { Center } from "../../definitions";
import { unstable_noStore as noStore } from "next/cache";

export default async function fetchCenters(): Promise<Center[]> {
  noStore();

  try {
    const data = await sql<Center>`
      SELECT g.id, g.name, g.description, array_agg(i.image_url) AS images, g.last_edited, g.phone, g.email, g.latitude, g.longitude, g.address, g.is_active
      FROM centers g
      LEFT JOIN center_images i ON g.id = i.center_id
      WHERE g.is_active = true
      GROUP BY g.id;
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
      sports: [],
      facilities: [],
      is_active: row.is_active,
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch centers data.");
  }
}
