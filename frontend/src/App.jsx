import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import ReportPage from "./pages/ReportPage";
import BidPage from "./pages/BidPage";
import CommunityPage from "./pages/CommunityPage";

export default function App() {
  return (
    <div className="min-h-screen bg-asphalt-950">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/bid" element={<BidPage />} />
          <Route path="/community" element={<CommunityPage />} />
        </Routes>
      </main>
    </div>
  );
}
