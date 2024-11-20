import fetchCenterBySlug from "../../lib/data/centers/fetchCentersBySlug";
import { Center } from "@/app/lib/definitions";
import ImageLayout from "@/app/ui/components/Carousels/ImageLayout";
import MobileCenterCarousel from "@/app/ui/components/Carousels/MobileCenterCarousel";
import Facilities from "@/app/ui/Centers/Facilities";
import Links from "@/app/ui/Centers/Links";

import styles from "./Centers.module.css";
import Address from "@/app/ui/Centers/Address";

type Params = {
  slug: string;
};

export default async function Centers({ params }: { params: Params }) {
  const fetchedCenter = await fetchCenterBySlug(params.slug);

  const center: Center = fetchedCenter || {
    id: "",
    name: "",
    description: "",
    images: [],
    last_edited: null,
    address: "",
    phone: "",
    email: "",
    links: [],
    socials: [],
    establishment: [],
    sports: [],
    facilities: [],
  };

  return (
    <div className={styles.wrapper}>
      <MobileCenterCarousel centers={[center]} />
      <div className="content-container">
        <ImageLayout />
        <div className={styles.title}>
          <span className={styles.pill}>Boudlering</span>
          <h1>{center.name}</h1>
        </div>
        <p className={styles.description}>{center.description}</p>
        <Facilities />
        <Address />
        <Links />
      </div>
    </div>
  );
}