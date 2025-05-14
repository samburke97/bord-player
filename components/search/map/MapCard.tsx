import React from "react";
import Link from "next/link";
import styles from "./MapCard.module.css";
import type { Center } from "@/types";

interface MapCardProps {
  center: Center;
  onCardClick?: () => void;
}

const MapCard: React.FC<MapCardProps> = ({ center, onCardClick }) => {
  // Get primary image
  const image =
    center.images && center.images.length > 0
      ? center.images[0]
      : "/images/placeholder-center.jpg";

  // Get first 3 facilities for display
  const displayFacilities = center.facilities?.slice(0, 3) || [];

  const handleClick = (e: React.MouseEvent) => {
    if (onCardClick) {
      e.preventDefault();
      onCardClick();
    }
  };

  return (
    <Link
      href={`/centers/${center.id}`}
      className={styles.card}
      onClick={handleClick}
    >
      <div className={styles.imageContainer}>
        <img
          src={image}
          alt={center.name}
          className={styles.image}
          loading="lazy"
        />
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{center.name}</h3>

        <div className={styles.centerMeta}>
          <span
            className={
              center.isOpenNow ? styles.openStatus : styles.closedStatus
            }
          >
            {center.isOpenNow ? "Open Now" : "Closed Now"}
          </span>

          {center.sports && center.sports.length > 0 && (
            <>
              <span className={styles.metaDot}>•</span>
              <span className={styles.sportType}>{center.sports[0].name}</span>
            </>
          )}

          {center.distance && (
            <>
              <span className={styles.metaDot}>•</span>
              <span className={styles.distance}>{center.distance} km</span>
            </>
          )}
        </div>

        {/* Facility tags */}
        {displayFacilities.length > 0 && (
          <div className={styles.tagsContainer}>
            {displayFacilities.map((facility) => (
              <span key={facility.id} className={styles.tag}>
                {facility.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default MapCard;
