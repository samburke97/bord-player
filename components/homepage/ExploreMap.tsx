import React from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "../ui/Button";
import styles from "./ExploreMap.module.css";

const ExploreMap: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.mapWrapper}>
        <Image
          src="/images/map/map.png"
          alt="Interactive Map"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        <div className={styles.buttonContainer}>
          <Link href="/search">
            <Button size="lg">Explore Map</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ExploreMap;
