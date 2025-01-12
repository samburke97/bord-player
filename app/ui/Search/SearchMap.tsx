"use client";

import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import styles from "./SearchMap.module.css";
import MapCard from "./MapCard";
import { Center } from "@/app/lib/definitions";
import { Gps, Add, Minus } from "iconsax-react";
import { calculateDistance } from "@/app/lib/utils/calculateDistance";
mapboxgl.accessToken =
  "pk.eyJ1Ijoic2FtaXNib3JkIiwiYSI6ImNtM211eDF1djA0aTAyaW9paTlzdjZxOGYifQ.JpqQGl5Lmyq-eH0HMDORXQ";

interface SearchMapProps {
  centers: Center[];
  setActivePin: (id: string | null) => void;
  userLocation: { latitude: number; longitude: number };
}

const SearchMap: React.FC<SearchMapProps> = ({
  centers,
  setActivePin,
  userLocation,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [activePin, setActivePinState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filteredCenters, setFilteredCenters] = useState<Center[]>([]);
  const [cardPosition, setCardPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [cardContent, setCardContent] = useState<Center | null>(null);
  const markersRef = useRef<Map<string, HTMLElement>>(new Map());
  const [noMatchesFound, setNoMatchesFound] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current || !userLocation) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/samisbord/cm3h9lzqc002h01sq4zx18vbq",
      attributionControl: false,
      zoom: 13,
    });

    mapRef.current = map;

    map.on("load", () => {
      map.setCenter([userLocation.longitude, userLocation.latitude]);

      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserLocation: true,
      });
      map.addControl(geolocateControl);

      const centersWithinRadius = centers.filter((center) => {
        const distance = calculateDistance(
          userLocation.latitude, // now safe to use latitude and longitude
          userLocation.longitude,
          center.latitude || 0,
          center.longitude || 0
        );
        return distance <= 25;
      });

      setMapLoading(false);

      if (centersWithinRadius.length === 0) {
        setNoMatchesFound(true);
      } else {
        setNoMatchesFound(false);
        setFilteredCenters(centersWithinRadius);
      }

      centersWithinRadius.forEach((center) => {
        const markerElement = document.createElement("div");
        markerElement.style.backgroundImage = "url('/images/map/base-pin.svg')";
        markerElement.style.width = "42px";
        markerElement.style.height = "55px";
        markerElement.style.backgroundSize = "cover";

        const marker = new mapboxgl.Marker({ element: markerElement })
          .setLngLat([center.longitude ?? 0, center.latitude ?? 0])
          .addTo(map);

        markersRef.current.set(center.id, markerElement);

        markerElement.addEventListener("click", (e) => {
          e.stopPropagation();
          setActivePinState(center.id);
          setActivePin(center.id);

          const pinPosition = marker.getLngLat();
          const pixelPosition = map.project(pinPosition);

          const isTopHalf =
            pixelPosition.y < mapContainer.current!.clientHeight / 2;
          if (isTopHalf) {
            setCardPosition({
              top: pixelPosition.y + 60,
              left: pixelPosition.x - 175,
            });
          } else {
            setCardPosition({
              top: pixelPosition.y - 380,
              left: pixelPosition.x - 175,
            });
          }

          setCardContent(center);
        });
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [centers, userLocation]);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleGeolocate = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 12,
        speed: 0.5,
        curve: 1,
      });
    }
  };

  const handleSearchNearestCenter = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Nearest Center Logic Here");
    }, 2000);
  };

  return (
    <div className={styles.map}>
      <div ref={mapContainer} className={styles.mapContainer}></div>

      {activePin && cardPosition && cardContent && (
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
          />
        </div>
      )}

      <div className={styles.customControls}>
        <button onClick={handleGeolocate} className={styles.controlButton}>
          <Gps size={24} variant="Bold" />
        </button>
        <button onClick={handleZoomIn} className={styles.controlButton}>
          <Add size={24} />
        </button>
        <button onClick={handleZoomOut} className={styles.controlButton}>
          <Minus size={24} />
        </button>
      </div>

      {!mapLoading && noMatchesFound && (
        <div className={styles.noMatchesMessage}>
          No matches found within 25km radius.
          <button
            className={styles.searchButton}
            onClick={handleSearchNearestCenter}
            disabled={loading}
          >
            {loading ? "..." : "Search Nearest Center"}
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchMap;
