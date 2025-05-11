// components/search/CenterCard.tsx
import React, { memo } from "react";
import Link from "next/link";
import type { Center } from "@/types/entities";
import styles from "./CenterCard.module.css";

interface CenterCardProps {
  center: Center;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

const CenterCard: React.FC<CenterCardProps> = memo(
  ({ center, isActive, onMouseEnter, onMouseLeave, onClick }) => {
    // Default image if none available
    const imageUrl =
      center.images && center.images.length > 0
        ? center.images[0]
        : "/images/placeholder-center.jpg";

    // Get first 3 sports for display
    const displaySports = center.sports?.slice(0, 3) || [];

    return (
      <Link
        href={`/centers/${center.id}`}
        className={`${styles.card} ${isActive ? styles.activeCard : ""}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={(e) => {
          // Allow onClick handler but still navigate
          onClick();
        }}
      >
        <div className={styles.imageContainer}>
          <img
            src={imageUrl}
            alt={center.name}
            className={styles.image}
            loading="lazy"
          />
        </div>

        <div className={styles.content}>
          {/* Sports tags */}
          <div className={styles.tags}>
            {displaySports.map((sport) => (
              <span key={sport.id} className={styles.tag}>
                {sport.name}
              </span>
            ))}
          </div>

          {/* Center name */}
          <h3 className={styles.name}>{center.name}</h3>

          {/* Address */}
          <div className={styles.address}>
            <p>Map</p>
            <span>{center.address || "Address not available"}</span>
          </div>

          {/* Status indicator */}
          <div className={styles.status}>
            <span className={styles.statusIndicator}>
              {center.isOpenNow ? "Open Now" : "Closed"}
            </span>
          </div>
        </div>
      </Link>
    );
  }
);

CenterCard.displayName = "CenterCard";

export default CenterCard;
