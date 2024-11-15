import React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

const App = () => {
  return (
    // <Routes>
    //   <Route path="/" component={<Layout />}>
    //   </Route>
    // </Routes>
    <>
      <Navbar />
      <Home />
    </>
  );
};

export default App;
