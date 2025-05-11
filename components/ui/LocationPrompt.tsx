// components/ui/LocationHelp.tsx
import React from "react";
import styles from "./LocationPrompt.module.css";

interface LocationHelpProps {
  onClose: () => void;
}

const LocationHelp: React.FC<LocationHelpProps> = ({ onClose }) => {
  return (
    <div className={styles.helpContainer}>
      <div className={styles.helpContent}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h3 className={styles.title}>Location Access</h3>
        <p className={styles.message}>
          You've denied location access. We're currently showing approximate
          locations based on your network.
        </p>
        <div className={styles.instructions}>
          <h4>To enable precise location:</h4>
          <ol>
            <li>Click the lock/info icon in your browser's address bar</li>
            <li>Find "Location" or "Site settings"</li>
            <li>Change the permission to "Allow"</li>
            <li>Refresh this page</li>
          </ol>
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          Continue with approximate location
        </button>
      </div>
    </div>
  );
};

export default LocationHelp;
