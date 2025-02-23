"use server";

import { sql } from "@vercel/postgres";
import { Group } from "../../../types/index.ts";
import { unstable_noStore as noStore } from "next/cache";

export default async function fetchGroups() {
  noStore();

  try {
    const data = await sql<Group>`
      SELECT g.id, g.name, g.last_edited,
             (
               SELECT COUNT(*)
               FROM group_tags gt
               WHERE gt.group_id = g.id
             ) AS tag_count,
             (
               SELECT json_agg(json_build_object('id', s.id, 'name', s.name))
               FROM sport_groups sg
               JOIN sports s ON sg.sport_id = s.id
               WHERE sg.group_id = g.id
             ) AS sports,
             (
               SELECT json_agg(json_build_object('id', t.id, 'name', t.name))
               FROM group_tags gt
               JOIN tags t ON gt.tag_id = t.id
               WHERE gt.group_id = g.id
             ) AS tags
      FROM groups g;
    `;

    return data.rows.map((row) => ({
      ...row,
      last_edited: new Date(row.last_edited),
      tags: row.tags || [],
      sports: row.sports || [],
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch groups data.");
  }
}
