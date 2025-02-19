import { NextResponse } from "next/server";
import { db } from "@vercel/postgres";

export async function POST(request: Request) {
  try {
    const { bounds, cursor, filters } = await request.json();

    const query = `
      WITH filtered_centers AS (
        SELECT 
          c.*,
          COUNT(*) OVER() as total_count
        FROM centers c
        WHERE 
          c.latitude BETWEEN $1 AND $2
          AND c.longitude BETWEEN $3 AND $4
          ${
            filters?.sports
              ? "AND EXISTS (SELECT 1 FROM center_sports cs WHERE cs.center_id = c.id AND cs.sport_id = ANY($5))"
              : ""
          }
          ${cursor ? "AND c.id > $6" : ""}
        ORDER BY 
          c.id
        LIMIT 50
      )
      SELECT 
        fc.*,
        json_agg(DISTINCT s.*) as sports,
        json_agg(DISTINCT t.*) as tags
      FROM filtered_centers fc
      LEFT JOIN center_sports cs ON cs.center_id = fc.id
      LEFT JOIN sports s ON s.id = cs.sport_id
      LEFT JOIN center_tags ct ON ct.center_id = fc.id
      LEFT JOIN tags t ON t.id = ct.tag_id
      GROUP BY fc.id
    `;

    const values = [
      bounds.sw.lat,
      bounds.ne.lat,
      bounds.sw.lng,
      bounds.ne.lng,
      filters?.sports,
      cursor,
    ].filter(Boolean);

    const client = await db.connect();
    const result = await client.query(query, values);

    return NextResponse.json({
      centers: result.rows,
      nextCursor:
        result.rows.length === 50
          ? result.rows[result.rows.length - 1].id
          : null,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to fetch centers" },
      { status: 500 }
    );
  }
}
