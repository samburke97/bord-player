import React from "react";
import styles from "./ImageLayout.module.css";

type ImageLayoutProps = {
  images: string[];
};

const ImageLayout = ({ images }: ImageLayoutProps) => {
  // Create a copy of images to work with
  const displayImages = [...images];

  // Fill with placeholders if fewer than 5 images
  while (displayImages.length < 5) {
    displayImages.push("");
  }

  return (
    <div className={styles.imageContainer}>
      {/* Hero image (first image) */}
      <div className={styles.heroImage}>
        {displayImages[0] ? (
          <img src={displayImages[0]} alt="Featured view" />
        ) : (
          <div className={styles.placeholder} />
        )}
        <div className={styles.heroLabel}>Centre Scroll Hero</div>
      </div>

      {/* Grid of smaller images */}
      <div className={styles.imageGrid}>
        {displayImages.slice(1, 5).map((image, index) => (
          <div key={index} className={styles.gridItem}>
            {image ? (
              <img src={image} alt={`View ${index + 2}`} />
            ) : (
              <div className={styles.placeholder} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageLayout;
