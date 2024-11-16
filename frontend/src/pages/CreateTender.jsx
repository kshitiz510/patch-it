import React, { useState } from "react";
import { createTender } from "../contract"; // Ensure this path is correct

const CreateTender = () => {
  const [latitude, setLatitude] = useState("40.7128"); // Dummy data for latitude
  const [longitude, setLongitude] = useState("-74.0060"); // Dummy data for longitude
  const [baseAmount, setBaseAmount] = useState("10000000"); // Dummy data for base amount

  const handleCreateTender = async () => {
    try {
      await createTender(latitude, longitude, baseAmount);
      alert("Tender created successfully!");
    } catch (error) {
      console.error("Error creating tender:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Create Tender</h2>
      <input
        type="text"
        value={latitude}
        onChange={(e) => setLatitude(e.target.value)}
        placeholder="Latitude"
        className="border p-2 mb-4 w-full"
      />
      <input
        type="text"
        value={longitude}
        onChange={(e) => setLongitude(e.target.value)}
        placeholder="Longitude"
        className="border p-2 mb-4 w-full"
      />
      <input
        type="number"
        value={baseAmount}
        onChange={(e) => setBaseAmount(e.target.value)}
        placeholder="Base Amount"
        className="border p-2 mb-4 w-full"
      />
      <button
        onClick={handleCreateTender}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Create Tender
      </button>
    </div>
  );
};

export default CreateTender;
