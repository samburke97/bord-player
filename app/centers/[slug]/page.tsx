import { fetchCenterById } from "@/app/actions/centers/fetchCentersById";
import { notFound } from "next/navigation";
import CenterDetailsClient from "./CenterDetailsClient";

// Force dynamic rendering - prevents static generation issues
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
  try {
    const center = await fetchCenterById(params.slug);

    if (!center) {
      notFound();
    }

    return <CenterDetailsClient center={center} />;
  } catch (error) {
    console.error("Error fetching center:", error);
    // Return a proper error page or notFound
    notFound();
  }
}
