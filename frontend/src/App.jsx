import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Community from "./pages/Community";
import Map from "./pages/Map";
import PlaceBid from "./pages/PlaceBid";
import AdminRegistration from "./pages/AdminRegistration";
import BidderRegistration from "./pages/BidderRegistration";
import CreateTender from "./pages/CreateTender";
import ListOpenTenders from "./pages/ListOpenTenders";
import CloseTender from "./pages/CloseTender";
import ListBidders from "./pages/ListBidders";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/community" element={<Community />} />
        <Route path="/map" element={<Map />} />
        <Route path="/bid" element={<PlaceBid />} />
        <Route path="/admin-registration" element={<AdminRegistration />} />
        <Route path="/bidder-registration" element={<BidderRegistration />} />
        <Route path="/create-tender" element={<CreateTender />} />
        <Route path="/place-bid" element={<PlaceBid />} />
        <Route path="/list-open-tenders" element={<ListOpenTenders />} />
        <Route path="/close-tender" element={<CloseTender />} />
        <Route path="/list-bidders" element={<ListBidders />} />
      </Routes>
    </>
  );
}
