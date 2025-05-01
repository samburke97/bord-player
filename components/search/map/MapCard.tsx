import React from "react";
import { Center } from "@/types";
import styles from "./MapCard.module.css";

interface MapCardProps {
  center: Center;
  onCardClick: () => void;
}

const MapCard: React.FC<MapCardProps> = ({ center, onCardClick }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardImageContainer}>
        {center.images && center.images.length > 0 ? (
          <img
            src={center.images[0]}
            alt={center.name}
            className={styles.cardImage}
          />
        ) : (
          <div className={styles.cardImagePlaceholder}>No Image</div>
        )}
      </div>
      <div className={styles.cardContent}>
        <div className={styles.tagsRow}>
          {center.sports &&
            center.sports.slice(0, 3).map((sport) => (
              <span key={sport.id} className={styles.tag}>
                {sport.name}
              </span>
            ))}
          {center.facilities &&
            center.facilities.slice(0, 3).map((facility) => (
              <span key={facility.id} className={styles.facilityTag}>
                {facility.name}
              </span>
            ))}
        </div>

        <h2 className={styles.cardTitle}>{center.name || "Unknown Center"}</h2>

        <div className={styles.cardLocation}>
          <span
            className={
              center.isOpenNow ? styles.statusTag : styles.statusClosed
            }
          >
            {center.isOpenNow ? "Open Now" : "Closed Now"}
          </span>
          • {center.distance ? `${center.distance} km` : "Unknown distance"}
        </div>
      </div>
    </div>
  );
};

export default MapCard;
