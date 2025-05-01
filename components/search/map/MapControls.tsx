import { motion } from "framer-motion";
import { Gps, Add, Minus } from "iconsax-react";
import styles from "../SearchMap.module.css";
import { useAppSelector } from "@/store/hooks";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onGeolocate: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onGeolocate,
}) => {
  // Check if we have a valid user location
  const userLocation = useAppSelector((state) => state.search.userLocation);
  const hasValidLocation = userLocation !== null;

  return (
    <div className={styles.customControls}>
      <motion.button
        onClick={onGeolocate}
        className={`${styles.controlButton} ${
          !hasValidLocation ? styles.controlButtonDisabled : ""
        }`}
        whileHover={hasValidLocation ? { scale: 1.1 } : {}}
        whileTap={hasValidLocation ? { scale: 0.9 } : {}}
        title={hasValidLocation ? "Go to my location" : "Location unavailable"}
        disabled={!hasValidLocation}
      >
        <Gps
          size={24}
          variant="Bold"
          color={hasValidLocation ? "white" : "gray"}
        />
      </motion.button>

      <motion.button
        onClick={onZoomIn}
        className={styles.controlButton}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Zoom in"
      >
        <Add size={24} />
      </motion.button>

      <motion.button
        onClick={onZoomOut}
        className={styles.controlButton}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Zoom out"
      >
        <Minus size={24} />
      </motion.button>
    </div>
  );
};

export default MapControls;
