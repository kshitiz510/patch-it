import React, { useState, useEffect } from "react";
import { setContractAddress, contract } from "../contract";
import deployContract from "../deployContract";

const AdminRegistration = () => {
  const [adminName, setAdminName] = useState("");
  const [contractAddress, setContractAddressState] = useState("");
  const [isAdminRegistered, setIsAdminRegistered] = useState(false);

  useEffect(() => {
    const checkMetaMaskConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          console.log("Connected to MetaMask:", accounts[0]);
        } catch (error) {
          console.error("Error connecting to MetaMask:", error);
        }
      } else {
        console.error("MetaMask is not installed");
      }
    };

    checkMetaMaskConnection();
  }, []);

  const handleRegisterAdmin = async () => {
    try {
      const deployedAddress = await deployContract(adminName);
      setContractAddress(deployedAddress);
      setContractAddressState(deployedAddress);
      setIsAdminRegistered(true);
    } catch (error) {
      console.error("Error registering admin:", error);
    }
  };

  return (
    <div className="mt-40 p-4">
      <h2 className="text-2xl mb-4">Admin Registration</h2>
      <input
        type="text"
        value={adminName}
        onChange={(e) => setAdminName(e.target.value)}
        placeholder="Admin Name"
        className="border p-2 mb-4 w-full"
      />
      <button
        onClick={handleRegisterAdmin}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Register as Admin
      </button>

      {isAdminRegistered && (
        <p className="mt-4 text-green-500">
          Admin registered successfully! Contract Address: {contractAddress}
        </p>
      )}
    </div>
  );
};

export default AdminRegistration;
