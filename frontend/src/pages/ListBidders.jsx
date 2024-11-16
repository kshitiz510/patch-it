import React, { useState, useEffect } from "react";
import { listBidders } from "../contract"; // Ensure this path is correct

const ListBidders = () => {
  const [bidders, setBidders] = useState([]);

  useEffect(() => {
    const fetchBidders = async () => {
      try {
        const result = await listBidders();
        console.log("Fetched bidders:", result); // Log the result to see the structure
        const addresses = result[0];
        const names = result[1];
        console.log("Addresses:", addresses); // Log addresses
        console.log("Names:", names); // Log names
        const bidderList = addresses.map((address, index) => ({
          address,
          name: names[index],
        }));
        setBidders(bidderList);
      } catch (error) {
        console.error("Error fetching bidders:", error);
      }
    };

    fetchBidders();
  }, []);

  return (
    <div className="mt-40 p-4">
      <h2 className="text-2xl mb-4">Registered Bidders</h2>
      <ul>
        {bidders.map((bidder) => (
          <li key={bidder.address}>
            {bidder.name} ({bidder.address})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListBidders;
