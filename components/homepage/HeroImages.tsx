"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

import styles from "./HeroImages.module.css";

const HERO_IMAGES = [
  {
    src: "/images/hero/rock-climbing.png",
    alt: "Rock Climbing",
    title: "Rock Climbing",
    searchQuery: "rock climbing",
  },
  {
    src: "/images/hero/tennis.png",
    alt: "Tennis",
    title: "Tennis",
    searchQuery: "tennis",
  },
  {
    src: "/images/hero/golf.png",
    alt: "Golf",
    title: "Golf",
    searchQuery: "golf",
  },
];

const HeroImages: React.FC = () => {
  return (
    <div className={styles.heroImagesContainer}>
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{
          clickable: true,
          // Use Swiper's built-in pagination instead of custom element
          // This ensures proper rendering of pagination bullets
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        className={styles.heroSwiper}
      >
        {HERO_IMAGES.map((image, index) => (
          <SwiperSlide key={image.src} className={styles.heroSlide}>
            <div className={styles.imageWrapper}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={index === 0}
                className={styles.heroImage}
              />
              <Link
                href={`/search?q=${encodeURIComponent(image.searchQuery)}`}
                className={styles.imageOverlay}
              >
                <span className={styles.activityTitle}>{image.title}</span>
                <Image
                  src="/icons/utility-outline/forward.svg"
                  alt="Forward"
                  width={24}
                  height={24}
                  className={styles.forwardIcon}
                />
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroImages;
