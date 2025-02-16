"use client";

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import styles from "./Carousel.module.css";
import { Center } from "../../lib/definitions";
import {
  MapPinIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Navigation, Pagination } from "swiper/modules";
import Link from "next/link";

const MyCarousel: React.FC<{ centers: Center[] }> = ({ centers }) => {
  const [swiper, setSwiper] = useState<any>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [isWideScreen, setIsWideScreen] = useState(true);

  const handleNextSlide = () => {
    if (swiper) {
      swiper.slideNext();
    }
  };

  const handlePrevSlide = () => {
    if (swiper) {
      swiper.slidePrev();
    }
  };

  const onSwiperChange = () => {
    if (swiper) {
      setIsBeginning(swiper.isBeginning);
      setIsEnd(swiper.isEnd);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 1023);
      if (swiper) {
        swiper.update();
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [swiper]);
  return (
    <div className={styles.carousel__wrapper}>
      <div className={isWideScreen ? "content-container" : ""}>
        {!isBeginning && (
          <ArrowLeftIcon
            className={`${styles.carousel__iconArrow} ${styles.carousel__iconArrowLeft}`}
            onClick={handlePrevSlide}
          />
        )}
        <Swiper
          onSwiper={setSwiper}
          onSlideChange={onSwiperChange}
          modules={[Navigation, Pagination]}
          className={`${styles.carousel__container}`}
          loop={false}
          breakpoints={{
            1400: {
              slidesPerView: 4,
            },
            1150: {
              slidesPerView: 3.5,
            },
            1023: {
              slidesPerView: 3.2,
            },
            943: {
              slidesPerView: 3.5,
            },
            783: {
              slidesPerView: 3.1,
            },
            620: {
              slidesPerView: 2.4,
            },
            464: {
              slidesPerView: 1.7,
            },
            320: {
              slidesPerView: 1.3,
            },
          }}
        >
          {centers.length > 0 ? (
            centers.map((center) => (
              <SwiperSlide key={center.id}>
                <Link href={`/centers/${center.id}`}>
                  <div className={styles.carousel__card}>
                    {center.images && center.images.length > 0 ? (
                      <img
                        src={center.images[0]}
                        alt={center.name || "Center Image"}
                        className={styles.carousel__image}
                      />
                    ) : (
                      <div className={styles.carousel__imagePlaceholder}>
                        Image not available
                      </div>
                    )}
                    <div className={styles.carousel__sportsContainer}>
                      {center.sports && center.sports.length > 0 ? (
                        center.sports.map((sport, index) => (
                          <span
                            key={index}
                            className={styles.carousel__sportPill}
                          >
                            {sport.name || "Unknown Facility"}
                          </span>
                        ))
                      ) : (
                        <span className={styles.carousel__sportPill}>
                          No Sports Available
                        </span>
                      )}
                    </div>

                    <div className={styles.carousel__name}>{center.name}</div>

                    {center.address && (
                      <div className={styles.carousel__location}>
                        <MapPinIcon className={styles.carousel__icon} />
                        <span className={styles.carousel__address}>
                          {center.address}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </SwiperSlide>
            ))
          ) : (
            <div className={styles.carousel__noItems}>No Centers Available</div>
          )}
        </Swiper>

        {!isEnd && (
          <ArrowRightIcon
            className={`${styles.carousel__iconArrow} ${styles.carousel__iconArrowRight}`}
            onClick={handleNextSlide}
          />
        )}
      </div>
    </div>
  );
};

export default MyCarousel;
