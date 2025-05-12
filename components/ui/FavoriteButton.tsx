"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./FavoriteButton.module.css";

const FavoriteButton: React.FC<{
  centerId: string;
  isLoggedIn?: boolean;
}> = ({ centerId, isLoggedIn = false }) => {
  const router = useRouter();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
  };

  return (
    <button
      onClick={handleFavoriteClick}
      className={styles.favoriteButton}
      aria-label="Add to favorites"
    >
      <Image
        src="/icons/utility-outline/heart.svg"
        alt="Favorite"
        width={24}
        height={24}
        className={styles.favoriteIcon}
      />
    </button>
  );
};

export default FavoriteButton;
