import React from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import ReportPage from "./pages/ReportPage";
import BidPage from "./pages/BidPage";
import CommunityPage from "./pages/CommunityPage";
import AuthPage from "./pages/AuthPage";
import { getStoredAuth } from "./api";

const ProtectedRoute = ({ children }) => {
  if (!getStoredAuth().accessToken) return <Navigate to="/auth" replace />;
  return children;
};

export default function App() {
  return (
    <div className="min-h-screen bg-asphalt-950">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
          <Route path="/bid" element={<ProtectedRoute><BidPage /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
              <h1 className="text-6xl font-display text-warn">404</h1>
              <p className="text-road-light text-lg">Page not found</p>
              <a href="/" className="btn-primary mt-4">Back to Home</a>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}
