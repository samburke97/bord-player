"use client";

import React, { memo, useCallback, useState, useEffect } from "react";
import Link from "next/link";
import type { Center } from "@/types/entities";
import styles from "./CenterCard.module.css";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface CenterCardProps {
  center: Center;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const CenterCard: React.FC<CenterCardProps> = memo(
  ({ center, onMouseEnter, onMouseLeave }) => {
    const images =
      center.images && center.images.length > 0
        ? center.images
        : ["/images/placeholder-center.jpg"];

    // Get first 3 sports for display
    const displaySports = center.sports?.slice(0, 3) || [];

    const [isHovered, setIsHovered] = useState(false);

    const [currentSlide, setCurrentSlide] = useState(0);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const [emblaRef, emblaApi] = useEmblaCarousel({
      loop: false,
      skipSnaps: false,
      containScroll: "trimSnaps",
      align: "start",
      slidesToScroll: 1,
    });

    // Navigation handlers
    const scrollPrev = useCallback(
      (e?: React.MouseEvent) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        emblaApi && emblaApi.scrollPrev();
      },
      [emblaApi]
    );

    const scrollNext = useCallback(
      (e?: React.MouseEvent) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        emblaApi && emblaApi.scrollNext();
      },
      [emblaApi]
    );

    // Update state on slide change
    useEffect(() => {
      if (!emblaApi) return;

      const onSelect = () => {
        setCurrentSlide(emblaApi.selectedScrollSnap());
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
      };

      // Update on initialization
      onSelect();

      // Subscribe to select event
      emblaApi.on("select", onSelect);
      emblaApi.on("reInit", onSelect);

      return () => {
        emblaApi.off("select", onSelect);
        emblaApi.off("reInit", onSelect);
      };
    }, [emblaApi]);

    return (
      <Link
        href={`/centers/${center.id}`}
        className={styles.card}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        // No onClick handler - let Link handle navigation
      >
        <div
          className={styles.imageContainer}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {images.length > 0 ? (
            <div className={styles.carouselContainer}>
              <div className={styles.emblaViewport} ref={emblaRef}>
                <div className={styles.emblaContainer}>
                  {images.map((imageUrl, index) => (
                    <div className={styles.emblaSlide} key={index}>
                      <div className={styles.emblaSlideInner}>
                        <img
                          src={imageUrl}
                          alt={`${center.name} image ${index + 1}`}
                          className={styles.image}
                          loading="lazy"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation arrows - only when hovering and there are multiple images */}
              {images.length > 1 && isHovered && (
                <>
                  {canScrollPrev && (
                    <button
                      className={`${styles.carouselButton} ${styles.carouselButtonPrev}`}
                      onClick={scrollPrev}
                      aria-label="Previous image"
                      type="button"
                    >
                      <ChevronLeftIcon className={styles.buttonIcon} />
                    </button>
                  )}

                  {canScrollNext && (
                    <button
                      className={`${styles.carouselButton} ${styles.carouselButtonNext}`}
                      onClick={scrollNext}
                      aria-label="Next image"
                      type="button"
                    >
                      <ChevronRightIcon className={styles.buttonIcon} />
                    </button>
                  )}
                </>
              )}

              {/* Pagination dots - always visible when there are multiple images */}
              {images.length > 1 && (
                <div className={styles.pagination}>
                  {images.map((_, index) => (
                    <span
                      key={index}
                      className={`${styles.paginationDot} ${
                        currentSlide === index ? styles.active : ""
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.imagePlaceholder}>Image not available</div>
          )}
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.icon}
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
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
