import React, { useState, useEffect } from "react";
import { setContractAddress } from "../contract";
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
      localStorage.setItem("contractAddress", deployedAddress);
      setIsAdminRegistered(true);
    } catch (error) {
      console.error("Error registering admin:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#eee6db]">
      <div className="bg-white text-center pt-10 pb-10 px-5 rounded-lg shadow-lg w-full max-w-md">
        <h2
          className="text-3xl font-bold mb-6"
          style={{ fontFamily: "Righteous, sans-serif" }}
        >
          Admin Registration
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegisterAdmin();
          }}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="adminName"
              className="block text-lg font-medium text-gray-700 text-left"
            >
              Admin Name:
            </label>
            <input
              type="text"
              id="adminName"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Enter admin name"
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
            Register as Admin
          </button>
        </form>
        {isAdminRegistered && (
          <p className="mt-4 text-green-500">
            Admin registered successfully! Contract Address: {contractAddress}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminRegistration;
