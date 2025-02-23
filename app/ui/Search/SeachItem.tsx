"use client";

import Link from "next/link";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import SearchHeader from "./SearchHeader";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Center } from "@/app/types";
import { RootState } from "@/store/store";
import styles from "./SearchItem.module.css";
import {
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { setHoveredCenter } from "@/store/features/searchSlice";

const SearchItem: React.FC<{ centers: Center[]; activePin: string | null }> = ({
  centers,
  activePin,
}) => {
  const dispatch = useDispatch();
  const hoveredPin = useSelector(
    (state: RootState) => state.search.hoveredItem
  );
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);

  return (
    <div className={styles.listContainer}>
      {/* <SearchHeader venueCount={centers.length} /> */}
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
                        nextButton.style.display = swiper.isEnd
                          ? "none"
                          : "flex";
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
                      <SwiperSlide
                        key={index}
                        className={styles.slideContainer}
                      >
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
