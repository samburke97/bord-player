// app/api/search/route.ts
import { NextResponse } from "next/server";
import { db } from "@vercel/postgres";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("searchTerm") || "";
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radius = parseFloat(searchParams.get("radius") || "25");

    const client = await db.connect();

    try {
      // Using Haversine formula to calculate distance
      const result = await client.query(
        `
        WITH filtered_centers AS (
          SELECT 
            c.*,
            ARRAY_AGG(DISTINCT jsonb_build_object(
              'id', s.id,
              'name', s.name
            )) as sports,
            ARRAY_AGG(DISTINCT i.image_url) as images,
            ARRAY_AGG(DISTINCT jsonb_build_object(
              'id', f.id,
              'name', f.name
            )) as facilities,
            ARRAY_AGG(DISTINCT jsonb_build_object(
              'id', t.id,
              'name', t.name
            )) as tags,
            (
              6371 * acos(
                cos(radians($1)) * 
                cos(radians(latitude)) * 
                cos(radians(longitude) - radians($2)) + 
                sin(radians($1)) * 
                sin(radians(latitude))
              )
            ) as distance
          FROM centers c
          LEFT JOIN center_sports cs ON c.id = cs.center_id
          LEFT JOIN sports s ON cs.sport_id = s.id
          LEFT JOIN center_images i ON c.id = i.center_id
          LEFT JOIN center_facilities cf ON c.id = cf.center_id
          LEFT JOIN tags f ON cf.tag_id = f.id
          LEFT JOIN center_tags ct ON c.id = ct.center_id
          LEFT JOIN tags t ON ct.tag_id = t.id
          WHERE (
            LOWER(c.name) LIKE LOWER($4)
            OR EXISTS (
              SELECT 1 FROM center_sports cs2
              JOIN sports s2 ON cs2.sport_id = s2.id
              WHERE cs2.center_id = c.id
              AND LOWER(s2.name) LIKE LOWER($4)
            )
          )
          AND c.is_active = true
          GROUP BY c.id
          HAVING (
            6371 * acos(
              cos(radians($1)) * 
              cos(radians(latitude)) * 
              cos(radians(longitude) - radians($2)) + 
              sin(radians($1)) * 
              sin(radians(latitude))
            )
          ) < $3
          ORDER BY distance
          LIMIT 50
        )
        SELECT 
          id,
          name,
          description,
          address,
          latitude,
          longitude,
          phone,
          email,
          is_active,
          sports,
          images,
          facilities,
          tags,
          ROUND(distance::numeric, 2) as distance
        FROM filtered_centers
      `,
        [lat, lng, radius, `%${searchTerm}%`]
      );

      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to fetch centers" },
      { status: 500 }
    );
  }
}
