"use client";

import React, { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import styles from "./ActivityModal.module.css";

interface PricingOption {
  id: string;
  price: number;
  playerType: string;
  duration: string | null;
  priceType: string;
}

interface Activity {
  id?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  buttonTitle?: string;
  buttonLink?: string;
  type?: string;
  pricing?: PricingOption[];
}

interface ActivityModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
}

const ActivityModal: React.FC<ActivityModalProps> = ({
  activity,
  isOpen,
  onClose,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen || !activity) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContainer} ${
          isMobile ? styles.mobileModal : styles.desktopModal
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close"
        >
          <XMarkIcon className={styles.closeIcon} />
        </button>

        {/* Modal Header with title */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {activity.title} {isMobile ? "Entry" : "Pass"}
          </h2>
        </div>

        {/* Modal Content */}
        <div className={styles.modalContent}>
          {/* Activity Image */}
          {activity.imageUrl ? (
            <div className={styles.imageContainer}>
              <img
                src={activity.imageUrl}
                alt={activity.title}
                className={styles.activityImage}
              />
            </div>
          ) : (
            <div className={styles.imagePlaceholder}></div>
          )}

          {/* Activity Description */}
          {activity.description && (
            <div className={styles.descriptionContainer}>
              <p className={styles.description}>{activity.description}</p>
            </div>
          )}

          {/* Pricing Options */}
          {activity.pricing && activity.pricing.length > 0 && (
            <div className={styles.pricingSection}>
              <h3 className={styles.pricingTitle}>{activity.type}</h3>

              <div className={styles.pricingTable}>
                {activity.pricing.map((option) => (
                  <div key={option.id} className={styles.pricingRow}>
                    <div className={styles.pricingType}>
                      <span className={styles.playerType}>
                        {option.playerType}
                      </span>
                      {option.duration && (
                        <span className={styles.duration}>
                          {" "}
                          • {option.duration}
                        </span>
                      )}
                    </div>
                    <div className={styles.pricingPrice}>
                      ${option.price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Call to Action Button */}
        <div className={styles.activityFooter}>
          {activity.buttonLink ? (
            <a
              href={activity.buttonLink}
              className={styles.actionButton}
              target="_blank"
              rel="noopener noreferrer"
            >
              {activity.buttonTitle ||
                (isMobile ? "Register Now" : "Visit Now")}
            </a>
          ) : (
            <button className={styles.actionButton}>
              {isMobile ? "Register Now" : "Visit Now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityModal;
