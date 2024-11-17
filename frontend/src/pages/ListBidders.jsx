import React, { useState, useEffect } from "react";
import { listBidders, listOpenTenders } from "../contract"; // Ensure this path is correct

const ListBidders = () => {
  const [tenderKey, setTenderKey] = useState(""); // Selected tender key
  const [bidders, setBidders] = useState([]);
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

  const fetchBidders = async () => {
    try {
      const result = await listBidders(tenderKey);
      console.log("Fetched bidders:", result); // Log the result to see the structure
      const addresses = result[0];
      const names = result[1];
      const bidAmounts = result[2]; // Assuming bid amounts are returned as the third element
      console.log("Addresses:", addresses); // Log addresses
      console.log("Names:", names); // Log names
      console.log("Bid Amounts:", bidAmounts); // Log bid amounts
      const bidderList = addresses.map((address, index) => ({
        address,
        name: names[index],
        bidAmount: bidAmounts[index].toString(),
      }));
      setBidders(bidderList);
    } catch (error) {
      console.error("Error fetching bidders:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#eee6db]">
      <div className="bg-white text-center pt-10 pb-10 px-5 rounded-lg shadow-lg w-full max-w-2xl">
        <h2
          className="text-3xl font-bold mb-6"
          style={{ fontFamily: "Righteous, sans-serif" }}
        >
          List Bidders
        </h2>
        <div className="mb-6">
          <label
            htmlFor="tenderKey"
            className="block text-lg font-medium text-gray-700 text-left"
          >
            Select Tender:
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
          <button
            onClick={fetchBidders}
            className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white"
            style={{
              backgroundColor: "#1E90FF",
              hover: { backgroundColor: "#1C86EE" },
            }} // Changed to DodgerBlue
          >
            Fetch Bidders
          </button>
        </div>
        <ul className="space-y-4">
          {bidders.map((bidder) => (
            <li
              key={bidder.address}
              className="bg-gray-100 p-4 border border-gray-300 rounded-lg shadow-sm"
            >
              <p className="font-bold text-lg">{bidder.name}</p>
              <p className="text-sm text-gray-600">Address: {bidder.address}</p>
              <p className="text-sm text-gray-600">
                Bid Amount: {bidder.bidAmount}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ListBidders;
