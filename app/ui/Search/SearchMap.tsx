import "mapbox-gl/dist/mapbox-gl.css";
import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import styles from "./SearchMap.module.css";
import MapCard from "./MapCard";
import { Center } from "@/app/lib/definitions";

mapboxgl.accessToken =
  "pk.eyJ1Ijoic2FtaXNib3JkIiwiYSI6ImNtM211eDF1djA0aTAyaW9paTlzdjZxOGYifQ.JpqQGl5Lmyq-eH0HMDORXQ";

interface SearchMapProps {
  centers: Center[];
  setActivePin: (id: string | null) => void;
}

const SearchMap: React.FC<SearchMapProps> = ({ centers, setActivePin }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [activePin, setActivePinState] = useState<string | null>(null);
  const [cardPosition, setCardPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [cardContent, setCardContent] = useState<Center | null>(null);
  const markersRef = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/samisbord/cm3h9lzqc002h01sq4zx18vbq",
      attributionControl: false,
      zoom: 10,
    });

    mapRef.current = map;

    map.on("load", () => {
      if (centers.length > 0 && centers[0].latitude && centers[0].longitude) {
        map.setCenter([centers[0].longitude, centers[0].latitude]);
        map.setZoom(12);
      }

      const bounds = new mapboxgl.LngLatBounds();

      centers.forEach((center) => {
        if (center.latitude && center.longitude) {
          const markerElement = document.createElement("div");
          markerElement.style.backgroundImage =
            "url('/images/map/base-pin.svg')";
          markerElement.style.width = "42px";
          markerElement.style.height = "55px";
          markerElement.style.backgroundSize = "cover";

          const marker = new mapboxgl.Marker({ element: markerElement })
            .setLngLat([center.longitude, center.latitude])
            .addTo(map);

          markersRef.current.set(center.id, markerElement);

          markerElement.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent map click from triggering
            setActivePinState(center.id);
            setActivePin(center.id);

            const pinPosition = marker.getLngLat();
            const pixelPosition = map.project(pinPosition);

            // Check if the pin is in the top half or bottom half
            const isTopHalf =
              pixelPosition.y < mapContainer.current!.clientHeight / 2;

            // Adjust the position of the card
            if (isTopHalf) {
              setCardPosition({
                top: pixelPosition.y + 60, // Position below the pin
                left: pixelPosition.x - 175,
              });
            } else {
              setCardPosition({
                top: pixelPosition.y - 380, // Position above the pin
                left: pixelPosition.x - 175,
              });
            }

            setCardContent(center);
          });

          bounds.extend([center.longitude, center.latitude]);
        }
      });

      if (centers.length > 1) {
        map.fitBounds(bounds, { padding: 50 });
      } else if (centers.length === 1) {
        map.setZoom(14);
      }

      const navControl = new mapboxgl.NavigationControl({
        showCompass: false,
      });
      map.addControl(navControl, "bottom-right");

      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: false,
      });
      map.addControl(geolocateControl, "bottom-right");

      // Add click listener to the map to reset state
      map.on("click", () => {
        setActivePinState(null);
        setActivePin(null);
        setCardPosition(null);
        setCardContent(null);
      });

      // Add dragstart listener to reset state
      map.on("dragstart", () => {
        setActivePinState(null);
        setActivePin(null);
        setCardPosition(null);
        setCardContent(null);
      });

      // Add zoomstart listener to reset state
      map.on("zoomstart", () => {
        setActivePinState(null);
        setActivePin(null);
        setCardPosition(null);
        setCardContent(null);
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [centers]);

  useEffect(() => {
    markersRef.current.forEach((markerElement, markerId) => {
      markerElement.style.backgroundImage =
        markerId === activePin
          ? "url('/images/map/active-pin.svg')"
          : "url('/images/map/base-pin.svg')";
    });
  }, [activePin]);

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
            centerAddress={cardContent.address}
            centerSports={cardContent.sports || []}
            centerImage={cardContent.images}
          />
        </div>
      )}
    </div>
  );
};

export default SearchMap;
