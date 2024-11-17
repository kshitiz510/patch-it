import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LiveObjectLocation = () => {
  const [latitude, setLatitude] = useState(20.5937); // Default latitude (e.g., India)
  const [longitude, setLongitude] = useState(78.9629); // Default longitude (e.g., India)
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  // Function to simulate fetching updated position from an API or backend
  const fetchUpdatedLocation = async () => {
    // Simulating an API call
    const updatedData = await new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            latitude: latitude + Math.random() * 0.01, // Simulate small movement
            longitude: longitude + Math.random() * 0.01,
          }),
        2000 // Simulate network delay
      )
    );

    setLatitude(updatedData.latitude);
    setLongitude(updatedData.longitude);
  };

  useEffect(() => {
    if (!map) {
      // Initialize the map on the first render
      const initialMap = L.map('map').setView([latitude, longitude], 13);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(initialMap);

      // Create the initial marker
      const initialMarker = L.marker([latitude, longitude]).addTo(initialMap)
        .bindPopup('Object Position')
        .openPopup();

      setMap(initialMap);
      setMarker(initialMarker);
    } else {
      // Update the marker position on the map
      marker.setLatLng([latitude, longitude]);
      map.setView([latitude, longitude]);
    }
  }, [latitude, longitude, map, marker]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchUpdatedLocation(); // Periodically fetch updated location
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const handleLogout = () => {
    window.location.href = '/'; // Redirect to the home page
  };

  return (
    <div className="container">
      <main className="main-content">
        <h1>Live Object Location</h1>
        <div id="map" style={{ height: '600px', width: '800px' }}></div>
      </main>
    </div>
  );
};

export default LiveObjectLocation;
