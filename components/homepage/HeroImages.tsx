"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Handle pagination dots
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Set up autoplay
  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", onSelect);

    // Set up autoplay identical to the original
    const autoplayInterval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 5000);

    // Clean up
    return () => {
      clearInterval(autoplayInterval);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className={styles.heroImagesContainer}>
      <div className={styles.heroSwiper} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {HERO_IMAGES.map((image, index) => (
            <div key={image.src} className={styles.heroSlide}>
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
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        <div className={styles.emblaPagination}>
          {HERO_IMAGES.map((_, index) => (
            <button
              key={index}
              className={`${styles.emblaPaginationDot} ${
                index === selectedIndex ? styles.emblaPaginationDotActive : ""
              }`}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroImages;
