"use server";

import { sql } from "@vercel/postgres";
import { Tags } from "./../../definitions";
import { unstable_noStore as noStore } from "next/cache";

export default async function fetchTags() {
  noStore();

  try {
    const data = await sql<Tags>`
    SELECT t.id, t.name, t.last_edited
    FROM tags t`;

    return data.rows;
  } catch (error) {
    console.log("Database Error:", error);
    throw new Error("Failed to fetch tags data");
  }
}
