import { NextRequest, NextResponse } from "next/server";
import { db } from "@vercel/postgres";

export const dynamic = "force-dynamic"; // Never cache this route

export async function GET(request: NextRequest) {
  // Parse search parameters
  const { searchParams } = new URL(request.url);

  // Extract parameters
  const searchTerm = searchParams.get("q") || "";
  const sports = searchParams.get("sports")?.split(",") || [];
  const facilities = searchParams.get("facilities")?.split(",") || [];

  // Map boundaries
  const north = parseFloat(searchParams.get("north") || "90");
  const south = parseFloat(searchParams.get("south") || "-90");
  const east = parseFloat(searchParams.get("east") || "180");
  const west = parseFloat(searchParams.get("west") || "-180");

  // Connect to the database
  const client = await db.connect();

  try {
    // First, create a CTE (Common Table Expression) to get all centers matching the search criteria
    let query = `
      WITH matching_centers AS (
        SELECT DISTINCT c.*, 
          (
            CASE 
              WHEN $1 = '' THEN 1
              WHEN LOWER(c.name) LIKE '%' || LOWER($1) || '%' THEN 3
              WHEN EXISTS (
                SELECT 1 FROM center_sports cs
                JOIN sports s ON cs.sport_id = s.id
                WHERE cs.center_id = c.id AND LOWER(s.name) LIKE '%' || LOWER($1) || '%'
              ) THEN 2
              ELSE 0
            END
          ) as relevance
        FROM centers c
        WHERE c.is_active = TRUE
          AND c.latitude BETWEEN $2 AND $3
          AND c.longitude BETWEEN $4 AND $5
    `;

    const params = [searchTerm, south, north, west, east];
    let paramCount = params.length;

    // Add sports filter if specified
    if (sports.length > 0) {
      query += `
        AND c.id IN (
          SELECT cs.center_id FROM center_sports cs
          WHERE cs.sport_id = ANY($${++paramCount}::uuid[])
        )
      `;
      params.push(sports);
    }

    // Add facilities filter if specified
    if (facilities.length > 0) {
      query += `
        AND c.id IN (
          SELECT cf.center_id FROM center_facilities cf
          WHERE cf.tag_id = ANY($${++paramCount}::uuid[])
        )
      `;
      params.push(facilities);
    }

    // Add search term filter - only include if there's a search term
    if (searchTerm) {
      query += `
        AND (
          LOWER(c.name) LIKE '%' || LOWER($1) || '%'
          OR c.id IN (
            SELECT cs.center_id FROM center_sports cs
            JOIN sports s ON cs.sport_id = s.id
            WHERE LOWER(s.name) LIKE '%' || LOWER($1) || '%'
          )
        )
      `;
    }

    // Close the CTE and select from it with all the related data
    query += `
      )
      SELECT 
        mc.*,
        array_remove(array_agg(DISTINCT ci.image_url), NULL) AS images,
        array_remove(array_agg(DISTINCT jsonb_build_object('id', s.id, 'name', s.name)), NULL) AS sports,
        array_remove(array_agg(DISTINCT jsonb_build_object('id', ft.id, 'name', ft.name)), NULL) AS facilities,
        array_remove(array_agg(DISTINCT t.name), NULL) AS tags
      FROM matching_centers mc
      LEFT JOIN center_images ci ON mc.id = ci.center_id
      LEFT JOIN center_sports cs ON mc.id = cs.center_id
      LEFT JOIN sports s ON cs.sport_id = s.id
      LEFT JOIN center_facilities cf ON mc.id = cf.center_id
      LEFT JOIN tags ft ON cf.tag_id = ft.id
      LEFT JOIN center_tags ct ON mc.id = ct.center_id
      LEFT JOIN tags t ON ct.tag_id = t.id
      GROUP BY mc.id, mc.name, mc.address, mc.description, mc.latitude, mc.longitude, mc.last_edited, 
               mc.last_seeded, mc.phone, mc.email, mc.establishment, mc.is_active, mc.relevance
      ORDER BY mc.relevance DESC, mc.name ASC
      LIMIT 50
    `;

    // Execute the query
    const result = await client.query(query, params);

    // Transform the raw data to ensure proper structure
    const transformedData = result.rows.map((row) => ({
      ...row,
      // Ensure these are arrays even if null
      images: row.images || [],
      sports: row.sports || [],
      facilities: row.facilities || [],
      tags: row.tags || [],
    }));

    // Return the results
    return NextResponse.json(transformedData, {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("❌ Error executing search query:", error);
    return NextResponse.json(
      { error: "Failed to execute search" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
