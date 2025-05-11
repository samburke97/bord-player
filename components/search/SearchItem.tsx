// components/search/OptimizedSearchItem.tsx
"use client";

import Link from "next/link";
import { useState, useCallback, memo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import type { Center } from "@/types";
import { setHoveredCenter } from "@/store/redux/features/searchSlice";
import styles from "./SearchItem.module.css";
import {
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface CenterCardProps {
  center: Center;
  isActive: boolean;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

// Memoized single center card component
const CenterCard = memo(
  ({
    center,
    isActive,
    isHovered,
    onMouseEnter,
    onMouseLeave,
  }: CenterCardProps) => {
    const [hoveredImageId, setHoveredImageId] = useState<boolean>(false);

    return (
      <Link
        href={`/centers/${center.id}`}
        className={`${styles.card} ${
          isActive || isHovered ? styles.activeCard : ""
        }`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div
          className={styles.imageContainer}
          onMouseEnter={() => setHoveredImageId(true)}
          onMouseLeave={() => setHoveredImageId(false)}
        >
          {center.images && center.images.length > 0 ? (
            <div className={styles.swiperContainer}>
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={0}
                slidesPerView={1}
                loop={false}
                onSlideChange={(swiper) => {
                  const prevButton = document.querySelector(
                    `.prev-arrow-${center.id}`
                  ) as HTMLElement | null;
                  const nextButton = document.querySelector(
                    `.next-arrow-${center.id}`
                  ) as HTMLElement | null;

                  if (prevButton) {
                    prevButton.style.display = swiper.isBeginning
                      ? "none"
                      : "flex";
                  }
                  if (nextButton) {
                    nextButton.style.display = swiper.isEnd ? "none" : "flex";
                  }
                }}
                onInit={(swiper) => {
                  const prevButton = document.querySelector(
                    `.prev-arrow-${center.id}`
                  ) as HTMLElement | null;
                  if (prevButton) {
                    prevButton.style.display = "none";
                  }
                }}
                pagination={
                  center.images.length > 1
                    ? {
                        clickable: true,
                        enabled: true,
                        type: "bullets",
                        renderBullet: (_, className) => {
                          return `<span class="${className}"></span>`;
                        },
                      }
                    : false
                }
                navigation={
                  center.images.length > 1
                    ? {
                        prevEl: `.prev-arrow-${center.id}`,
                        nextEl: `.next-arrow-${center.id}`,
                        enabled: hoveredImageId,
                      }
                    : false
                }
              >
                {center.images.map((image, index) => (
                  <SwiperSlide key={index} className={styles.slideContainer}>
                    <img
                      src={image}
                      alt={`${center.name} image ${index + 1}`}
                      className={styles.image}
                      loading="lazy"
                    />
                  </SwiperSlide>
                ))}
                {center.images.length > 1 && (
                  <>
                    <button
                      className={`prev-arrow-${center.id} ${styles.carouselArrow} ${styles.carouselArrowPrev}`}
                      type="button"
                      aria-label="Previous image"
                    >
                      <ChevronLeftIcon className={styles.arrowIcon} />
                    </button>
                    <button
                      className={`next-arrow-${center.id} ${styles.carouselArrow} ${styles.carouselArrowNext}`}
                      type="button"
                      aria-label="Next image"
                    >
                      <ChevronRightIcon className={styles.arrowIcon} />
                    </button>
                  </>
                )}
              </Swiper>
            </div>
          ) : (
            <div className={styles.imagePlaceholder}>Image not available</div>
          )}
        </div>
        <div className={styles.infoContainer}>
          <div className={styles.sportsContainer}>
            {center.sports && center.sports.length > 0 ? (
              center.sports.slice(0, 3).map((sport, index) => (
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
    );
  }
);

CenterCard.displayName = "CenterCard";

// No results view component
const NoResultsView = memo(() => (
  <div className={styles.noResultsView}>
    <div className={styles.iconWrapper}>
      <MagnifyingGlassIcon className={styles.searchIcon} />
    </div>
    <h2 className={styles.noResultsTitle}>No results to display</h2>
    <p className={styles.noResultsSubtitle}>Try adjusting your search area</p>
  </div>
));

NoResultsView.displayName = "NoResultsView";

interface OptimizedSearchItemProps {
  centers: Center[];
  activePin: string | null;
  onCenterClick?: (centerId: string) => void;
}

function SearchItem({
  centers,
  activePin,
  onCenterClick,
}: OptimizedSearchItemProps) {
  const dispatch = useAppDispatch();
  const hoveredPin = useAppSelector((state) => state.search.hoveredItem);

  const handleMouseEnter = useCallback(
    (centerId: string) => {
      dispatch(setHoveredCenter(centerId));
    },
    [dispatch]
  );

  const handleMouseLeave = useCallback(() => {
    dispatch(setHoveredCenter(null));
  }, [dispatch]);

  if (centers.length === 0) {
    return <NoResultsView />;
  }

  return (
    <div className={styles.listContainer}>
      {centers.map((center) => (
        <CenterCard
          key={center.id}
          center={center}
          isActive={activePin === center.id}
          isHovered={hoveredPin === center.id}
          onMouseEnter={() => handleMouseEnter(center.id)}
          onMouseLeave={handleMouseLeave}
        />
      ))}
    </div>
  );
}

export default memo(SearchItem);
