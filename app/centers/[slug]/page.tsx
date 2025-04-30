import { fetchCenterById } from "@/app/actions/centers/fetchCentersById";
import styles from "./Centers.module.css";
import CenterDetailsClient from "./CenterDetailsClient";

type Params = {
  slug: string;
};

export default async function CenterDetailsPage({
  params,
}: {
  params: Params;
}) {
  const center = await fetchCenterById(params.slug);

  if (!center) {
    return <div className={styles.notFound}>Center not found</div>;
  }

  return <CenterDetailsClient center={center} />;
}
