// app/centers/[slug]/CenterDetails.tsx
import { fetchCenterById } from "@/app/actions/centers/fetchCentersById";
import { notFound } from "next/navigation";
import CenterDetailsClient from "./CenterDetailsClient";

interface CenterDetailsProps {
  slug: string;
}

export default async function CenterDetails({ slug }: CenterDetailsProps) {
  try {
    const center = await fetchCenterById(slug);

    if (!center) {
      notFound();
    }

    return <CenterDetailsClient center={center} />;
  } catch (error) {
    console.error("Error fetching center:", error);
    notFound();
  }
}
