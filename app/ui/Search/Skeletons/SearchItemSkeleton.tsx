import styles from "./SearchItemSkeleton.module.css";

const SearchItemSkeleton = () => {
  return (
    <div className={styles.listContainer}>
      {[1, 2, 3].map((index) => (
        <div key={index} className={`${styles.card}`}>
          <div className={styles.imageContainer}>
            <div className={styles.skeletonImage} />
          </div>
          <div className={styles.infoContainer}>
            <div className={styles.sportsContainer}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonPill} />
              ))}
            </div>
            <div className={styles.skeletonName} />
            <div className={styles.location}>
              <div className={styles.skeletonIcon} />
              <div className={styles.skeletonAddress} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchItemSkeleton;
