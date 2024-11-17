import React, { useState, useEffect } from "react";
import { listOpenTenders } from "../contract"; // Ensure this path is correct

const ListOpenTenders = () => {
  const [tenders, setTenders] = useState([]);

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const result = await listOpenTenders();
        const keys = result[0];
        const baseAmounts = result[1];
        const tenderList = keys.map((key, index) => ({
          key,
          baseAmount: baseAmounts[index].toString(),
        }));
        setTenders(tenderList);
      } catch (error) {
        console.error("Error fetching open tenders:", error);
      }
    };

    fetchTenders();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#eee6db]">
      <div className="bg-white text-center pt-10 pb-10 px-5 rounded-lg shadow-lg w-full max-w-2xl">
        <h2
          className="text-3xl font-bold mb-6"
          style={{ fontFamily: "Righteous, sans-serif" }}
        >
          Open Tenders
        </h2>
        <ul className="space-y-4">
          {tenders.map((tender) => (
            <li
              key={tender.key}
              className="bg-gray-100 p-4 border border-gray-300 rounded-lg shadow-sm"
            >
              <p className="font-bold text-lg">Tender Key: {tender.key}</p>
              <p className="text-sm text-gray-600">
                Base Amount: {tender.baseAmount}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ListOpenTenders;
