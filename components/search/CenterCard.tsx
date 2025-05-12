"use client";

import React, { memo, useCallback, useState, useEffect } from "react";
import Link from "next/link";
import type { Center } from "@/types/entities";
import styles from "./CenterCard.module.css";
import useEmblaCarousel from "embla-carousel-react";
import FavoriteButton from "../ui/FavoriteButton";
import { useDistance } from "@/hooks/useDistance";

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

    // Use the distance hook
    const { distance, loading: distanceLoading } = useDistance(
      center.latitude ? Number(center.latitude) : null,
      center.longitude ? Number(center.longitude) : null
    );

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

    // Primary sport to display in the status line
    const primarySport =
      center.sports && center.sports.length > 0
        ? center.sports[0].name
        : "Sports Center";

    return (
      <Link
        href={`/centers/${center.id}`}
        className={styles.card}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div
          className={styles.imageContainer}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={styles.favoriteContainer}>
            <FavoriteButton centerId={center.id} />
          </div>

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
                      <img
                        src="/icons/utility-outline/left.svg"
                        alt="Previous"
                      />
                    </button>
                  )}

                  {canScrollNext && (
                    <button
                      className={`${styles.carouselButton} ${styles.carouselButtonNext}`}
                      onClick={scrollNext}
                      aria-label="Next image"
                      type="button"
                    >
                      <img src="/icons/utility-outline/right.svg" alt="Next" />
                    </button>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className={styles.imagePlaceholder}>Image not available</div>
          )}
        </div>

        <div className={styles.content}>
          <h3 className={styles.name}>{center.name}</h3>

          <div className={styles.centerMeta}>
            <span className={styles.statusTag}>
              {center.isOpenNow ? "Open Now" : "Closed"}
            </span>
            <span className={styles.metaDot}>•</span>
            <span className={styles.sportType}>{primarySport}</span>
            {distance !== null && !distanceLoading && (
              <>
                <span className={styles.metaDot}>•</span>
                <span className={styles.distance}>{distance} km</span>
              </>
            )}
          </div>

          {/* Facility tags */}
          <div className={styles.tagsContainer}>
            {center.facilities &&
              center.facilities.slice(0, 3).map((facility) => (
                <span key={facility.id} className={styles.tag}>
                  {facility.name}
                </span>
              ))}
          </div>
        </div>
      </Link>
    );
  }
);

CenterCard.displayName = "CenterCard";

export default CenterCard;
