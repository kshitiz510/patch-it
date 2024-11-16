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
    <div className="mt-40 p-4">
      <h2 className="text-2xl mb-4">Open Tenders</h2>
      <ul>
        {tenders.map((tender) => (
          <li key={tender.key}>
            {tender.key} - Base Amount: {tender.baseAmount}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListOpenTenders;
