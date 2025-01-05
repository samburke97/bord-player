import styles from "./ImageLayout.module.css";

type ImageLayoutProps = {
  images: string[];
};

const ImageLayout = ({ images }: ImageLayoutProps) => {
  const totalImages = 5;
  const placeholdersNeeded = totalImages - images.length;

  return (
    <div>
      <div className={styles.imageContainer}>
        {images[0] ? (
          <div className={styles.heroImage}>
            <img src={images[0]} alt={`Image 1`} />
          </div>
        ) : (
          <div className={`${styles.heroImage} ${styles.placeholder}`} />
        )}

        <div className={styles.imageContainer__sub}>
          {images.slice(1, 5).map((image, index) => (
            <div key={index} className={styles.subImage}>
              <img src={image} alt={`Image ${index + 2}`} />
            </div>
          ))}

          {Array.from({ length: placeholdersNeeded }, (_, index) => (
            <div
              key={`placeholder-${index}`}
              className={`${styles.subImage} ${styles.placeholder}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageLayout;
