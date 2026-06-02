import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

const AuthPage = () => {
  const { login, isAuthenticated } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to Profile Page
  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const endpoint = mode === "register" ? "register" : "login";
      const payload =
        mode === "register"
          ? { name, email, password, role }
          : { email, password };

      const response = await api.post(`/auth/${endpoint}`, payload);
      login(response.data);
    } catch (err) {
      setMessage(err.response?.data?.error || "Authentication failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-16 px-6 min-h-screen bg-asphalt-950 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <p className="text-[11px] font-mono text-warn tracking-[0.3em] uppercase mb-3 text-center">
          // gateway
        </p>
        <h1 className="text-4xl font-display text-white mb-8 text-center">
          {mode === "register" ? "Create Access" : "Citizen Access"}
        </h1>

        <form onSubmit={submit} className="card p-6 space-y-4 shadow-xl border border-asphalt-800">
          <div className="grid grid-cols-2 gap-2 p-1 bg-asphalt-950 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
              className={`py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                mode === "login"
                  ? "bg-warn text-asphalt-950 shadow-md"
                  : "text-road-light hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setMessage("");
              }}
              className={`py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                mode === "register"
                  ? "bg-warn text-asphalt-950 shadow-md"
                  : "text-road-light hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          {mode === "register" && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-road uppercase tracking-wider block">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="input"
                  required
                  maxLength={80}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-road uppercase tracking-wider block">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="input cursor-pointer"
                >
                  <option value="citizen">Citizen Reporter</option>
                  <option value="contractor">Contractor / Bidder</option>
                  <option value="admin">Admin / Municipality</option>
                </select>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-road uppercase tracking-wider block">Email Address</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              type="email"
              className="input"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-road uppercase tracking-wider block">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              className="input"
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full rounded-xl py-3 mt-4 text-xs font-bold uppercase tracking-wider"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-asphalt-950/30 border-t-asphalt-950 rounded-full animate-spin" />
                Processing...
              </span>
            ) : mode === "register" ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 bg-red-950/20 border border-red-900/30 rounded-xl">
            <p className="text-xs text-red-400 text-center">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
