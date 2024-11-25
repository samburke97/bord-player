import fetchCenterBySlug from "../../lib/data/centers/fetchCentersBySlug";
import { Center } from "@/app/lib/definitions";
import ImageLayout from "@/app/ui/components/Carousels/ImageLayout";
import MobileCenterCarousel from "@/app/ui/components/Carousels/MobileCenterCarousel";
import Facilities from "@/app/ui/centers/Facilities";
import Links from "@/app/ui/centers/Links";

import styles from "./Centers.module.css";
import Address from "@/app/ui/centers/Address";

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
    latitude: 0,
    longitude: 0,
    phone: "",
    email: "",
    links: [],
    socials: [],
    establishment: [],
    sports: [],
    facilities: [],
  };

  console.log("center socials:", center.socials);

  return (
    <div className={styles.wrapper}>
      <MobileCenterCarousel centers={[center]} />
      <div className="content-container">
        <ImageLayout />
        <div className={styles.title}>
          <span className={styles.pill}>Bouldering</span>
          <h1>{center.name}</h1>
        </div>
        <p className={styles.description}>{center.description}</p>
        {center.facilities ? <Facilities facilities={center.facilities} /> : ""}
        <Address
          address={center.address}
          latitude={center.latitude}
          longitude={center.longitude}
        />
        <Links
          socials={center.socials}
          phone={center.phone}
          email={center.email}
        />
      </div>
    </div>
  );
}
