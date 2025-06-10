"use client";

import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import styles from "./ActivitiesCarousel.module.css";

interface Activity {
  id?: string;
  title: string;
  imageUrl?: string;
  duration?: string;
  price?: number;
  description?: string;
  type?: string;
  buttonTitle?: string;
  buttonLink?: string;
  pricing?: Array<{
    id: string;
    price: number;
    playerType: string;
    duration: string | null;
    priceType: string;
  }>;
}

interface ActivitiesCarouselProps {
  activities: Activity[];
  title?: string;
  className?: string;
  onActivityClick?: (activity: Activity) => void;
}

const ActivitiesCarousel: React.FC<ActivitiesCarouselProps> = ({
  activities,
  title = "Activities",
  className = "",
  onActivityClick,
}) => {
  const [isDesktop, setIsDesktop] = useState(true);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(false);

  // Different options for desktop and mobile with proper typing
  const emblaOptions: EmblaOptionsType = isDesktop
    ? {
        align: "start",
        loop: false,
        dragFree: true,
        containScroll: "trimSnaps",
        slidesToScroll: 1,
      }
    : {
        align: "start",
        loop: false,
        dragFree: true,
        containScroll: "trimSnaps",
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
      const newOptions: EmblaOptionsType = isDesktop
        ? {
            align: "start",
            loop: false,
            dragFree: false,
            containScroll: "trimSnaps",
            slidesToScroll: 1,
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

    // Add events to catch all state changes
    emblaApi.on("init", updateButtonStates);
    emblaApi.on("select", updateButtonStates);
    emblaApi.on("settle", updateButtonStates);
    emblaApi.on("scroll", updateButtonStates);
    emblaApi.on("reInit", updateButtonStates);

    return () => {
      emblaApi.off("init", updateButtonStates);
      emblaApi.off("select", updateButtonStates);
      emblaApi.off("settle", updateButtonStates);
      emblaApi.off("scroll", updateButtonStates);
      emblaApi.off("reInit", updateButtonStates);
    };
  }, [emblaApi, updateButtonStates]);

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

  // If no activities, return null
  if (!activities || activities.length === 0) {
    return null;
  }

  // Handler for activity card click
  const handleActivityClick = (activity: Activity, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log("Activity clicked:", activity.title);

    if (onActivityClick) {
      onActivityClick(activity);
    }
  };

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
              aria-label="Previous activities"
              disabled={prevBtnDisabled}
              onClick={scrollPrev}
            >
              <ChevronLeftIcon className={styles.navIcon} />
            </button>
            <button
              className={`${styles.navButton} ${
                nextBtnDisabled ? styles.navButtonDisabled : ""
              }`}
              aria-label="Next activities"
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
            {activities.map((activity, index) => (
              <div key={activity.id || index} className={styles.emblaSlide}>
                <div
                  className={styles.activityCard}
                  onClick={(e) => handleActivityClick(activity, e)}
                >
                  <div className={styles.imageContainer}>
                    <img
                      src={activity.imageUrl || "/placeholder.jpg"}
                      alt={activity.title}
                      className={styles.activityImage}
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.activityTitle}>{activity.title}</h3>
                    <div className={styles.activityDetails}>
                      {activity.pricing && activity.pricing.length > 0 ? (
                        <>
                          {activity.pricing[0].duration && (
                            <span className={styles.duration}>
                              {activity.pricing[0].duration}
                            </span>
                          )}
                          {activity.pricing[0].duration &&
                            activity.pricing[0].price && (
                              <span className={styles.separator}>•</span>
                            )}
                          {activity.pricing[0].price && (
                            <span className={styles.price}>
                              from ${activity.pricing[0].price}
                            </span>
                          )}
                        </>
                      ) : (
                        // Fallback to direct properties if pricing array isn't available
                        <>
                          {activity.duration && (
                            <span className={styles.duration}>
                              {activity.duration}
                            </span>
                          )}
                          {activity.duration && activity.price && (
                            <span className={styles.separator}>•</span>
                          )}
                          {activity.price && (
                            <span className={styles.price}>
                              from ${activity.price}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className={styles.emblaEndSpacer}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesCarousel;
