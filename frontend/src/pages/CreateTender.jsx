import React, { useState } from "react";
import { createTender } from "../contract"; // Ensure this path is correct

const CreateTender = () => {
  const [latitude, setLatitude] = useState("40.7128");
  const [longitude, setLongitude] = useState("-74.0060");
  const [baseAmount, setBaseAmount] = useState("1000");

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
    <div className="flex justify-center items-center min-h-screen bg-[#eee6db]">
      <div className="bg-white text-center pt-10 pb-10 px-5 rounded-lg shadow-lg w-full max-w-md">
        <h2
          className="text-3xl font-bold mb-6"
          style={{ fontFamily: "Righteous, sans-serif" }}
        >
          Create Tender
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateTender();
          }}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="latitude"
              className="block text-lg font-medium text-gray-700 text-left"
            >
              Latitude:
            </label>
            <input
              type="text"
              id="latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Enter latitude"
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="longitude"
              className="block text-lg font-medium text-gray-700 text-left"
            >
              Longitude:
            </label>
            <input
              type="text"
              id="longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Enter longitude"
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="baseAmount"
              className="block text-lg font-medium text-gray-700 text-left"
            >
              Base Amount:
            </label>
            <input
              type="number"
              id="baseAmount"
              value={baseAmount}
              onChange={(e) => setBaseAmount(e.target.value)}
              placeholder="Enter base amount"
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="mt-6 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#1E90FF] hover:bg-[#21262b]"
            style={{
              backgroundColor: "#1E90FF",
              hover: { backgroundColor: "#1C86EE" },
            }} // Changed to DodgerBlue
          >
            Create Tender
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTender;
