import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";

import styles from "./Facilities.module.css";

const DUMMY_DATA = [
  "Kilter Board",
  "Cafe",
  "Cafe",
  "Cafe",
  "Cafe",
  "Cafe",
  "Cafe",
  "Cafe",
];

const Facilities = ({ facilities }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        <BuildingStorefrontIcon className={styles.icon} />
        <h2>Facilities</h2>
      </div>

      <div className={styles.facilities}>
        {DUMMY_DATA.map((item) => (
          <div className={styles.facilitiesIcon}>{item}</div>
        ))}
      </div>
    </div>
  );
};

export default Facilities;
