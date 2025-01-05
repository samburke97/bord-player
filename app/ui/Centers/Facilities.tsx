import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import styles from "./Facilities.module.css";

// Update the function signature to match the prop name correctly.
const Facilities = ({ facilities }: { facilities: string[] }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        <BuildingStorefrontIcon className={styles.icon} />
        <h2>Facilities</h2>
      </div>

      <div className={styles.facilities}>
        {facilities.map((item, index) => (
          <div key={index} className={styles.facilitiesIcon}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Facilities;
