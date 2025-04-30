import React from "react";
import styles from "./StickySidebar.module.css";
import Image from "next/image";

interface StickySidebarProps {
  showCenterInfo: boolean; // New prop to control visibility of center info
  centerName: string;
  centerType: string;
  websiteUrl: string | null;
  isOpen: boolean;
  distance?: number;
}

const StickySidebar: React.FC<StickySidebarProps> = ({
  showCenterInfo,
  centerName,
  centerType,
  websiteUrl,
  isOpen,
  distance,
}) => {
  if (!websiteUrl) return null;

  return (
    <div className={styles.sidebar}>
      {/* Center details - ONLY shown when hero is out of view (showCenterInfo is true) */}
      {showCenterInfo && (
        <div className={styles.centerInfo}>
          <h2 className={styles.centerName}>{centerName}</h2>
          <div className={styles.centerMeta}>
            <span className={isOpen ? styles.statusOpen : styles.statusClosed}>
              {isOpen ? "Open Now" : "Closed Now"}
            </span>
            <span> • </span>
            <span>{centerType}</span>
            {distance && (
              <>
                <span> • </span>
                <span>{distance} km</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Visit Website Button - always shown */}
      <div className={styles.visitBtnContainer}>
        <a
          href={websiteUrl}
          className={styles.visitButton}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit Website
        </a>
      </div>

      {/* Information Notice - always shown */}
      <div className={styles.noticeContainer}>
        <div className={styles.noticeIcon}>
          <Image
            src="/icons/utility-outline/info.svg"
            alt="Information"
            width={24}
            height={24}
          />
        </div>
        <p className={styles.noticeText}>
          While {centerName} hasn't joined us yet, you can still book and find
          details on their website.
        </p>
      </div>
    </div>
  );
};

export default StickySidebar;
