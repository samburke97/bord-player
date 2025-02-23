import { motion } from "framer-motion";
import { Gps, Add, Minus } from "iconsax-react";
import styles from "../SearchMap.module.css";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onGeolocate: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onGeolocate,
}) => (
  <div className={styles.customControls}>
    <motion.button
      onClick={onGeolocate}
      className={styles.controlButton}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Gps size={24} variant="Bold" />
    </motion.button>

    <motion.button
      onClick={onZoomIn}
      className={styles.controlButton}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Add size={24} />
    </motion.button>

    <motion.button
      onClick={onZoomOut}
      className={styles.controlButton}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Minus size={24} />
    </motion.button>
  </div>
);

export default MapControls;
