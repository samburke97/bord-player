"use client";

import Link from "next/link";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import type { Center } from "@/types";
import type { RootState } from "@/store/store";
import { setHoveredCenter } from "@/store/redux/features/searchSlice";
import styles from "./SearchItem.module.css";
import {
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface SearchItemProps {
  centers: Center[];
  activePin: string | null;
}

const NoResultsView = () => (
  <div
    style={{
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      paddingTop: "60px",
      paddingBottom: "60px",
    }}
  >
    <MagnifyingGlassIcon
      style={{
        width: "40px",
        height: "40px",
        color: "#39b252",
        marginBottom: "16px",
      }}
    />
    <h2
      style={{
        fontSize: "24px",
        fontWeight: 600,
        color: "#ffffff",
        marginBottom: "12px",
        textAlign: "center",
      }}
    >
      No results to display
    </h2>
    <p
      style={{
        fontSize: "16px",
        color: "#7e807e",
        maxWidth: "280px",
        textAlign: "center",
      }}
    >
      Try adjusting your search area
    </p>
  </div>
);

function SearchItem({ centers, activePin }: SearchItemProps) {
  const dispatch = useDispatch();
  const hoveredPin = useSelector(
    (state: RootState) => state.search.hoveredItem
  );
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);

  if (centers.length === 0) {
    return (
      <div
        style={{
          overflow: "hidden",
          position: "relative",
          margin: "auto",
        }}
      >
        <NoResultsView />
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      {centers.map((center) => (
        <Link
          key={center.id}
          href={`/centers/${center.id}`}
          className={`${styles.card} ${
            activePin === center.id ? styles.activeCard : ""
          } ${hoveredPin === center.id ? styles.activeCard : ""}`}
          onMouseEnter={() => dispatch(setHoveredCenter(center.id))}
          onMouseLeave={() => dispatch(setHoveredCenter(null))}
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
                          enabled: hoveredImageId === center.id,
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
                      >
                        <ChevronLeftIcon className={styles.arrowIcon} />
                      </button>
                      <button
                        className={`next-arrow-${center.id} ${styles.carouselArrow} ${styles.carouselArrowNext}`}
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
      ))}
    </div>
  );
}

export default SearchItem;
