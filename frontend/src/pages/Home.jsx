import React from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";
import "./Home.module.css";

const Home = () => {
  return (
    <div className="text-center pt-28">
      <h1 className={`text-9xl font-bold ${styles.heading}`}>patch.it</h1>
      <div className="mt-8">
        {/* <Link
          to="/authenticate"
          className="bg-[#ace5d7] text-black py-2 px-6 rounded-lg font-bold uppercase inline-block transform transition-transform duration-200 hover:translate-y-1"
          style={{
            boxShadow: "0 4px #1c3d5a",
          }}
        >
          Authenticate Now
        </Link> */}

        <p
          className="bg-[#ace5d7] text-black py-3 px-7 mt-8 font-bold inline-block transform transition-transform duration-200 hover:translate-y-1"
          style={{
            fontFamily: "revert",
            boxShadow: "0 8px #1c3d5a",
            maxWidth: "750px",
            borderRadius: "25px",
          }}
        >
          Patch-It leverages AI and crowd-sourcing to detect and report potholes, ensuring quicker repairs and safer commutes. Designed for municipalities and citizens alike, it streamlines road maintenance, improving infrastructure and travel experiences. Join us in making roads safer, one patch at a time!
        </p>
      </div>
    </div>
  );
};

export default Home;
