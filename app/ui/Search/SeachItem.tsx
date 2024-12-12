import Link from "next/link";
import { Center } from "@/app/lib/definitions";
import styles from "./SearchItem.module.css";
import { MapPinIcon } from "@heroicons/react/24/outline";

const DUMMY_SPORTS = ["Bouldering", "Bouldering", "Bouldering"];
const DUMMY_ADDRESS = ["221 High St, London E15 2AE"];

const SearchItem: React.FC<{ centers: Center[] }> = ({ centers }) => {
  return (
    <div className={styles.listContainer}>
      {centers.map((center) => (
        <Link
          key={center.id}
          href={`/centers/${center.id}`}
          className={styles.card}
        >
          <div className={styles.imageContainer}>
            {center.images && center.images.length > 0 ? (
              <img
                src={center.images[0]}
                alt={center.name || "Center Image"}
                className={styles.image}
              />
            ) : (
              <div className={styles.imagePlaceholder}>Image not available</div>
            )}
          </div>
          <div className={styles.infoContainer}>
            <div className={styles.sportsContainer}>
              {DUMMY_SPORTS.map((sport, index) => (
                <span key={index} className={styles.sportPill}>
                  {sport}
                </span>
              ))}
            </div>
            <div className={styles.name}>{center.name}</div>
            {DUMMY_ADDRESS.map((address, index) => (
              <div key={index} className={styles.location}>
                <MapPinIcon className={styles.icon} />
                <span className={styles.address}>{address}</span>
              </div>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default SearchItem;
