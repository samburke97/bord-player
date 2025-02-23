"use server";

import { sql } from "@vercel/postgres";
import { Sport } from "../../../types/index.ts";
import { unstable_noStore as noStore } from "next/cache";

export default async function fetchSports() {
  noStore();

  try {
    const data = await sql<Sport>`
      SELECT s.id, s.name, i.image_url, s.last_edited
      FROM sports s
      LEFT JOIN sport_images i ON s.id = i.sport_id;
    ;`;

    return data.rows.map((row) => ({
      id: row.id,
      name: row.name,
      image_url: row.image_url,
      last_edited: row.last_edited ? new Date(row.last_edited) : null,
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch sports data.");
  }
}
