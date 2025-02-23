import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Center } from "@/app/types/entities";
import type { RootState } from "@/store/store";
import { setActivePin, setHoveredCenter } from "@/store/features/searchSlice";
import styles from "@/app/ui/search/SearchMap.module.css";

interface MapMarkersProps {
  centers: Center[];
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  mapContainer: React.RefObject<HTMLDivElement>;
  onMarkerClick: (center: Center, position: { x: number; y: number }) => void;
}

export const MapMarkers: React.FC<MapMarkersProps> = ({
  centers,
  mapRef,
  mapContainer,
  onMarkerClick,
}) => {
  const dispatch = useDispatch();
  const activePin = useSelector((state: RootState) => state.search.activePin);
  const hoveredItem = useSelector(
    (state: RootState) => state.search.hoveredItem
  );

  const updateMarkers = useCallback(
    (centers: Center[]) => {
      const existingMarkers = document.querySelectorAll(`.${styles.marker}`);
      existingMarkers.forEach((marker) => marker.remove());

      centers.forEach((center) => {
        if (!center.latitude || !center.longitude) return;

        const markerElement = document.createElement("div");
        markerElement.className = `${styles.marker}`;
        markerElement.setAttribute("data-center-id", center.id);

        const markerImage = document.createElement("img");
        markerImage.src =
          activePin === center.id
            ? "/images/map/active-pin.svg"
            : "/images/map/base-pin.svg";
        markerImage.alt = "Location Marker";
        markerImage.className = styles.image;

        markerElement.appendChild(markerImage);

        const position = mapRef.current!.project([
          Number(center.longitude),
          Number(center.latitude),
        ]);

        markerElement.style.left = `${position.x}px`;
        markerElement.style.top = `${position.y}px`;

        if (hoveredItem === center.id && activePin !== center.id) {
          markerElement.classList.add(styles.hoveredMarker);
        }

        markerElement.addEventListener("mouseenter", () => {
          if (activePin !== center.id) {
            markerElement.classList.add(styles.hoveredMarker);
            dispatch(setHoveredCenter(center.id));
          }
        });

        markerElement.addEventListener("mouseleave", () => {
          if (activePin !== center.id) {
            markerElement.classList.remove(styles.hoveredMarker);
            dispatch(setHoveredCenter(null));
          }
        });

        markerElement.addEventListener("click", (e) => {
          e.stopPropagation();
          dispatch(setActivePin(center.id));

          const positionAfterMove = mapRef.current!.project([
            Number(center.longitude),
            Number(center.latitude),
          ]);

          onMarkerClick(center, positionAfterMove);
        });

        mapContainer.current?.appendChild(markerElement);

        mapRef.current?.on("move", () => {
          const newPosition = mapRef.current!.project([
            Number(center.longitude),
            Number(center.latitude),
          ]);
          markerElement.style.left = `${newPosition.x}px`;
          markerElement.style.top = `${newPosition.y}px`;

          if (hoveredItem === center.id && activePin !== center.id) {
            markerElement.classList.add(styles.hoveredMarker);
          } else {
            markerElement.classList.remove(styles.hoveredMarker);
          }
        });
      });
    },
    [dispatch, activePin, hoveredItem, mapRef, mapContainer, onMarkerClick]
  );

  useEffect(() => {
    if (mapRef.current) {
      updateMarkers(centers);
    }
  }, [centers, updateMarkers]);

  return null;
};
