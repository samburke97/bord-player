import styles from "./MapCard.module.css";
import { MapPinIcon } from "@heroicons/react/24/outline";

interface MapCardProps {
  centerName: string;
  centerAddress: string | null;
  centerSports: string[];
  centerImage: string[];
}

const MapCard: React.FC<MapCardProps> = ({
  centerName,
  centerAddress,
  centerSports,
  centerImage,
}) => {
  return (
    <div className={styles.card}>
      <div>
        <img src={centerImage[0]} alt={centerName} />
      </div>
      <div className={styles.description}>
        <div className={styles.sportContainer}>
          {centerSports.map((sport, index) => (
            <div key={index} className={styles.sportPill}>
              <span className={styles.pill}>{sport}</span>
            </div>
          ))}
        </div>

        <h2>{centerName}</h2>
        {centerAddress && (
          <div className={styles.carousel__location}>
            <MapPinIcon className={styles.carousel__icon} />
            <span className={styles.carousel__address}>{centerAddress}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapCard;
