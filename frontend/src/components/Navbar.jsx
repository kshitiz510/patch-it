import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b bg-[#ace5d7] border-solid px-10 py-3 shadow">
      <div className="flex items-center gap-4 text-[#1C160C]">
        <div className="size-4">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
        <Link
          to="/"
          className="text-[#1C160C] text-lg font-bold leading-tight tracking-[-0.015em]"
          style={{
            fontFamily: '"Righteous", sans-serif',
            fontSize: "1.5rem",
          }}
        >
          patch.it
        </Link>
      </div>

      {/* Navigation Links */}
      <nav
        className="flex flex-1 justify-end gap-8"
        style={{
          fontFamily: "sans-serif",
          fontSize: "1rem",
        }}
      >
        <div className="flex items-center gap-9">
          <Link
            to="/map"
            className="text-[#1C160C] text-sm font-medium leading-normal"
          >
            Map
          </Link>
          <Link
            to="/community"
            className="text-[#1C160C] text-sm font-medium leading-normal"
          >
            Community
          </Link>
          <Link
            to="/bid"
            className="text-[#1C160C] text-sm font-medium leading-normal"
          >
            Bid
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isAuthenticated ? (
            <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-[#F4EFE6] text-[#1C160C] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20px"
                height="20px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM176,88a48,48,0,0,1-96,0,8,8,0,0,1,16,0,32,32,0,0,0,64,0,8,8,0,0,1,16,0Z"></path>
              </svg>
            </button>
          ) : (
            <Link
              to="/auth"
                className="flex items-center justify-center bg-[#6392d9] px-6 py-2 text-white text-sm font-semibold leading-tight tracking-wide shadow-md hover:bg-[#33578e] transition-all duration-300 ease-in-out"
                style={{
                  boxShadow: "0 4px #1c3d5a",
                  fontSize: "0.9rem",
                  borderRadius: "15px",
                }}
            >
              Login / Signup
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
