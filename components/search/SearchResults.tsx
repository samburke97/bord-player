"use client";

import Link from "next/link";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useSearch } from "@/store/context/search-context";
import { Center } from "@/types";
import {
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import styles from "./SearchResults.module.css";

interface SearchResultsProps {
  centers: Center[];
  isLoading: boolean;
  hasLocation: boolean;
}

export default function SearchResults({
  centers,
  isLoading,
  hasLocation,
}: SearchResultsProps) {
  // Get search context
  const { activePin, hoveredPin, setActivePin, setHoveredPin } = useSearch();

  // State for image hover handling
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);

  // Loading state
  if (isLoading || !hasLocation) {
    return (
      <div className={styles.loadingContainer}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className={styles.skeletonCard}>
            <div className={styles.skeletonImage} />
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonTags}>
                <div className={styles.skeletonTag} />
                <div className={styles.skeletonTag} />
              </div>
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonAddress} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // No results state
  if (centers.length === 0) {
    return (
      <div className={styles.noResultsContainer}>
        <MagnifyingGlassIcon className={styles.noResultsIcon} />
        <h2 className={styles.noResultsTitle}>No results found</h2>
        <p className={styles.noResultsDescription}>
          Try adjusting your search area or search for something else
        </p>
      </div>
    );
  }

  // Results list
  return (
    <div className={styles.resultsContainer}>
      <div className={styles.resultsCount}>
        {centers.length} {centers.length === 1 ? "result" : "results"} found
      </div>

      <div className={styles.resultsList}>
        {centers.map((center) => (
          <Link
            key={center.id}
            href={`/centers/${center.id}`}
            className={`${styles.resultCard} ${
              activePin === center.id || hoveredPin === center.id
                ? styles.activeCard
                : ""
            }`}
            onMouseEnter={() => setHoveredPin(center.id)}
            onMouseLeave={() => setHoveredPin(null)}
            onClick={(e) => {
              // Stop propagation to prevent map interactions
              e.stopPropagation();
              // We don't set activePin here because we're navigating away
            }}
          >
            <div
              className={styles.imageContainer}
              onMouseEnter={() => setHoveredImageId(center.id)}
              onMouseLeave={() => setHoveredImageId(null)}
            >
              {center.images && center.images.length > 0 ? (
                <div className={styles.swiperContainer}>
                  <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={0}
                    slidesPerView={1}
                    loop={center.images.length > 1}
                    pagination={
                      center.images.length > 1
                        ? {
                            clickable: true,
                            enabled: true,
                            type: "bullets",
                          }
                        : false
                    }
                    navigation={
                      center.images.length > 1
                        ? {
                            prevEl: `.prev-${center.id}`,
                            nextEl: `.next-${center.id}`,
                            enabled: hoveredImageId === center.id,
                          }
                        : false
                    }
                  >
                    {center.images.map((image, index) => (
                      <SwiperSlide key={index}>
                        <img
                          src={image}
                          alt={`${center.name} - image ${index + 1}`}
                          className={styles.resultImage}
                          loading="lazy"
                        />
                      </SwiperSlide>
                    ))}

                    {center.images.length > 1 &&
                      hoveredImageId === center.id && (
                        <>
                          <button
                            className={`prev-${center.id} ${styles.navButton} ${styles.prevButton}`}
                            aria-label="Previous image"
                          >
                            <ChevronLeftIcon className={styles.navIcon} />
                          </button>
                          <button
                            className={`next-${center.id} ${styles.navButton} ${styles.nextButton}`}
                            aria-label="Next image"
                          >
                            <ChevronRightIcon className={styles.navIcon} />
                          </button>
                        </>
                      )}
                  </Swiper>
                </div>
              ) : (
                <div className={styles.placeholderImage}>
                  <span>No image available</span>
                </div>
              )}
            </div>

            <div className={styles.contentContainer}>
              <div className={styles.tagsContainer}>
                {center.sports && center.sports.length > 0 ? (
                  center.sports.slice(0, 3).map((sport, index) => (
                    <span key={index} className={styles.tag}>
                      {sport.name}
                    </span>
                  ))
                ) : (
                  <span className={styles.tag}>Center</span>
                )}
              </div>

              <h3 className={styles.centerName}>{center.name}</h3>

              {center.address && (
                <div className={styles.addressContainer}>
                  <MapPinIcon className={styles.addressIcon} />
                  <span className={styles.addressText}>{center.address}</span>
                </div>
              )}

              {center.distance != null && (
                <div className={styles.distanceContainer}>
                  <span className={styles.distanceText}>
                    {center.distance.toFixed(1)} km away
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
