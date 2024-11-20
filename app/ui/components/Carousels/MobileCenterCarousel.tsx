"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { useState } from "react";
import "swiper/css";
import "swiper/css/pagination";
import styles from "./MobileCenterCarousel.module.css";
import { Center } from "../../../lib/definitions";
import { Pagination } from "swiper/modules";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const MobileCenterCarousel: React.FC<{ centers: Center[] }> = ({ centers }) => {
  const [currentSlide, setCurrentSlide] = useState(1);

  return (
    <div className={styles.carousel__wrapper}>
      {centers.length > 0 ? (
        centers.map((center) => {
          console.log(`Center ID: ${center.id}, Images:`, center.images);

          return (
            <Swiper
              key={center.id}
              modules={[Pagination]}
              className={styles.carousel__container}
              loop={true}
              onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex + 1)}
              breakpoints={{
                320: {
                  slidesPerView: 1,
                },
                767: {
                  slidesPerView: 1,
                },
              }}
            >
              {center.images && center.images.length > 0 ? (
                center.images.map((image, index) => {
                  return (
                    <SwiperSlide key={index}>
                      <div className={styles.carousel__card}>
                        <img
                          src={center.images[0]}
                          alt={center.name || `Center Image ${index + 1}`}
                          className={styles.carousel__image}
                        />
                        <Link href="/">
                          <ChevronLeftIcon className={styles.carousel__icon} />
                        </Link>
                        <div className={styles.carousel__slideCounter}>
                          {currentSlide}/{center.images.length}
                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })
              ) : (
                <SwiperSlide>
                  <div className={styles.carousel__imagePlaceholder}>
                    Image not available
                  </div>
                </SwiperSlide>
              )}
            </Swiper>
          );
        })
      ) : (
        <div className={styles.carousel__noItems}>No Centers Available</div>
      )}
    </div>
  );
};

export default MobileCenterCarousel;
