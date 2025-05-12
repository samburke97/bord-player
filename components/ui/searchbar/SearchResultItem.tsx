// components/ui/SearchBar/SearchResultItem.tsx (already refactored)
import React, { memo } from "react";
import Image from "next/image";
import styles from "./SearchBar.module.css";

interface SearchResultItemProps {
  id: string;
  name: string;
  image: string;
  onClick: (name: string) => void;
}

const SearchResultItem = memo(
  ({ id, name, image, onClick }: SearchResultItemProps) => {
    const fallbackImage = "/icons/utility-outline/add-image.svg";

    return (
      <div className={styles.optionRow} onClick={() => onClick(name)}>
        <Image
          src={image}
          alt={name}
          width={40}
          height={40}
          className={styles.centerImage}
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />
        <span>{name}</span>
        <div className={styles.spacer}></div>
        <Image
          src="/icons/utility-outline/right.svg"
          alt="Go"
          width={16}
          height={16}
        />
      </div>
    );
  }
);

SearchResultItem.displayName = "SearchResultItem";

export default SearchResultItem;
