import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const HeatMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${API_URL}/locations`);
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || locations.length === 0) return;

    const heatData = locations.map((loc) => [loc.latitude, loc.longitude, loc.intensity || 0.5]);

    const bounds = L.latLngBounds(locations.map((loc) => [loc.latitude, loc.longitude]));
    map.fitBounds(bounds, { padding: [30, 30] });

    const heat = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [locations]);

  return (
    <div
      ref={mapRef}
      style={{ height: "500px", width: "100%" }}
      className="rounded-lg overflow-hidden"
    />
  );
};

export default HeatMap;
