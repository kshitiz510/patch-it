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
      alert("Error creating tender. Please try again.");
    }
  };

  return (
    <div>
      <h2>Create Tender</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateTender();
        }}
      >
        <div>
          <label htmlFor="latitude">Latitude:</label>
          <input
            type="text"
            id="latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="Enter latitude"
            required
          />
        </div>
        <div>
          <label htmlFor="longitude">Longitude:</label>
          <input
            type="text"
            id="longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="Enter longitude"
            required
          />
        </div>
        <div>
          <label htmlFor="baseAmount">Base Amount:</label>
          <input
            type="number"
            id="baseAmount"
            value={baseAmount}
            onChange={(e) => setBaseAmount(e.target.value)}
            placeholder="Enter base amount"
            required
          />
        </div>
        <button type="submit">Create Tender</button>
      </form>
    </div>
  );
};

export default CreateTender;
