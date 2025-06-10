// app/api/centers/[id]/route.ts
import { fetchCenterById } from "@/app/actions/centers/fetchCentersById";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const center = await fetchCenterById(params.id);

    if (!center) {
      return NextResponse.json({ error: "Center not found" }, { status: 404 });
    }

    return NextResponse.json(center);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
