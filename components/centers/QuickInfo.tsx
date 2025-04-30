import React from "react";
import styles from "./QuickInfo.module.css";

interface QuickInfoProps {
  features: string[];
  sports?: string[];
}

const QuickInfo: React.FC<QuickInfoProps> = ({ features, sports = [] }) => {
  // Combine features and sports, removing duplicates
  const allTags = [...new Set([...features, ...sports])];

  // Limit to maximum 8 tags to prevent overflow
  const displayTags = allTags.slice(0, 8);

  return (
    <div className={styles.quickInfo}>
      {displayTags.map((tag, index) => (
        <div key={index} className={styles.featureTag}>
          {tag}
        </div>
      ))}
    </div>
  );
};

export default QuickInfo;
