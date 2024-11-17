import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

const HeatMap = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    // Fetch location data from the backend
    const fetchLocations = async () => {
      try {
        const response = await fetch('http://localhost:4000/locations'); // Replace with your endpoint
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    if (locations.length > 0) {
      // Initialize the map
      const map = L.map('map', {
        center: [locations[0].latitude, locations[0].longitude],
        zoom: 10,
      });

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Prepare heatmap data
      const heatData = locations.map((loc) => [loc.latitude, loc.longitude, loc.intensity || 0.5]); // Intensity defaults to 0.5

      // Add heatmap layer
      L.heatLayer(heatData, { 
        radius: 25, // Adjust radius for visual appeal
        blur: 15,   // Smoothing for heat spots
        maxZoom: 17 // Max zoom level for clustering
      }).addTo(map);
    }
  }, [locations]);

  return <div id="map" style={{ height: '500px', width: '100%' }}></div>;
};

export default HeatMap;
