import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import styles from "./Facilities.module.css";

interface FacilitiesProps {
  facilities: Array<{ id: string; name: string }>;
}

const Facilities: React.FC<FacilitiesProps> = ({ facilities }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        <BuildingStorefrontIcon className={styles.icon} />
        <h2>Facilities</h2>
      </div>

      <div className={styles.facilities}>
        {facilities.map((item) => (
          <div key={item.id} className={styles.facilitiesIcon}>
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Facilities;
