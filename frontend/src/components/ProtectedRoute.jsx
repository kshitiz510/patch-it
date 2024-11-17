import React from "react";
import { useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { role } = useContext(Web3Context);

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;