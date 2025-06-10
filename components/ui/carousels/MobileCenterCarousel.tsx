"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import styles from "./MobileCenterCarousel.module.css";
import { Center } from "@/types";
import { Pagination } from "swiper/modules";
import Link from "next/link";

const MobileCenterCarousel: React.FC<{ centers: Center[] }> = ({ centers }) => {
  const [currentSlide, setCurrentSlide] = useState(1);

  if (!centers || centers.length === 0) {
    return <div className={styles.carousel__noItems}>No Centers Available</div>;
  }

  const center = centers[0];
  const images = center.images || [];

  return (
    <div className={styles.carousel__wrapper}>
      <Swiper
        modules={[Pagination]}
        className={styles.carousel__container}
        loop={images.length > 1}
        onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex + 1)}
        pagination={{ clickable: true }}
        breakpoints={{
          320: {
            slidesPerView: 1,
          },
          767: {
            slidesPerView: 1,
          },
        }}
      >
        {images.length > 0 ? (
          images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className={styles.carousel__card}>
                <img
                  src={image}
                  alt={center.name || `Center Image ${index + 1}`}
                  className={styles.carousel__image}
                />
                <Link href="/" className={styles.carousel__backLink}>
                  <span className={styles.carousel__icon}></span>
                </Link>
                <div className={styles.carousel__slideCounter}>
                  {currentSlide}/{images.length}
                </div>
              </div>
            </SwiperSlide>
          ))
        ) : (
          <SwiperSlide>
            <div className={styles.carousel__imagePlaceholder}>
              Image not available
            </div>
          </SwiperSlide>
        )}
      </Swiper>

      <div className={styles.carousel__centerInfo}>
        <div className={styles.carousel__centerLogo}>
          {center.logoUrl && (
            <img src={center.logoUrl} alt={`${center.name} logo`} />
          )}
        </div>
        <div className={styles.carousel__centerDetails}>
          <h2>{center.name}</h2>
          <div className={styles.carousel__centerStatus}>
            <span className={styles.carousel__statusOpen}>Open Now</span>
            {center.type && (
              <span className={styles.carousel__centerType}>
                {" "}
                • {center.type}
              </span>
            )}
            {center.distance && (
              <span className={styles.carousel__distance}>
                {" "}
                • {center.distance} km
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileCenterCarousel;
