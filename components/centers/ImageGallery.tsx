"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import styles from "./ImageGallery.module.css";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ImageGalleryProps {
  images: string[];
  logoUrl?: string | null;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, logoUrl }) => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  // State for navigation bar background
  const [navBackground, setNavBackground] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Handle back button click
  const handleBackClick = () => {
    router.back();
  };

  // Handle scroll for navigation background
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const logoPosition = window.innerHeight * 0.3;

      if (window.scrollY > logoPosition) {
        setNavBackground(true);
      } else {
        setNavBackground(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const displayImages = [...images];
  while (displayImages.length < 5) {
    displayImages.push("");
  }

  useEffect(() => {
    if (emblaApi) {
      setSlideCount(emblaApi.slideNodes().length);
    }
  }, [emblaApi]);

  // Embla carousel controls
  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  // Track the current slide
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect(); // Set initial index

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // For mobile view
  if (isMobile) {
    return (
      <div className={styles.mobileView}>
        <div className={styles.mobileCarousel}>
          <div
            ref={navRef}
            className={`${styles.carouselNav} ${
              navBackground ? styles.carouselNavSolid : ""
            }`}
          >
            <button
              className={styles.backButton}
              onClick={handleBackClick}
              aria-label="Go back to previous page"
            >
              <Image
                src="/icons/utility-outline/back.svg"
                alt="Go back"
                width={24}
                height={24}
              />
            </button>
            <div className={styles.actionButtons}>
              <button className={styles.actionButton}>
                <Image
                  src="/icons/utility-outline/like.svg"
                  alt="Add to favorites"
                  width={24}
                  height={24}
                />
              </button>
              <button className={styles.actionButton}>
                <Image
                  src="/icons/utility-outline/share.svg"
                  alt="Share center"
                  width={24}
                  height={24}
                />
              </button>
            </div>
          </div>

          <div className={styles.emblaContainer} ref={emblaRef}>
            <div className={styles.emblaSlides}>
              {displayImages.map((image, index) => (
                <div key={index} className={styles.emblaSlide}>
                  {image ? (
                    <img src={image} alt={`Center view ${index + 1}`} />
                  ) : (
                    <div className={styles.imagePlaceholder}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.slideCounter}>
            {selectedIndex + 1}/{slideCount}
          </div>

          {/* Only show the logo overlay if logoUrl exists */}
          {logoUrl && (
            <div className={styles.logoOverlay}>
              <div className={styles.logoContainer}>
                <img src={logoUrl} alt="Center logo" className={styles.logo} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // For desktop view - the regular grid layout
  return (
    <div className={styles.imageGrid}>
      <div className={styles.mainImageContainer}>
        {displayImages[0] ? (
          <img
            src={displayImages[0]}
            alt="Main view"
            className={styles.mainImage}
          />
        ) : (
          <div className={styles.imagePlaceholder}></div>
        )}
      </div>

      <div className={styles.sideImages}>
        {displayImages.slice(1, 5).map((image, index) => (
          <div key={index} className={styles.sideImageContainer}>
            {image ? (
              <img
                src={image}
                alt={`Side view ${index + 1}`}
                className={styles.sideImage}
              />
            ) : (
              <div className={styles.imagePlaceholder}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
