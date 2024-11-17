import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import UploadLocation from '../src/components/UploadLoaction';
import LocationList from '../src/components/LocationList';
import HeatMap from './components/HeatMap';
export default function App() {
  const uniqueIdData = {
    latitude: 37.7749,  // Example latitude
    longitude: -122.4194  // Example longitude
  };    
  return (
    <>
      <Navbar />
      <Home />
      <div>
      <UploadLocation />
      <LocationList />
    </div>
    <div>
      <h1>Location Heatmap</h1>
      <HeatMap />
    </div>
    <div>
      <LiveLocation uniqueIdData={uniqueIdData} />
    </div>





    </>
  );
}