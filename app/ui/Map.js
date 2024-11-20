"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const Map = ({ address }) => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    const mapInstance = L.map("map").setView([51.505, -0.09], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(mapInstance);

    const markerInstance = L.marker([51.505, -0.09], {
      draggable: true,
      icon: L.icon({
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    }).addTo(mapInstance);

    setMap(mapInstance);
    setMarker(markerInstance);

    return () => {
      mapInstance.remove();
    };
  }, []);

  useEffect(() => {
    if (address && map && marker) {
      console.log(`Fetching geocode for address: ${address}`);

      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          address
        )}&format=json`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lon);

            // Update the map view and move the marker
            map.setView([latitude, longitude], 13);
            marker
              .setLatLng([latitude, longitude])
              .bindPopup(`Address: ${address}`)
              .openPopup();
          } else {
            console.error("No results found for the address");
          }
        })
        .catch((err) => {
          console.error("Error fetching geocode data:", err);
        });
    }
  }, [address, map, marker]);

  return <div id="map" style={{ height: "400px", width: "100%" }} />;
};

export default Map;
