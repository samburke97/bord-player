// app/centers/[slug]/page.tsx
import { fetchCenterById } from "@/app/actions/centers/fetchCentersById";
import { notFound } from "next/navigation";
import CenterDetailsClient from "./CenterDetailsClient";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = {
  slug: string;
};

export default async function CenterDetailsPage({
  params,
}: {
  params: Params;
}) {
  // During build, just return a placeholder
  if (process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV) {
    return <div>Loading...</div>;
  }

  try {
    const center = await fetchCenterById(params.slug);

    if (!center) {
      notFound();
    }

    return <CenterDetailsClient center={center} />;
  } catch (error) {
    console.error("Error fetching center:", error);
    notFound();
  }
}
