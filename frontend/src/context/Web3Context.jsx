import React, { createContext, useState, useEffect } from "react";
import Web3 from "web3";

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState("");
  const [role, setRole] = useState("");

  const adminAddress = import.meta.env.VITE_ADMIN_ADDRESS;
  const bidderAddress = import.meta.env.VITE_BIDDER_ADDRESS;
  const userAddress = import.meta.env.VITE_USER_ADDRESS;

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
      });
    }
  }, []);

  useEffect(() => {
    if (account) {
      if (account.toLowerCase() === adminAddress.toLowerCase()) {
        setRole("admin");
        console.log("Admin Address:", adminAddress);
      } else if (account.toLowerCase() === bidderAddress.toLowerCase()) {
        setRole("bidder");
        console.log("Bidder Address:", bidderAddress);
      } else if (account.toLowerCase() === userAddress.toLowerCase()) {
        setRole("user");
        console.log("User Address:", userAddress);
      } else {
        setRole("guest");
      }
    }
  }, [account, adminAddress, bidderAddress, userAddress]);

  return (
    <Web3Context.Provider value={{ account, role, setAccount }}>
      {children}
    </Web3Context.Provider>
  );
};
