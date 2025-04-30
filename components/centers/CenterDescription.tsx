import React from "react";
import styles from "./CenterDescription.module.css";

interface CenterDescriptionProps {
  description?: string;
  websiteUrl?: string;
}

const CenterDescription: React.FC<CenterDescriptionProps> = ({
  description,
  websiteUrl,
}) => {
  if (!description) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.description}>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default CenterDescription;
