import styles from "./ImageLayout.module.css";

const ImageLayout = () => {
  return (
    <div>
      <div className={styles.imageContainer}>
        <img
          src="/images/test.jpg"
          alt="Climbing wall 1"
          className={styles.heroImage}
        />
        <div className={styles.imageContainer__sub}>
          <img
            src="/images/test2.jpg"
            alt="Climbing wall 2"
            className={styles.subImage}
          />
          <img
            src="/images/test3.jpg"
            alt="Climbing wall 3"
            className={styles.subImage}
          />
          <img
            src="/images/test4.jpg"
            alt="Climbing wall 4"
            className={styles.subImage}
          />
          <img
            src="/images/test5.jpg"
            alt="Climbing wall 5"
            className={styles.subImage}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageLayout;
