import styles from "./Home.module.css";
import "./Home.module.css";

const Home = () => {
  return (
    <div
      className="bg-[#eee6db] text-center pt-36"
      style={{ minHeight: "calc(100vh - 64px)", marginTop: "64px" }}
    >
      <h1 className={`text-9xl font-bold ${styles.heading}`}>patch.it</h1>
      <div className="mt-8">
        <p
          className="bg-[#8bbaae] text-black py-3 px-7 mt-8 font-bold inline-block transform transition-transform duration-200 hover:translate-y-1"
          style={{
            fontFamily: "revert",
            boxShadow: "0 8px #1c3d5a",
            maxWidth: "700px",
            borderRadius: "25px",
          }}
        >
          Patch-It leverages AI and crowd-sourcing to detect and report
          potholes, ensuring quicker repairs and safer commutes. Designed for
          municipalities and citizens, it enables easy reporting, tracking, and
          community collaboration to improve road safety and infrastructure
          efficiently.
        </p>
      </div>
    </div>
  );
};

export default Home;
