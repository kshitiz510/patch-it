import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

const Map = () => {
  useEffect(() => {
    const map = L.map("map").setView([20.5937, 78.9629], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      map
    );

    fetch("/heatmap-data")
      .then((response) => response.json())
      .then((data) => {
        L.heatLayer(data, { radius: 25 }).addTo(map);
      });
  }, []);

  return <div id="map" style={{ height: "500px" }}></div>;
};

export default Map;
