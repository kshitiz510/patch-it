import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

const ProfilePage = () => {
  const { user, logout, updateUser, login } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [web3Account, setWeb3Account] = useState("");

  // Data states
  const [userReports, setUserReports] = useState([]);
  const [contractorBids, setContractorBids] = useState([]);
  const [contractorContracts, setContractorContracts] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [seededAccounts, setSeededAccounts] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      if (user.role === "citizen") {
        const res = await api.get("/locations");
        setUserReports(res.data.filter((loc) => loc.reporter === user.id || loc.reporter?._id === user.id));
      } else if (user.role === "contractor") {
        const [bidsRes, contractsRes] = await Promise.all([
          api.get("/bids"),
          api.get("/contracts"),
        ]);
        setContractorBids(bidsRes.data);
        setContractorContracts(contractsRes.data);
      } else if (user.role === "admin") {
        const [locRes, contractsRes] = await Promise.all([
          api.get("/locations"),
          api.get("/contracts"),
        ]);
        setAllLocations(locRes.data);
        setContractorContracts(contractsRes.data);
      }
    } catch (err) {
      console.error("Failed to load profile data:", err);
      setError("Failed to fetch dashboard records.");
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    setError("");
    setSuccess("");
    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install it.");
      return;
    }
    try {
      const w3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await w3.eth.getAccounts();
      const linkedAddress = accounts[0].toLowerCase();
      setWeb3Account(linkedAddress);

      // Link to backend
      const res = await api.post("/wallets", { walletAddress: linkedAddress });
      updateUser(res.data.user);
      setSuccess("Web3 Wallet linked to profile successfully!");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const seedDeveloperAccounts = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await api.post("/dev/seed-test-accounts");
      setSeededAccounts(res.data.accounts);
      setSuccess("Test accounts seeded successfully in MongoDB!");
    } catch (err) {
      setError("Failed to seed test accounts.");
    }
  };

  const instantLogin = async (email, password) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data);
      setSuccess(`Instant logged in as ${res.data.user.name}`);
    } catch (err) {
      setError("Instant login failed.");
    } finally {
      setLoading(false);
    }
  };

  const updateContractStatus = async (contractId, status) => {
    setError("");
    setSuccess("");
    try {
      await api.patch(`/contracts/${contractId}/status`, { status });
      setSuccess("Contract status updated!");
      fetchProfileData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update status.");
    }
  };

  return (
    <div className="pt-28 pb-16 px-6 min-h-screen bg-asphalt-950 text-white">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <p className="text-[11px] font-mono text-warn tracking-[0.3em] uppercase mb-1">// account.dashboard</p>
            <h1 className="text-4xl font-display text-white">Welcome, {user.name}</h1>
            <p className="text-sm text-road-light mt-1">
              Registered role: <span className="text-warn capitalize font-semibold">{user.role}</span>
            </p>
          </div>
          <button onClick={logout} className="btn-secondary rounded-xl text-xs px-5">
            Sign Out
          </button>
        </div>

        {/* Success/Error Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/20 border border-red-900/30 text-red-300 rounded-xl text-xs">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-950/20 border border-green-900/30 text-green-300 rounded-xl text-xs">
            {success}
          </div>
        )}

        {/* Dashboard Tabs */}
        <div className="flex border-b border-asphalt-800 gap-2 mb-8 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === "overview" ? "border-b-2 border-warn text-warn" : "text-road hover:text-white"
            }`}
          >
            Overview
          </button>
          {user.role === "citizen" && (
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === "reports" ? "border-b-2 border-warn text-warn" : "text-road hover:text-white"
              }`}
            >
              My Reports ({userReports.length})
            </button>
          )}
          {user.role === "contractor" && (
            <button
              onClick={() => setActiveTab("contractor")}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === "contractor" ? "border-b-2 border-warn text-warn" : "text-road hover:text-white"
              }`}
            >
              Bids & Tenders
            </button>
          )}
          {user.role === "admin" && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === "admin" ? "border-b-2 border-warn text-warn" : "text-road hover:text-white"
              }`}
            >
              Admin Operations
            </button>
          )}
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === "sandbox" ? "border-b-2 border-warn text-warn" : "text-road hover:text-white"
            }`}
          >
            Developer Sandbox
          </button>
        </div>

        {/* TAB CONTENTS */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Account Card */}
            <div className="card p-6 md:col-span-2 space-y-6">
              <h2 className="text-lg font-semibold text-white border-b border-asphalt-800 pb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-warn" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile Specifications
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-road font-mono uppercase">Full Name</p>
                  <p className="text-white font-medium mt-0.5">{user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-road font-mono uppercase">Email Address</p>
                  <p className="text-white font-medium mt-0.5">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-road font-mono uppercase">Reputation Points</p>
                  <p className="text-warn font-semibold mt-0.5">{user.reputation || 50} / 100</p>
                </div>
                {user.role === "contractor" && (
                  <div>
                    <p className="text-xs text-road font-mono uppercase">Completed Contracts</p>
                    <p className="text-green-400 font-semibold mt-0.5">{user.completedContracts || 0}</p>
                  </div>
                )}
              </div>

              {/* Wallet Linking */}
              <div className="border-t border-asphalt-800 pt-6">
                <p className="text-xs text-road font-mono uppercase mb-3">MetaMask Blockchain Wallet</p>
                {user.walletAddress ? (
                  <div className="bg-asphalt-950 p-4 rounded-xl flex items-center justify-between border border-asphalt-800">
                    <div className="min-w-0">
                      <p className="text-[10px] text-green-400 font-mono tracking-wider font-semibold uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Linked On-chain Address
                      </p>
                      <p className="text-xs font-mono text-white mt-1 truncate">{user.walletAddress}</p>
                    </div>
                    <span className="badge badge-green text-[9px] uppercase">Active</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-road-light leading-relaxed">
                      Linking your MetaMask address allows the application to map bids and repair allocations correctly.
                    </p>
                    <button onClick={connectWallet} className="btn-primary rounded-xl text-xs py-2.5 px-5">
                      Connect & Link Wallet
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats sidebar */}
            <div className="space-y-6">
              <div className="card p-6 text-center">
                <p className="text-xs text-road font-mono uppercase tracking-wider">Your Role</p>
                <p className="text-3xl font-display text-warn mt-2 capitalize">{user.role}</p>
              </div>

              {user.role === "citizen" && (
                <div className="card p-6 text-center">
                  <p className="text-xs text-road font-mono uppercase tracking-wider">Reports Logged</p>
                  <p className="text-4xl font-display text-white mt-2">{userReports.length}</p>
                  <button onClick={() => setActiveTab("reports")} className="text-xs text-warn mt-4 hover:underline block mx-auto">
                    View reports list &rarr;
                  </button>
                </div>
              )}

              {user.role === "contractor" && (
                <div className="card p-6 space-y-4">
                  <p className="text-xs text-road font-mono uppercase tracking-wider text-center">Contractor Summary</p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-display text-white">{contractorBids.length}</p>
                      <p className="text-[9px] text-road uppercase mt-1">Total Bids</p>
                    </div>
                    <div>
                      <p className="text-2xl font-display text-green-400">{contractorContracts.length}</p>
                      <p className="text-[9px] text-road uppercase mt-1">Contracts</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab("contractor")} className="text-xs text-warn text-center hover:underline block mx-auto pt-2">
                    Manage bids &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === "reports" && user.role === "citizen" && (
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-semibold border-b border-asphalt-800 pb-3">My Submitted Reports</h2>
            {loading ? (
              <p className="text-center text-xs text-road">Loading...</p>
            ) : userReports.length === 0 ? (
              <p className="text-center text-xs text-road py-12">You haven't submitted any reports yet.</p>
            ) : (
              <div className="space-y-4">
                {userReports.map((report) => (
                  <div key={report._id} className="p-4 bg-asphalt-900 border border-asphalt-800 rounded-xl flex flex-col sm:flex-row justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-mono text-white">
                        {Number(report.latitude).toFixed(4)}, {Number(report.longitude).toFixed(4)}
                      </p>
                      {report.description && <p className="text-xs text-road-light mt-1 break-words">{report.description}</p>}
                      <p className="text-[10px] text-road mt-2">
                        Created: {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex sm:flex-col items-end gap-2 flex-shrink-0">
                      <span className="badge badge-warn text-[10px] uppercase">{report.status}</span>
                      <span className="text-[10px] text-road">Credibility: <span className="text-warn">{report.credibilityScore}%</span></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTRACTOR TAB */}
        {activeTab === "contractor" && user.role === "contractor" && (
          <div className="space-y-6">
            {/* Active contracts */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold border-b border-asphalt-800 pb-3 mb-4">Allocated Repair Contracts</h2>
              {contractorContracts.length === 0 ? (
                <p className="text-xs text-road text-center py-6">No active contracts assigned.</p>
              ) : (
                <div className="space-y-4">
                  {contractorContracts.map((contract) => (
                    <div key={contract._id} className="p-4 bg-asphalt-900 border border-asphalt-800 rounded-xl space-y-3">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <p className="text-xs text-road font-mono uppercase">Contract Key</p>
                          <p className="text-sm font-mono text-white">{contract.projectKey}</p>
                        </div>
                        <span className="badge badge-warn uppercase text-[10px]">{contract.status}</span>
                      </div>
                      <div className="flex justify-between text-xs text-road-light">
                        <p>Amount: <span className="text-white font-bold">Rs {contract.amount}</span></p>
                        <p>Assigned: {new Date(contract.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-asphalt-800">
                        {contract.status === "assigned" && (
                          <button
                            onClick={() => updateContractStatus(contract._id, "work_in_progress")}
                            className="btn-primary rounded-lg text-xs py-1.5 px-4"
                          >
                            Mark Work In Progress
                          </button>
                        )}
                        {contract.status === "work_in_progress" && (
                          <button
                            onClick={() => updateContractStatus(contract._id, "completed")}
                            className="btn-primary rounded-lg text-xs py-1.5 px-4"
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submitted Bids */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold border-b border-asphalt-800 pb-3 mb-4">Submitted Bids Log</h2>
              {contractorBids.length === 0 ? (
                <p className="text-xs text-road text-center py-6">You haven't submitted any bids yet.</p>
              ) : (
                <div className="space-y-3">
                  {contractorBids.map((bid) => (
                    <div key={bid._id} className="p-4 bg-asphalt-900/60 border border-asphalt-800/80 rounded-xl flex justify-between items-center flex-wrap gap-4">
                      <div>
                        <p className="text-xs font-mono text-white truncate max-w-[200px]">Report ID: {bid.report}</p>
                        <p className="text-xs text-road-light mt-1">
                          Amount: Rs {bid.amount} | Timeline: {bid.timelineDays} days
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`badge uppercase text-[9px] ${bid.status === "selected" ? "badge-green" : "badge-warn"}`}>
                          {bid.status}
                        </span>
                        <p className="text-[10px] text-road mt-1">Score: {bid.rankingScore}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADMIN TAB */}
        {activeTab === "admin" && user.role === "admin" && (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold border-b border-asphalt-800 pb-3 mb-4">System Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-3xl font-display text-white">{allLocations.length}</p>
                  <p className="text-xs text-road uppercase mt-1">Total Reports</p>
                </div>
                <div>
                  <p className="text-3xl font-display text-warn">{allLocations.filter((l) => l.status === "tendered").length}</p>
                  <p className="text-xs text-road uppercase mt-1">Active Tenders</p>
                </div>
                <div>
                  <p className="text-3xl font-display text-green-400">{contractorContracts.length}</p>
                  <p className="text-xs text-road uppercase mt-1">Contracts</p>
                </div>
                <div>
                  <p className="text-3xl font-display text-white">
                    {allLocations.filter((l) => l.status === "repaired" || l.status === "verified").length}
                  </p>
                  <p className="text-xs text-road uppercase mt-1">Repairs Done</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold border-b border-asphalt-800 pb-3 mb-4">All Active Repair Contracts</h2>
              {contractorContracts.length === 0 ? (
                <p className="text-xs text-road text-center py-6">No contracts on file.</p>
              ) : (
                <div className="space-y-4">
                  {contractorContracts.map((contract) => (
                    <div key={contract._id} className="p-4 bg-asphalt-900 border border-asphalt-800 rounded-xl space-y-3">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <p className="text-xs text-road font-mono uppercase">Project Key</p>
                          <p className="text-sm font-mono text-white">{contract.projectKey}</p>
                        </div>
                        <span className="badge badge-warn uppercase text-[10px]">{contract.status}</span>
                      </div>
                      <div className="flex justify-between text-xs text-road-light">
                        <p>Amount: Rs {contract.amount} | Contractor ID: {contract.contractor}</p>
                        <p>Assigned: {new Date(contract.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-asphalt-800">
                        {contract.status === "completed" && (
                          <button
                            onClick={() => updateContractStatus(contract._id, "verified")}
                            className="btn-primary rounded-lg text-xs py-1.5 px-4"
                          >
                            Verify Work
                          </button>
                        )}
                        {contract.status === "verified" && (
                          <button
                            onClick={() => updateContractStatus(contract._id, "payment_released")}
                            className="btn-primary rounded-lg text-xs py-1.5 px-4"
                          >
                            Release Escrow Funds
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DEVELOPER SANDBOX TAB */}
        {activeTab === "sandbox" && (
          <div className="card p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold border-b border-asphalt-800 pb-3">Developer Sandbox</h2>
              <p className="text-xs text-road-light mt-2 leading-relaxed">
                This sandbox makes demonstrating role interactions extremely fast. Press "Seed Test Accounts" to insert preconfigured Citizen, Contractor, and Admin accounts in MongoDB, then click "Instant Sign In" to switch roles on the fly.
              </p>
            </div>

            <button onClick={seedDeveloperAccounts} className="btn-primary rounded-xl text-xs py-2.5 px-5">
              Seed Test Accounts in Database
            </button>

            {seededAccounts ? (
              <div className="space-y-4 pt-4 border-t border-asphalt-800">
                <p className="text-xs text-road font-mono uppercase">Instant Role Swappers</p>
                <div className="grid sm:grid-cols-3 gap-4">
                  {seededAccounts.map((acc) => (
                    <div key={acc.email} className="p-4 bg-asphalt-900 border border-asphalt-800 rounded-xl flex flex-col justify-between space-y-3">
                      <div>
                        <p className="text-xs text-warn font-semibold capitalize">{acc.role}</p>
                        <p className="text-[10px] text-road mt-1 font-mono">{acc.email}</p>
                        <p className="text-[10px] text-road font-mono">PW: {acc.password}</p>
                      </div>
                      <button
                        onClick={() => instantLogin(acc.email, acc.password)}
                        className="btn-secondary rounded-lg text-[10px] py-1.5 w-full font-bold uppercase tracking-wider"
                      >
                        Instant Sign In
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-road-light italic">Click Seed above to show swappers.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
