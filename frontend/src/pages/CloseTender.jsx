import React, { useState, useEffect } from "react";
import { listOpenTenders, closeTender } from "../contract"; // Ensure this path is correct

const CloseTender = () => {
  const [tenderKey, setTenderKey] = useState(""); // Tender key input
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

  const handleCloseTender = async () => {
    try {
      await closeTender(tenderKey);
      alert("Tender closed successfully!");
    } catch (error) {
      console.error("Error closing tender:", error);
      alert("Error closing tender. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#eee6db]">
      <div className="bg-white text-center pt-10 pb-10 px-5 rounded-lg shadow-lg w-full max-w-md">
        <h2
          className="text-3xl font-bold mb-6"
          style={{ fontFamily: "Righteous, sans-serif" }}
        >
          Close Tender
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCloseTender();
          }}
          className="space-y-4"
        >
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
          <button
            type="submit"
            className="mt-6 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white"
            style={{
              backgroundColor: "#1E90FF",
              hover: { backgroundColor: "#1C86EE" },
            }} // Changed to DodgerBlue
          >
            Close Tender
          </button>
        </form>
      </div>
    </div>
  );
};

export default CloseTender;