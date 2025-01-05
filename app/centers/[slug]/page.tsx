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
    is_active: null,
    tags: [],
  };

  console.log(center.sports);

  return (
    <div className={styles.wrapper}>
      <MobileCenterCarousel centers={[center]} />
      <div className="content-container">
        <ImageLayout images={center.images} />
        <div className={styles.title}>
          <div className={styles.facilities}>
            {center.sports.map((sport, index) => (
              <span key={index} className={styles.pill}>
                {sport}
              </span>
            ))}
          </div>

          <h1>{center.name}</h1>
        </div>
        <p className={styles.description}>{center.description}</p>
        <Facilities facilities={center.facilities} />
        <Address
          address={center.address}
          latitude={typeof center.latitude === "number" ? center.latitude : 0}
          longitude={
            typeof center.longitude === "number" ? center.longitude : 0
          }
        />
        {center.phone ||
        center.email ||
        (center.socials && center.socials.length > 0) ? (
          <Links
            socials={center.socials || []}
            phone={center.phone}
            email={center.email}
          />
        ) : null}
      </div>
    </div>
  );
}
