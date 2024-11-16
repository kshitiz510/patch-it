import React, { useState } from "react";
import { registerBidder } from "../contract"; // Ensure this path is correct

const BidderRegistration = () => {
  const [bidderName, setBidderName] = useState("");
  const [isBidderRegistered, setIsBidderRegistered] = useState(false);

  const handleRegister = async () => {
    try {
      await registerBidder(bidderName);
      setIsBidderRegistered(true);
    } catch (error) {
      console.error("Error registering bidder:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Bidder Registration</h2>
      <input
        type="text"
        value={bidderName}
        onChange={(e) => setBidderName(e.target.value)}
        placeholder="Bidder Name"
        className="border p-2 mb-4 w-full"
      />
      <button
        onClick={handleRegister}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Register as Bidder
      </button>

      {isBidderRegistered && (
        <p className="mt-4 text-green-500">Bidder registered successfully!</p>
      )}
    </div>
  );
};

export default BidderRegistration;
