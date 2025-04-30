import React from "react";
import styles from "./FacilitiesSection.module.css";
import Image from "next/image";

interface Facility {
  id: string;
  name: string;
}

interface FacilitiesSectionProps {
  facilities: Facility[];
}

const FacilitiesSection: React.FC<FacilitiesSectionProps> = ({
  facilities,
}) => {
  if (!facilities || facilities.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Facilities</h2>
      <div className={styles.grid}>
        {facilities.map((facility) => (
          <div key={facility.id} className={styles.facilityItem}>
            <div className={styles.icon}>
              {" "}
              <Image
                src="/icons/utility-outline/like.svg"
                alt="Share center"
                width={24}
                height={24}
              />
            </div>
            <span className={styles.name}>{facility.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FacilitiesSection;
