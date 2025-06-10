// components/search/map/MapControls.tsx
import { memo } from "react";
import { Gps, Add, Minus } from "iconsax-react";
import styles from "./MapControls.module.css";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onGeolocate?: () => void; // Made optional
}

const MapControls = memo(
  ({ onZoomIn, onZoomOut, onGeolocate }: MapControlsProps) => (
    <div className={styles.controlsContainer}>
      {/* Only show geolocate button if handler is provided (for precise location) */}
      {onGeolocate && (
        <button
          onClick={onGeolocate}
          className={styles.controlButton}
          aria-label="Go to my location"
          type="button"
        >
          <Gps size={20} />
        </button>
      )}

      <button
        onClick={onZoomIn}
        className={styles.controlButton}
        aria-label="Zoom in"
        type="button"
      >
        <Add size={20} />
      </button>

      <button
        onClick={onZoomOut}
        className={styles.controlButton}
        aria-label="Zoom out"
        type="button"
      >
        <Minus size={20} />
      </button>
    </div>
  )
);

MapControls.displayName = "MapControls";

export default MapControls;
