import React, { useState } from "react";
import { api, clearAuth, storeAuth } from "../api";

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("patchit_user");
    return stored ? JSON.parse(stored) : null;
  });

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const endpoint = mode === "register" ? "register" : "login";
      const response = await api.post(`/auth/${endpoint}`, {
        name,
        email,
        password,
        role,
      });
      storeAuth(response.data);
      setUser(response.data.user);
      setMessage(mode === "register" ? "Account created" : "Signed in");
    } catch (err) {
      setMessage(err.response?.data?.error || "Authentication failed");
    }
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    setMessage("Signed out");
  };

  return (
    <div className="pt-28 pb-16 px-6 min-h-screen bg-asphalt-950">
      <div className="max-w-md mx-auto">
        <p className="text-[11px] font-mono text-warn tracking-[0.3em] uppercase mb-3">
          // account
        </p>
        <h1 className="text-4xl font-display text-white mb-8">Citizen Access</h1>

        {user ? (
          <div className="card p-6">
            <p className="text-sm text-road">Signed in as</p>
            <p className="text-xl text-white mt-1">{user.name}</p>
            <p className="text-sm text-road-light mt-1">{user.email}</p>
            <button onClick={logout} className="btn-secondary w-full mt-6 rounded-xl">
              Sign out
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="card p-6 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`py-2 rounded-lg text-sm ${
                  mode === "login" ? "bg-warn text-asphalt-950" : "text-road-light bg-asphalt-800"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`py-2 rounded-lg text-sm ${
                  mode === "register"
                    ? "bg-warn text-asphalt-950"
                    : "text-road-light bg-asphalt-800"
                }`}
              >
                Register
              </button>
            </div>
            {mode === "register" && (
              <>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  className="input"
                  required
                />
                <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
                  <option value="citizen">Citizen</option>
                  <option value="contractor">Contractor</option>
                  <option value="admin">Admin</option>
                </select>
              </>
            )}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="input"
              required
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              className="input"
              minLength={8}
              required
            />
            <button type="submit" className="btn-primary w-full rounded-xl">
              {mode === "register" ? "Create Account" : "Sign In"}
            </button>
          </form>
        )}

        {message && <p className="text-sm text-road-light mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
};

export default AuthPage;
