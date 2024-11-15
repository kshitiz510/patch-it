import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#F4EFE6] px-10 py-3">
      <div className="flex items-center gap-4 text-[#1C160C]">
        <div className="w-4 h-4">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
        <h2 className="text-[#1C160C] text-lg font-bold leading-tight tracking-[-0.015em]">
          patch-it
        </h2>
      </div>
      <div className="flex flex-1 justify-end gap-8">
        <div className="flex items-center gap-9">
          <Link
            className="text-[#1C160C] text-sm font-medium leading-normal"
            to="/robotos"
          >
            Robotos
          </Link>
          <Link
            className="text-[#1C160C] text-sm font-medium leading-normal"
            to="/your-stuff"
          >
            Your Stuff
          </Link>
          <Link
            className="text-[#1C160C] text-sm font-medium leading-normal"
            to="/rarity"
          >
            Rarity
          </Link>
          <Link
            className="text-[#1C160C] text-sm font-medium leading-normal"
            to="/faq"
          >
            FAQ
          </Link>
          <Link
            className="text-[#1C160C] text-sm font-medium leading-normal"
            to="/connect"
          >
            Connect
          </Link>
        </div>
        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#019863] text-white text-sm font-bold leading-normal">
          <span className="truncate">Login / Signup</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
