import styles from "./Address.module.css";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import MapComponent from "./Map";

interface AddressProps {
  address?: string;
  latitude: number;
  longitude: number;
}

const Address: React.FC<AddressProps> = ({ address, latitude, longitude }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.search}>
        <div className={styles.title}>
          <MapPinIcon className={styles.icon} />
          <h2>{address}</h2>
        </div>
        <ChevronRightIcon className={styles.icon} />
      </div>
      <div className={styles.mapContainer}>
        <MapComponent latitude={latitude} longitude={longitude} />
      </div>
    </div>
  );
};

export default Address;
