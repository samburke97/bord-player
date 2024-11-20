import styles from "./Address.module.css";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import MapComponent from "../Map";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("../Map"), { ssr: false });

const Address = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.search}>
        <div className={styles.title}>
          <MapPinIcon className={styles.icon} />
          <h2>Address</h2>
        </div>
        <ChevronRightIcon className={styles.icon} />
      </div>
      <div className={styles.mapContainer}>
        <MapComponent />
      </div>
    </div>
  );
};

export default Address;
