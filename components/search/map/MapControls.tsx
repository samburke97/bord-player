// components/search/map/MapControls.tsx
import { memo } from "react";
import { motion } from "framer-motion";
import { Gps, Add, Minus } from "iconsax-react";
import styles from "../SearchMap.module.css";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onGeolocate: () => void;
}

const MapControls = memo(
  ({ onZoomIn, onZoomOut, onGeolocate }: MapControlsProps) => (
    <div className={styles.customControls}>
      <motion.button
        onClick={onGeolocate}
        className={styles.controlButton}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Go to my location"
        type="button"
      >
        <Gps size={24} variant="Bold" />
      </motion.button>

      <motion.button
        onClick={onZoomIn}
        className={styles.controlButton}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Zoom in"
        type="button"
      >
        <Add size={24} />
      </motion.button>

      <motion.button
        onClick={onZoomOut}
        className={styles.controlButton}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Zoom out"
        type="button"
      >
        <Minus size={24} />
      </motion.button>
    </div>
  )
);

MapControls.displayName = "MapControls";

export default MapControls;
