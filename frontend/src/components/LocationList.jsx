import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LocationList = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('http://localhost:4000/locations');
        setLocations(response.data);
      } catch (error) {
        console.error('Failed to fetch locations', error);
      }
    };

    fetchLocations();
  }, []);

  return (
    <div>
      <h2>Locations</h2>
      <ul>
        {locations.map((location) => (
          <li key={location._id}>
            <p>Latitude: {location.latitude}</p>
            <p>Longitude: {location.longitude}</p>
            <img
              src={`http://localhost:4000/${location.photoPath}`}
              alt="Uploaded"
              style={{ width: '200px', height: 'auto' }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LocationList;
