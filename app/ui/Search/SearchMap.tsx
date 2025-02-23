// src/app/components/SearchMap.tsx
import { useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import type { RootState } from "@/store/store";
import type { Center } from "@/app/types/entities";
import { useMap } from "@/app/hooks/useMap";
import { MapMarkers } from "./map/MapMarkers";
import MapControls from "./map/MapControls";
import MapCard from "./MapCard";
import LoadingIndicator from "./LoadingIndicator";
import type { SearchMapProps } from "@/app/types/map";
import styles from "./SearchMap.module.css";

const CARD_HEIGHT = 370;
const SPACING = 15;

export const SearchMap: React.FC<SearchMapProps> = ({
  centers,
  userLocation,
  onBoundsChange,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [cardPosition, setCardPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [cardContent, setCardContent] = useState<Center | null>(null);
  const isLoading = useSelector((state: RootState) => state.search.isLoading);

  const handleMapChange = useCallback(() => {
    setCardPosition(null);
    setCardContent(null);
  }, []);

  const mapRef = useMap({
    container: mapContainer.current,
    userLocation,
    onBoundsChange,
    onMapChange: handleMapChange,
  });

  const handleMarkerClick = (
    center: Center,
    position: { x: number; y: number }
  ) => {
    const isTopHalf = position.y < mapContainer.current!.clientHeight / 2;
    const cardOffsetY = isTopHalf ? SPACING : -(CARD_HEIGHT + SPACING);

    setCardPosition({
      top: position.y + cardOffsetY,
      left: position.x - 175,
    });
    setCardContent(center);
  };

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleGeolocate = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 12,
        speed: 0.5,
        curve: 1,
      });
    }
  };

  return (
    <div className={styles.map}>
      <div ref={mapContainer} className={styles.mapContainer} />

      <MapMarkers
        centers={centers}
        mapRef={mapRef}
        mapContainer={mapContainer}
        onMarkerClick={handleMarkerClick}
      />

      {cardPosition && cardContent && (
        <div
          className={styles.cardWrapper}
          style={{
            position: "absolute",
            top: `${cardPosition.top}px`,
            left: `${cardPosition.left}px`,
            zIndex: 10,
          }}
        >
          <MapCard
            centerName={cardContent.name}
            centerAddress={cardContent.address ?? null}
            centerSports={cardContent.sports?.map((sport) => sport.name) || []}
            centerImage={cardContent.images}
            centerId={cardContent.id}
          />
        </div>
      )}

      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onGeolocate={handleGeolocate}
      />

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.loadingWrapper}
        >
          <LoadingIndicator />
        </motion.div>
      )}
    </div>
  );
};
