// components/search/map/MapCard.tsx
import React from "react";
import type { Center } from "@/types";
import styles from "./MapCard.module.css";

interface MapCardProps {
  center: Center;
  onCardClick: () => void;
}

const MapCard: React.FC<MapCardProps> = ({ center, onCardClick }) => {
  return (
    <div className={styles.card} onClick={onCardClick}>
      <div className={styles.imageContainer}>
        {center.images && center.images.length > 0 ? (
          <img
            src={center.images[0]}
            alt={center.name}
            className={styles.image}
          />
        ) : (
          <div className={styles.imagePlaceholder}>No Image</div>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{center.name}</h3>
        <div className={styles.address}>
          {center.address || "Address not available"}
        </div>
        <div className={styles.tags}>
          {center.sports &&
            center.sports.slice(0, 3).map((sport, index) => (
              <span key={index} className={styles.tag}>
                {sport.name}
              </span>
            ))}
        </div>
        <div className={styles.status}>
          <span className={center.isOpenNow ? styles.open : styles.closed}>
            {center.isOpenNow ? "Open Now" : "Closed"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapCard;
