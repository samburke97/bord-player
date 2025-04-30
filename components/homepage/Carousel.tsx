"use client";

import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./Carousel.module.css";
import { CenterSummary } from "../../types";

const FALLBACK_IMAGE = "/images/placeholder.jpg";

interface CarouselProps {
  title: string;
  centers: CenterSummary[];
  className?: string;
}

const FavoriteButton: React.FC<{
  centerId: string;
  isLoggedIn?: boolean;
}> = ({ centerId, isLoggedIn = false }) => {
  const router = useRouter();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation

    if (!isLoggedIn) {
      // Redirect to login page if not logged in
      router.push("/login");
      return;
    }

    // TODO: Implement actual favorite logic
  };

  return (
    <button
      onClick={handleFavoriteClick}
      className={styles.favoriteButton}
      aria-label="Add to favorites"
    >
      <Image
        src="/icons/utility-outline/heart.svg"
        alt="Favorite"
        width={24}
        height={24}
        className={styles.favoriteIcon}
      />
    </button>
  );
};

const Carousel: React.FC<CarouselProps> = ({
  title,
  centers,
  className = "",
}) => {
  const [isDesktop, setIsDesktop] = useState(true);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(false);

  // Different options for desktop and mobile
  const emblaOptions = isDesktop
    ? {
        align: "start",
        loop: false,
        dragFree: true,
        containScroll: "trimSnaps",
        slidesToScroll: 4, // Changed from 4 to 1 for better control
      }
    : {
        align: "start",
        loop: false,
        dragFree: true,
        containScroll: true,
        skipSnaps: true,
      };

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1028);
    };

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (emblaApi) {
      const newOptions = isDesktop
        ? {
            align: "start",
            loop: false,
            dragFree: false,
            containScroll: "trimSnaps",
            slidesToScroll: 1, // Changed from 4 to 1 for better control
          }
        : {
            align: "start",
            loop: false,
            dragFree: true,
            containScroll: "trimSnaps",
            skipSnaps: true,
          };

      emblaApi.reInit(newOptions);
    }
  }, [isDesktop, emblaApi]);

  const updateButtonStates = useCallback(() => {
    if (!emblaApi) return;

    const canScrollPrev = emblaApi.canScrollPrev();
    const canScrollNext = emblaApi.canScrollNext();

    setPrevBtnDisabled(!canScrollPrev);
    setNextBtnDisabled(!canScrollNext);
  }, [emblaApi]);

  // Setup scrolling listeners
  useEffect(() => {
    if (!emblaApi) return;

    // Call once to set initial state
    updateButtonStates();

    // Add additional events to catch all state changes
    emblaApi.on("init", updateButtonStates);
    emblaApi.on("select", updateButtonStates);
    emblaApi.on("settle", updateButtonStates);
    emblaApi.on("scroll", updateButtonStates);
    emblaApi.on("reInit", updateButtonStates);

    // Also update on scroll progress to catch intermediate states
    emblaApi.on("scrollProgress", updateButtonStates);

    return () => {
      emblaApi.off("init", updateButtonStates);
      emblaApi.off("select", updateButtonStates);
      emblaApi.off("settle", updateButtonStates);
      emblaApi.off("scroll", updateButtonStates);
      emblaApi.off("reInit", updateButtonStates);
      emblaApi.off("scrollProgress", updateButtonStates);
    };
  }, [emblaApi, updateButtonStates]);

  // Scroll navigation handlers
  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      if (isDesktop) {
        // Scroll back by 4 slides or to the start
        const currentIndex = emblaApi.selectedScrollSnap();
        const targetIndex = Math.max(0, currentIndex - 4);
        emblaApi.scrollTo(targetIndex);
      } else {
        emblaApi.scrollPrev();
      }
    }
  }, [emblaApi, isDesktop]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      if (isDesktop) {
        // Scroll forward by 4 slides or to the end
        const currentIndex = emblaApi.selectedScrollSnap();
        const totalSlides = emblaApi.scrollSnapList().length;
        const targetIndex = Math.min(totalSlides - 1, currentIndex + 4);
        emblaApi.scrollTo(targetIndex);
      } else {
        emblaApi.scrollNext();
      }
    }
  }, [emblaApi, isDesktop]);

  return (
    <div className={`${styles.carouselSection} ${className}`}>
      <div className={styles.carouselHeader}>
        <h2 className={styles.carouselTitle}>{title}</h2>
        {isDesktop && (
          <div className={styles.navigationButtons}>
            <button
              className={`${styles.navButton} ${
                prevBtnDisabled ? styles.navButtonDisabled : ""
              }`}
              aria-label="Previous slides"
              disabled={prevBtnDisabled}
              onClick={scrollPrev}
            >
              <ChevronLeftIcon className={styles.navIcon} />
            </button>
            <button
              className={`${styles.navButton} ${
                nextBtnDisabled ? styles.navButtonDisabled : ""
              }`}
              aria-label="Next slides"
              disabled={nextBtnDisabled}
              onClick={scrollNext}
            >
              <ChevronRightIcon className={styles.navIcon} />
            </button>
          </div>
        )}
      </div>

      <div className={styles.emblaWrapper}>
        <div className={styles.embla} ref={emblaRef}>
          <div className={styles.emblaContainer}>
            {centers.length > 0 ? (
              <>
                {centers.map((center) => (
                  <div key={center.id} className={styles.emblaSlide}>
                    <Link
                      href={`/centers/${center.id}`}
                      className={styles.cardLink}
                    >
                      <div className={styles.card}>
                        <div className={styles.cardImageContainer}>
                          {center.imageUrl ? (
                            <Image
                              src={center.imageUrl}
                              alt={center.name || "Center"}
                              fill
                              className={styles.cardImage}
                              style={{ objectFit: "cover" }}
                            />
                          ) : (
                            <div className={styles.cardImagePlaceholder}>
                              No image available
                            </div>
                          )}
                          <FavoriteButton centerId={center.id} />
                        </div>

                        <div className={styles.cardContent}>
                          <div className={styles.tagsContainer}>
                            {center.sports && center.sports.length > 0 ? (
                              center.sports.slice(0, 2).map((sport, idx) => (
                                <span
                                  key={`${center.id}-sport-${idx}`}
                                  className={styles.tag}
                                >
                                  {sport.name || "Unknown Sport"}
                                </span>
                              ))
                            ) : (
                              <span className={styles.tag}>No Sports</span>
                            )}
                          </div>

                          <h3 className={styles.cardTitle}>{center.name}</h3>

                          {center.address && (
                            <div className={styles.cardLocation}>
                              <MapPinIcon className={styles.locationIcon} />
                              <span className={styles.locationText}>
                                {center.address}
                              </span>
                            </div>
                          )}

                          <div className={styles.tagsRow}>
                            {center.facilities && center.facilities.length > 0
                              ? center.facilities
                                  .slice(0, 3)
                                  .map((facility, idx) => (
                                    <span
                                      key={`${center.id}-facility-${idx}`}
                                      className={styles.facilityTag}
                                    >
                                      {facility.name || ""}
                                    </span>
                                  ))
                              : null}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
                <div className={styles.emblaEndSpacer}></div>
              </>
            ) : (
              <div className={styles.noResults}>No centers available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carousel;
