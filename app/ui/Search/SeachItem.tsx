"use client";

import Link from "next/link";
import { Center } from "@/app/lib/definitions";
import styles from "./SearchItem.module.css";
import { MapPinIcon } from "@heroicons/react/24/outline";

const SearchItem: React.FC<{ centers: Center[]; activePin: string | null }> = ({
  centers,
  activePin,
}) => {
  return (
    <div className={styles.listContainer}>
      {centers.length === 0 ? (
        <div className={styles.noResultsCard}>
          <div className={styles.noResultsInner}>
            <h2>No Matches Found</h2>
            <p>Adjust your search and try again</p>
          </div>
        </div>
      ) : (
        centers.map((center) => (
          <Link
            key={center.id}
            href={`/centers/${center.id}`}
            className={`${styles.card} ${
              activePin === center.id ? styles.activeCard : ""
            }`}
          >
            <div className={styles.imageContainer}>
              {center.images && center.images.length > 0 ? (
                <img
                  src={center.images[0]}
                  alt={center.name || "Center Image"}
                  className={styles.image}
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  Image not available
                </div>
              )}
            </div>
            <div className={styles.infoContainer}>
              <div className={styles.sportsContainer}>
                {center.sports.length > 0 ? (
                  center.sports.map((sport, index) => (
                    <span key={index} className={styles.sportPill}>
                      {sport.name}
                    </span>
                  ))
                ) : (
                  <span className={styles.sportPill}>No sports available</span>
                )}
              </div>
              <div className={styles.name}>{center.name}</div>
              <div className={styles.location}>
                <MapPinIcon className={styles.icon} />
                <span className={styles.address}>{center.address}</span>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
};

export default SearchItem;
