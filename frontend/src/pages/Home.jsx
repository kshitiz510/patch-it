import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";
import "./Home.module.css";
import deployContract from "../deployContract";
import { contract, setContractAddress } from "../contract";

const Home = () => {
  const [adminName, setAdminName] = useState("");
  const [contractAddress, setContractAddressState] = useState("");
  const [bidderName, setBidderName] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [account, setAccount] = useState("");

  useEffect(() => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.log(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }, []);

  const handleDeploy = async () => {
    try {
      const address = await deployContract(adminName, { gas: 3000000 });
      setContractAddress(address);
      setContractAddressState(address);
    } catch (error) {
      console.error("Error deploying contract:", error);
    }
  };

  const registerBidder = async () => {
    try {
      if (!contract) {
        console.error("Contract is not initialized.");
        return;
      }
      const accounts = await window.web3.eth.getAccounts();
      if (accounts.length === 0) {
        console.error("No accounts found. Please connect to MetaMask.");
        return;
      }
      setAccount(accounts[0]);
      await contract.methods
        .registerBidder(bidderName)
        .send({ from: accounts[0], gasPrice: "20000000000" }); // Specify gas price
      setIsRegistered(true);
    } catch (error) {
      console.error("Error registering bidder:", error);
    }
  };

  return (
    <div className="text-center pt-28">
      <h1 className={`text-9xl font-bold ${styles.heading}`}>patch.it</h1>
      <div className="mt-8">
        <p
          className="bg-[#ace5d7] text-black py-3 px-7 mt-8 font-bold inline-block transform transition-transform duration-200 hover:translate-y-1"
          style={{
            fontFamily: "revert",
            boxShadow: "0 8px #1c3d5a",
            maxWidth: "750px",
            borderRadius: "25px",
          }}
        >
          Patch-It leverages AI and crowd-sourcing to detect and report
          potholes, ensuring quicker repairs and safer commutes. Designed for
          municipalities and citizens.
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold">Deploy TenderBidding Contract</h2>
        <input
          type="text"
          placeholder="Enter admin name"
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          className="mt-4 p-2 border rounded"
        />
        <button
          onClick={handleDeploy}
          className="bg-[#ace5d7] text-black py-2 px-6 rounded-lg font-bold uppercase inline-block transform transition-transform duration-200 hover:translate-y-1 mt-4"
          style={{
            boxShadow: "0 4px #1c3d5a",
          }}
        >
          Deploy Contract
        </button>
        {contractAddress && (
          <p className="mt-4">
            Contract deployed at address: {contractAddress}
          </p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold">Register as Bidder</h2>
        <input
          type="text"
          placeholder="Enter your name"
          value={bidderName}
          onChange={(e) => setBidderName(e.target.value)}
          className="mt-4 p-2 border rounded"
        />
        <button
          onClick={registerBidder}
          className="bg-[#ace5d7] text-black py-2 px-6 rounded-lg font-bold uppercase inline-block transform transition-transform duration-200 hover:translate-y-1 mt-4"
          style={{
            boxShadow: "0 4px #1c3d5a",
          }}
        >
          Register as Bidder
        </button>
        {isRegistered && (
          <p className="mt-4">
            Welcome, {bidderName}! You are registered as a bidder.
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;
