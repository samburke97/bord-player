// app/api/search/bounds/route.ts
import { NextResponse } from "next/server";
import { db } from "@vercel/postgres";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Log incoming request params
    console.log("API Request Params:", Object.fromEntries(searchParams));

    const searchTerm = searchParams.get("searchTerm")?.trim() || "";
    const north = parseFloat(searchParams.get("north") || "0");
    const south = parseFloat(searchParams.get("south") || "0");
    const east = parseFloat(searchParams.get("east") || "0");
    const west = parseFloat(searchParams.get("west") || "0");

    // Log parsed parameters
    console.log("Parsed Parameters:", {
      searchTerm,
      north,
      south,
      east,
      west,
    });

    const client = await db.connect();

    try {
      const query = `
        WITH filtered_centers AS (
          SELECT 
            c.*,
            ARRAY_AGG(DISTINCT jsonb_build_object(
              'id', s.id,
              'name', s.name
            )) FILTER (WHERE s.id IS NOT NULL) as sports,
            ARRAY_AGG(DISTINCT ci.image_url) FILTER (WHERE ci.image_url IS NOT NULL) as images,
            ARRAY_AGG(DISTINCT jsonb_build_object(
              'id', f.id,
              'name', f.name
            )) FILTER (WHERE f.id IS NOT NULL) as facilities,
            ARRAY_AGG(DISTINCT jsonb_build_object(
              'id', t.id,
              'name', t.name
            )) FILTER (WHERE t.id IS NOT NULL) as tags
          FROM centers c
          LEFT JOIN center_sports cs ON c.id = cs.center_id
          LEFT JOIN sports s ON cs.sport_id = s.id
          LEFT JOIN center_images ci ON c.id = ci.center_id
          LEFT JOIN center_facilities cf ON c.id = cf.center_id
          LEFT JOIN tags f ON cf.tag_id = f.id
          LEFT JOIN center_tags ct ON c.id = ct.center_id
          LEFT JOIN tags t ON ct.tag_id = t.id
          WHERE 
            c.latitude BETWEEN $1 AND $2
            AND c.longitude BETWEEN $3 AND $4
            AND (
              LOWER(c.name) LIKE LOWER($5)
              OR EXISTS (
                SELECT 1 FROM center_sports cs2
                JOIN sports s2 ON cs2.sport_id = s2.id
                WHERE cs2.center_id = c.id
                AND LOWER(s2.name) LIKE LOWER($5)
              )
            )
            AND c.is_active = true
          GROUP BY c.id
          ORDER BY c.name
          LIMIT 50
        )
        SELECT * FROM filtered_centers;
      `;

      const values = [south, north, west, east, `%${searchTerm}%`];

      // Log the query and values
      console.log("Executing query with values:", values);

      const result = await client.query(query, values);

      console.log(`Found ${result.rows.length} centers`);

      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch centers",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
