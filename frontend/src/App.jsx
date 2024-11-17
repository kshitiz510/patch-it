import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import { Web3Context } from "./context/Web3Context";
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
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  const { role } = useContext(Web3Context);

  console.log("Current Role:", role); // Debugging statement

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/community" element={<Community />} />
        <Route path="/map" element={<Map />} />
        <Route
          path="/create-tender"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CreateTender />
            </ProtectedRoute>
          }
        />
        <Route
          path="/close-tender"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CloseTender />
            </ProtectedRoute>
          }
        />
        <Route
          path="/list-bidders"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ListBidders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bidder-registration"
          element={
            <ProtectedRoute allowedRoles={["bidder", "admin"]}>
              <BidderRegistration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/place-bid"
          element={
            <ProtectedRoute allowedRoles={["bidder", "admin"]}>
              <PlaceBid />
            </ProtectedRoute>
          }
        />
        <Route
          path="/list-open-tenders"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <ListOpenTenders />
            </ProtectedRoute>
          }
        />
        <Route path="/admin-registration" element={<AdminRegistration />} />
      </Routes>
    </>
  );
};

export default App;
