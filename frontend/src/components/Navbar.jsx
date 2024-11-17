import React, { useState, useEffect, useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import Web3 from "web3";
import { Web3Context } from "../context/Web3Context";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [metaMaskId, setMetaMaskId] = useState("");
  const [isTenderHovered, setIsTenderHovered] = useState(false);
  const [isMetaMaskHovered, setIsMetaMaskHovered] = useState(false);
  const [isBidHovered, setIsBidHovered] = useState(false);
  const { role } = useContext(Web3Context);

  let tenderHoverTimeout;
  let metaMaskHoverTimeout;
  let bidHoverTimeout;

  useEffect(() => {
    const checkMetaMaskConnection = async (event) => {
      event?.preventDefault();
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            window.web3 = new Web3(window.ethereum);
            setMetaMaskId(accounts[0]);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error("Error checking MetaMask connection:", error);
        }
      }
    };

    checkMetaMaskConnection();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          setIsAuthenticated(false);
          setMetaMaskId("");
        } else {
          setMetaMaskId(accounts[0]);
          setIsAuthenticated(true);
        }
      });
    }
  }, []);

  const connectToMetaMask = async (event) => {
    event.preventDefault();
    if (window.ethereum) {
      setIsConnecting(true);
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setMetaMaskId(accounts[0]);
        setIsAuthenticated(true);
      } catch (error) {
        if (error.code === 4001) {
          console.error("User denied account access:", error);
        } else {
          console.error("Error connecting to MetaMask:", error);
        }
        setIsAuthenticated(false);
      } finally {
        setIsConnecting(false);
      }
    } else {
      console.log(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };

  const handleTenderMouseEnter = () => {
    clearTimeout(tenderHoverTimeout);
    setIsTenderHovered(true);
  };

  const handleTenderMouseLeave = () => {
    tenderHoverTimeout = setTimeout(() => {
      setIsTenderHovered(false);
    }, 150);
  };

  const handleMetaMaskMouseEnter = () => {
    clearTimeout(metaMaskHoverTimeout);
    setIsMetaMaskHovered(true);
  };

  const handleMetaMaskMouseLeave = () => {
    metaMaskHoverTimeout = setTimeout(() => {
      setIsMetaMaskHovered(false);
    }, 150);
  };

  const handleBidMouseEnter = () => {
    clearTimeout(bidHoverTimeout);
    setIsBidHovered(true);
  };

  const handleBidMouseLeave = () => {
    bidHoverTimeout = setTimeout(() => {
      setIsBidHovered(false);
    }, 150);
  };

  return (
    <header className="fixed top-0 left-0 w-full flex items-center justify-between whitespace-nowrap bg-[#67978b] px-10 py-3 shadow-lg z-50">
      <div className="flex items-center gap-4 text-[#1C160C]">
        <NavLink to="/" className="flex items-center gap-4">
          <div className="size-6 transform transition-transform duration-300 hover:scale-105">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7"
            >
              <path
                d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
          <span
            className="text-[#1C160C] text-lg font-bold leading-tight tracking-[-0.015em]"
            style={{
              fontFamily: '"Righteous", sans-serif',
              fontSize: "1.5rem",
            }}
          >
            patch.it
          </span>
        </NavLink>
      </div>

      {/* Navigation Links */}
      <nav
        className="flex flex-1 justify-end gap-8"
        style={{
          fontFamily: "Righteous, sans-serif",
          fontSize: "1rem",
        }}
      >
        <div className="flex items-center gap-4 text-[#1C160C]">
          {/* <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-2 text-base font-bold transition-colors duration-200 ${
                isActive
                  ? "text-[#52504d]"
                  : "text-[#1C160C] hover:text-[#52504d]"
              }`
            }
          >
            Home
          </NavLink> */}
          <NavLink
            to="/map"
            className={({ isActive }) =>
              `px-4 py-2 text-base font-bold transition-colors duration-200 ${
                isActive
                  ? "text-[#52504d]"
                  : "text-[#1C160C] hover:text-[#52504d]"
              }`
            }
          >
            Map
          </NavLink>
          <NavLink
            to="/community"
            className={({ isActive }) =>
              `px-4 py-2 text-base font-bold transition-colors duration-200 ${
                isActive
                  ? "text-[#52504d]"
                  : "text-[#1C160C] hover:text-[#52504d]"
              }`
            }
          >
            Community
          </NavLink>
          {(role === "admin" || role === "bidder") && (
            <div
              className="relative group"
              onMouseEnter={handleTenderMouseEnter}
              onMouseLeave={handleTenderMouseLeave}
            >
              <div className="px-4 py-2 text-base font-bold transition-colors duration-200 text-[#1C160C] hover:text-[#52504d] cursor-pointer">
                Tender
              </div>
              {isTenderHovered && (
                <div className="absolute left-0 mt-8 w-48 p-2 bg-white border border-gray-300 rounded-xl shadow-lg">
                  {role === "admin" && (
                    <>
                      <NavLink
                        to="/create-tender"
                        className="block px-4 py-2 hover:bg-gray-200 rounded-lg"
                      >
                        Create Tender
                      </NavLink>
                      <NavLink
                        to="/close-tender"
                        className="block px-4 py-2 hover:bg-gray-200 rounded-lg"
                      >
                        Close Tender
                      </NavLink>
                    </>
                  )}
                  <NavLink
                    to="/list-open-tenders"
                    className="block px-4 py-2 hover:bg-gray-200 rounded-lg"
                  >
                    List Open Tenders
                  </NavLink>
                </div>
              )}
            </div>
          )}
          {(role === "admin" || role === "bidder") && (
            <div
              className="relative group"
              onMouseEnter={handleBidMouseEnter}
              onMouseLeave={handleBidMouseLeave}
            >
              <div className="px-4 py-2 text-base font-bold transition-colors duration-200 text-[#1C160C] hover:text-[#52504d] cursor-pointer">
                Bid
              </div>
              {isBidHovered && (
                <div className="absolute left-0 mt-6 w-48 p-2 bg-white border border-gray-300 rounded-xl shadow-lg">
                  <NavLink
                    to="/list-bidders"
                    className="block px-4 py-2 hover:bg-gray-200 rounded-lg"
                  >
                    List Bidders
                  </NavLink>
                  <NavLink
                    to="/place-bid"
                    className="block px-4 py-2 hover:bg-gray-200 rounded-lg"
                  >
                    Place Bid
                  </NavLink>
                </div>
              )}
            </div>
          )}
          {role === "admin" && (
            <NavLink
              to="/deploy-contract"
              className="px-4 py-2 text-base font-bold transition-colors duration-200 text-[#1C160C] hover:text-[#52504d]"
            >
              Deploy Contract
            </NavLink>
          )}
          {/* <NavLink
            to="/bid"
            className={({ isActive }) =>
              `px-4 py-2 text-base font-bold transition-colors duration-200 ${
                isActive
                  ? "text-[#52504d]"
                  : "text-[#1C160C] hover:text-[#52504d]"
              }`
            }
          >
            Bid
          </NavLink> */}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={(event) => connectToMetaMask(event)}
            onMouseEnter={handleMetaMaskMouseEnter}
            onMouseLeave={handleMetaMaskMouseLeave}
            className={`relative ${
              isAuthenticated ? "bg-[#e3c182]" : "bg-[#f1e8d8] px-5"
            } text-black gap-1 text-base font-bold leading-normal tracking-[0.015em] min-w-0 px-3 hover:bg-[#e3c182] transform transition-transform duration-200 hover:translate-y-0.5 group`}
            disabled={isConnecting}
            style={{
              fontFamily: "Righteous, sans-serif",
              boxShadow: "0 6px #1c3d5a",
              maxWidth: "480px",
              borderRadius: "25px",
            }}
          >
            {isConnecting ? (
              <span>Connecting...</span>
            ) : isAuthenticated ? (
              <>
                <div
                  className={`absolute left-[-400px] top-[60px] p-2 bg-white border border-gray-300 rounded shadow-lg transition-opacity duration-300 ${
                    isMetaMaskHovered ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ pointerEvents: "none" }}
                >
                  MetaMask ID: {metaMaskId}
                </div>
                Connected
              </>
            ) : (
              "Connect"
            )}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
