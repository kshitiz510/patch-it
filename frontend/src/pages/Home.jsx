import styles from "./Home.module.css";
import "./Home.module.css";

const Home = () => {
  return (
    <div className="text-center pt-28 mt-24">
      <h1 className={`text-9xl font-bold ${styles.heading}`}>patch.it</h1>
      <div className="mt-8">
        <p
          className="bg-[#ace5d7] text-black py-3 px-7 mt-8 font-bold inline-block transform transition-transform duration-200 hover:translate-y-1"
          style={{
            fontFamily: "revert",
            boxShadow: "0 8px #1c3d5a",
            maxWidth: "700px",
            borderRadius: "25px",
          }}
        >
          Patch-It leverages AI and crowd-sourcing to detect and report
          potholes, ensuring quicker repairs and safer commutes. Designed for
          municipalities and citizens.
        </p>
      </div>
    </div>
  );
};

export default Home;
