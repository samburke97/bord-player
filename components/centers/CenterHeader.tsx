import React from "react";
import styles from "./CenterHeader.module.css";
import Image from "next/image";

interface CenterHeaderProps {
  name: string;
  logo?: string | null;
  status?: string;
  type?: string;
  distance?: number | null;
}

// This component is now only used for desktop views
const CenterHeader: React.FC<CenterHeaderProps> = ({
  name,
  logo,
  status = "Open Now",
  type,
  distance,
}) => {
  return (
    <div className={styles.centerHeader}>
      {/* Only render the logo container if a logo exists */}
      {logo && (
        <div className={styles.logoContainer}>
          <img src={logo} alt={`${name} logo`} className={styles.centerLogo} />
        </div>
      )}

      <div
        className={`${styles.centerInfo} ${
          !logo ? styles.centerInfoNoLogo : ""
        }`}
      >
        <h1 className={styles.centerName}>{name}</h1>
        <div className={styles.centerMeta}>
          <span
            className={
              status === "Open Now" ? styles.statusTag : styles.statusClosed
            }
          >
            {status}
          </span>
          {type && <span> • {type}</span>}
          {distance && <span> • {distance} km</span>}
        </div>
      </div>

      <div className={styles.actionButtons}>
        <button className={styles.actionButton} aria-label="Add to favorites">
          <Image
            src="/icons/utility-outline/like.svg"
            alt="Add to favorites"
            width={24}
            height={24}
          />
        </button>
        <button className={styles.actionButton} aria-label="Share">
          <Image
            src="/icons/utility-outline/share.svg"
            alt="Share center"
            width={24}
            height={24}
          />
        </button>
      </div>
    </div>
  );
};

export default CenterHeader;
