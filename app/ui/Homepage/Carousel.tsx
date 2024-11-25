"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import styles from "./Carousel.module.css";
import { Center } from "../../lib/definitions";
import { MapPinIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Navigation, Pagination } from "swiper/modules";
import Link from "next/link";

const DUMMY_SPORTS = ["Padel", "Table Tennis"];
const DUMMY_ADDRESS = ["221 High St, London E15 2AE"];

const MyCarousel: React.FC<{ centers: Center[] }> = ({ centers }) => {
  const [swiper, setSwiper] = useState<any>(null);

  const handleNextSlide = () => {
    if (swiper) {
      swiper.slideNext();
    }
  };

  return (
    <div className={styles.carousel__wrapper}>
      <Swiper
        onSwiper={setSwiper}
        modules={[Navigation, Pagination]}
        className={`${styles.carousel__container}`}
        loop={true}
        breakpoints={{
          1145: {
            slidesPerView: 4,
          },
          943: {
            slidesPerView: 3.5,
          },
          783: {
            slidesPerView: 3,
          },
          623: {
            slidesPerView: 2.5,
          },
          464: {
            slidesPerView: 2,
          },
          320: {
            slidesPerView: 1.5,
          },
        }}
      >
        {centers.length > 0 ? (
          centers.map((center) => (
            <SwiperSlide key={center.id}>
              <Link key={center.id} href={`/centers/${center.id}`}>
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
                    {DUMMY_SPORTS.map((sport, index) => (
                      <span key={index} className={styles.carousel__sportPill}>
                        {sport}
                      </span>
                    ))}
                  </div>
                  <div className={styles.carousel__name}>{center.name}</div>
                  {DUMMY_ADDRESS.map((address, index) => (
                    <div key={index} className={styles.carousel__location}>
                      <MapPinIcon className={styles.carousel__icon} />
                      <span className={styles.carousel__address}>
                        {address}
                      </span>
                    </div>
                  ))}
                </div>
              </Link>
            </SwiperSlide>
          ))
        ) : (
          <div className={styles.carousel__noItems}>No Centers Available</div>
        )}
      </Swiper>
      <ArrowRightIcon
        className={styles.carousel__iconArrow}
        onClick={handleNextSlide}
      />
    </div>
  );
};

export default MyCarousel;
