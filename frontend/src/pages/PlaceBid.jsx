import React, { useState, useEffect } from "react";
import { listOpenTenders, placeBid } from "../contract"; // Ensure this path is correct

const PlaceBid = () => {
  const [tenderKey, setTenderKey] = useState(""); // Selected tender key
  const [amount, setAmount] = useState(""); // Bid amount
  const [name, setName] = useState(""); // Bidder name
  const [openTenders, setOpenTenders] = useState([]); // List of open tenders

  useEffect(() => {
    const fetchOpenTenders = async () => {
      try {
        const result = await listOpenTenders();
        const keys = result[0];
        const baseAmounts = result[1];
        const tenderList = keys.map((key, index) => ({
          key,
          baseAmount: baseAmounts[index].toString(),
        }));
        setOpenTenders(tenderList);
      } catch (error) {
        console.error("Error fetching open tenders:", error);
      }
    };

    fetchOpenTenders();
  }, []);

  const handlePlaceBid = async () => {
    try {
      await placeBid(tenderKey, amount, name);
      alert("Bid placed successfully!");
    } catch (error) {
      console.error("Error placing bid:", error);
      alert("Error placing bid. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#eee6db]">
      <div className="bg-white text-center pt-10 pb-10 px-5 rounded-lg shadow-lg w-full max-w-md">
        <h2
          className="text-3xl font-bold mb-6"
          style={{ fontFamily: "Righteous, sans-serif" }}
        >
          Place Bid
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePlaceBid();
          }}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-lg font-medium text-gray-700 text-left"
            >
              Name:
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="tenderKey"
              className="block text-lg font-medium text-gray-700 text-left"
            >
              Tender Key:
            </label>
            <select
              id="tenderKey"
              value={tenderKey}
              onChange={(e) => setTenderKey(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="" disabled>
                Select a tender
              </option>
              {openTenders.map((tender) => (
                <option key={tender.key} value={tender.key}>
                  {tender.key}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="amount"
              className="block text-lg font-medium text-gray-700 text-left"
            >
              Bid Amount:
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter bid amount"
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="mt-6 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white"
            style={{
              backgroundColor: "#1E90FF",
              hover: { backgroundColor: "#1C86EE" },
            }} // Changed to DodgerBlue
          >
            Place Bid
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlaceBid;
