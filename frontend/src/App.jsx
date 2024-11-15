import React from "react";
import "./App.css";

const App = () => {
  return (
    <div
      className="relative flex min-h-screen flex-col bg-white overflow-x-hidden"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      <div className="flex h-full grow flex-col">
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
            <h2 className="text-[#1C160C] text-lg font-bold leading-tight">
              patch-it
            </h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <a
                className="text-[#1C160C] text-sm font-medium leading-normal"
                href="#"
              >
                Robotos
              </a>
              <a
                className="text-[#1C160C] text-sm font-medium leading-normal"
                href="#"
              >
                Your Stuff
              </a>
              <a
                className="text-[#1C160C] text-sm font-medium leading-normal"
                href="#"
              >
                Rarity
              </a>
              <a
                className="text-[#1C160C] text-sm font-medium leading-normal"
                href="#"
              >
                FAQ
              </a>
              <a
                className="text-[#1C160C] text-sm font-medium leading-normal"
                href="#"
              >
                Connect
              </a>
            </div>
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#019863] text-white text-sm font-bold leading-normal">
              <span className="truncate">Login / Signup</span>
            </button>
          </div>
        </header>
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="flex flex-col max-w-[960px] flex-1">
            <div className="container">
              <div className="flex flex-col gap-6 px-4 py-10 md:gap-8 lg:flex-row">
                <div className="flex flex-col gap-6 md:min-w-[400px] md:gap-8 lg:justify-center">
                  <h1 className="text-[#1C160C] text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl md:font-black md:leading-tight md:tracking-[-0.033em] text-center">
                    patch-it
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
