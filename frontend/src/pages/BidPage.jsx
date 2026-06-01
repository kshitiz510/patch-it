import React, { useState, useEffect } from "react";
import Web3 from "web3";
import TenderBiddingABI from "../blockchain/TenderBidding.json";
import { api, getStoredAuth } from "../api";

/* ── Reusable section wrapper ── */
const Section = ({ icon, title, children, badge, variant = "default" }) => {
  const styles = {
    default: "border border-asphalt-700 bg-asphalt-900/30 rounded-2xl p-5",
    ghost: "border border-transparent p-5",
    accent: "border border-warn/20 bg-warn/[0.03] rounded-2xl p-5",
  };
  return (
    <div className={styles[variant]}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-road-light flex items-center gap-2">
          <svg
            className="w-4 h-4 text-warn/70 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
          {title}
        </h3>
        {badge}
      </div>
      {children}
    </div>
  );
};

const BidPage = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [contractAddress, setContractAddress] = useState(
    () => localStorage.getItem("patchit_contract_address") || "",
  );
  const [chainId, setChainId] = useState("");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info"); // info | success | error

  // Form state
  const [adminName, setAdminName] = useState("");
  const [bidderName, setBidderName] = useState("");
  const [tenderLat, setTenderLat] = useState("");
  const [tenderLng, setTenderLng] = useState("");
  const [tenderBudget, setTenderBudget] = useState("");
  const [bidTenderKey, setBidTenderKey] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [closeTenderKey, setCloseTenderKey] = useState("");
  const [openTenders, setOpenTenders] = useState([]);
  const [closedTenders, setClosedTenders] = useState([]);
  const [activeTab, setActiveTab] = useState("open");
  const [marketReports, setMarketReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState("");
  const currentUser = getStoredAuth().user;

  const showStatus = (msg, type = "info") => {
    setStatus(msg);
    setStatusType(type);
    if (type !== "error") setTimeout(() => setStatus(""), 5000);
  };

  const supportedChainIds = new Set(["0x7a69", "0x539", "0xaa36a7"]);

  const refreshChainId = async () => {
    if (!window.ethereum) return;
    const id = await window.ethereum.request({ method: "eth_chainId" });
    setChainId(id);
    if (!supportedChainIds.has(id)) {
      showStatus("Unsupported network. Switch to localhost or Sepolia.", "error");
    }
  };

  const disconnectWallet = () => {
    setWeb3(null);
    setAccount("");
    setContract(null);
    showStatus("Wallet disconnected", "info");
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      showStatus("Install MetaMask to use blockchain features.", "error");
      return;
    }
    try {
      const w3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await w3.eth.getAccounts();
      setWeb3(w3);
      setAccount(accounts[0]);
      await refreshChainId();
      showStatus(`Wallet connected`, "success");

      if (contractAddress) {
        const c = new w3.eth.Contract(TenderBiddingABI.abi, contractAddress);
        setContract(c);
      }
    } catch (err) {
      showStatus("Wallet connection failed: " + err.message, "error");
    }
  };

  // Deploy contract
  const handleDeploy = async () => {
    if (!web3 || !account) return showStatus("Connect your wallet first.", "error");
    if (!adminName.trim()) return showStatus("Enter admin name.", "error");
    showStatus("Deploying contract...");
    try {
      const c = new web3.eth.Contract(TenderBiddingABI.abi);
      const deployed = await c
        .deploy({ data: TenderBiddingABI.bytecode })
        .send({ from: account, gas: 3000000 });

      const addr = deployed.options.address;
      setContractAddress(addr);
      setContract(deployed);
      localStorage.setItem("patchit_contract_address", addr);

      showStatus(`Contract deployed & admin registered`, "success");
    } catch (err) {
      showStatus("Deploy failed: " + err.message, "error");
    }
  };

  // Load existing contract
  const loadContract = () => {
    if (!web3 || !contractAddress)
      return showStatus("Connect wallet and enter contract address.", "error");
    const c = new web3.eth.Contract(TenderBiddingABI.abi, contractAddress);
    setContract(c);
    localStorage.setItem("patchit_contract_address", contractAddress);
    showStatus("Contract loaded", "success");
  };

  // Register as bidder
  const handleRegisterBidder = async () => {
    if (!contract || !account) return showStatus("Deploy or load a contract first.", "error");
    if (!bidderName.trim()) return showStatus("Enter your name.", "error");
    showStatus("Registering...");
    try {
      await contract.methods.registerContractor().send({ from: account });
      await api.post("/wallets", { walletAddress: account });
      showStatus(`Registered as ${bidderName}`, "success");
    } catch (err) {
      showStatus("Registration failed: " + err.message, "error");
    }
  };

  // Create tender
  const handleCreateTender = async () => {
    if (!contract || !account) return showStatus("Deploy or load a contract first.", "error");
    const selectedReport = marketReports.find((report) => report._id === selectedReportId);
    if (!selectedReport && (!tenderLat || !tenderLng || !tenderBudget))
      return showStatus("Select a verified report or fill manual project fields.", "error");
    showStatus("Creating on-chain project...");
    try {
      const reportId = selectedReport?._id || `${tenderLat}_${tenderLng}`;
      const locationKey = selectedReport
        ? `${selectedReport.latitude}_${selectedReport.longitude}`
        : `${tenderLat}_${tenderLng}`;
      const estimate = selectedReport?.estimatedCost || parseInt(tenderBudget);
      await contract.methods
        .createProject(reportId, locationKey, estimate)
        .send({ from: account });
      if (selectedReport) await api.post(`/reports/${selectedReport._id}/open-bidding`);
      showStatus("Project created!", "success");
      setTenderLat("");
      setTenderLng("");
      setTenderBudget("");
      fetchTenders();
    } catch (err) {
      showStatus("Create tender failed: " + err.message, "error");
    }
  };

  // Place bid
  const handlePlaceBid = async () => {
    if (!contract || !account) return showStatus("Deploy or load a contract first.", "error");
    if (!bidTenderKey || !bidAmount) return showStatus("Fill report id and bid amount.", "error");
    showStatus("Placing bid...");
    try {
      const backendBid = await api.post("/bids", {
        reportId: bidTenderKey,
        walletAddress: account,
        amount: Number(bidAmount),
        timelineDays: 14,
      });
      const projectKey = web3.utils.keccak256(bidTenderKey);
      await contract.methods
        .submitBid(projectKey, parseInt(bidAmount), backendBid.data.rankingScore, `patchit://bids/${backendBid.data._id}`)
        .send({ from: account });
      showStatus("Bid placed!", "success");
      setBidAmount("");
    } catch (err) {
      showStatus("Bid failed: " + err.message, "error");
    }
  };

  // Close tender (admin)
  const handleCloseTender = async () => {
    if (!contract || !account) return showStatus("Deploy or load a contract first.", "error");
    if (!closeTenderKey) return showStatus("Select a project/report to allocate.", "error");
    showStatus("Allocating winner...");
    try {
      const allocation = await api.post("/contracts/select-winner", { reportId: closeTenderKey });
      const projectKey = web3.utils.keccak256(closeTenderKey);
      await contract.methods.selectWinner(projectKey, allocation.data.winningBid.walletAddress).send({ from: account });
      showStatus("Winner selected.", "success");
      setCloseTenderKey("");
      fetchTenders();
    } catch (err) {
      showStatus("Close tender failed: " + err.message, "error");
    }
  };

  // Fetch tenders
  const fetchTenders = async () => {
    if (!contract) return;
    try {
      const keys = await contract.methods.listProjects().call();
      setOpenTenders(keys.map((key) => ({ key, baseAmount: "on-chain project" })));
      setClosedTenders([]);
    } catch (err) {
      console.error("Fetch tenders failed:", err);
    }
  };

  useEffect(() => {
    if (contract) fetchTenders();
  }, [contract]);

  useEffect(() => {
    const loadMarketplace = async () => {
      try {
        const res = await api.get(currentUser?.role === "admin" ? "/reports?status=verified" : "/marketplace/reports");
        setMarketReports(res.data);
      } catch (err) {
        console.warn("Marketplace load failed:", err.response?.data?.error || err.message);
      }
    };
    loadMarketplace();
  }, [currentUser?.role]);

  useEffect(() => {
    if (!window.ethereum) return undefined;

    const handleAccountsChanged = (accounts) => {
      if (!accounts.length) {
        disconnectWallet();
        return;
      }
      setAccount(accounts[0]);
      setContract(null);
      showStatus("Account changed. Reload contract if needed.", "info");
    };

    const handleChainChanged = () => {
      refreshChainId();
      setContract(null);
      showStatus("Network changed. Reload contract if needed.", "info");
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  return (
    <div className="min-h-screen bg-asphalt-950">
      {/* Full-bleed header */}
      <div className="relative pt-28 pb-14 px-6 overflow-hidden">
        <div className="absolute inset-0 grid-bg noise-bg opacity-60" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-warn/[0.04] rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="text-[11px] font-mono text-warn tracking-[0.3em] uppercase mb-3">
                // tender.bid
              </p>
              <h1 className="text-4xl md:text-5xl font-display text-white leading-tight">
                Tender Bidding
              </h1>
              <p className="text-road-light mt-3 max-w-lg text-[15px] leading-relaxed">
                Deploy smart contracts, create repair tenders, and place bids — all on-chain with
                full transparency. Lowest bid wins automatically.
              </p>
            </div>
          </div>

          {/* Stepper — inline compact, not boxed */}
          <div className="flex items-center gap-2 mt-8">
            {[
              { step: 1, label: "Connect", done: !!account },
              { step: 2, label: "Contract", done: !!contract },
              { step: 3, label: "Register", done: false },
              { step: 4, label: "Bid", done: false },
            ].map((s, i) => (
              <React.Fragment key={s.step}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono ${
                      s.done
                        ? "bg-warn text-asphalt-950 font-bold"
                        : "border border-asphalt-600 text-road"
                    }`}
                  >
                    {s.done ? "✓" : s.step}
                  </div>
                  <span className={`text-xs font-medium ${s.done ? "text-warn" : "text-road"}`}>
                    {s.label}
                  </span>
                </div>
                {i < 3 && (
                  <div
                    className={`flex-1 h-px max-w-[60px] ${
                      s.done ? "bg-warn/40" : "bg-asphalt-700"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-asphalt-700 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* ── Setup Row: Wallet + Contract inline ── */}
        <div className="grid md:grid-cols-12 gap-6 mb-8">
          {/* Wallet — compact, no card */}
          <div className="md:col-span-4">
            <p className="text-[10px] font-mono text-road tracking-[0.2em] uppercase mb-3">
              Wallet
            </p>
            {account ? (
              <div className="flex items-center justify-between gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white font-mono truncate max-w-[180px]">{account}</p>
                  <p className="text-[10px] text-road">
                    MetaMask connected{chainId ? ` (${chainId})` : ""}
                  </p>
                </div>
                <button onClick={disconnectWallet} className="btn-ghost text-[10px] px-3 py-1">
                  Disconnect
                </button>
              </div>
            ) : (
              <button onClick={connectWallet} className="btn-primary rounded-xl text-sm w-full">
                Connect MetaMask
              </button>
            )}
          </div>

          {/* Contract — takes remaining space */}
          <div className="md:col-span-8">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[10px] font-mono text-road tracking-[0.2em] uppercase">Contract</p>
              {contract && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x... contract address"
                className="input flex-1 font-mono text-xs"
              />
              <button
                onClick={loadContract}
                className="btn-secondary rounded-xl text-xs px-4 whitespace-nowrap"
              >
                Load
              </button>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1 border-t border-asphalt-700/50" />
              <span className="text-[9px] text-road/60 uppercase tracking-widest">or deploy</span>
              <div className="flex-1 border-t border-asphalt-700/50" />
            </div>
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Admin name"
                className="input flex-1 text-sm"
              />
              <button onClick={handleDeploy} className="btn-primary rounded-xl text-xs px-4">
                Deploy
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-asphalt-700/60 to-transparent mb-8" />

        {marketReports.length > 0 && (
          <div className="mb-8">
            <p className="text-[10px] font-mono text-road tracking-[0.2em] uppercase mb-3">
              Marketplace Reports
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {marketReports.slice(0, 4).map((report) => (
                <button
                  type="button"
                  key={report._id}
                  onClick={() => {
                    setBidTenderKey(report._id);
                    setSelectedReportId(report._id);
                  }}
                  className="text-left border border-asphalt-700 hover:border-warn/40 rounded-xl p-4 transition"
                >
                  <p className="text-xs font-mono text-white truncate">{report._id}</p>
                  <p className="text-xs text-road mt-1">
                    {Number(report.latitude).toFixed(4)}, {Number(report.longitude).toFixed(4)}
                  </p>
                  <p className="text-xs text-warn mt-2">
                    {report.severity || "unknown"} · Rs {report.estimatedCost || 0}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Actions Grid: 3 columns, varied treatments ── */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {/* Register */}
          <Section
            icon="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            title="Register as Bidder"
            variant="default"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={bidderName}
                onChange={(e) => setBidderName(e.target.value)}
                placeholder="Your name"
                className="input flex-1 text-sm"
              />
              <button
                onClick={handleRegisterBidder}
                className="btn-primary rounded-xl text-xs px-4"
              >
                Register
              </button>
            </div>
          </Section>

          {/* Create Tender */}
          <Section
            icon="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            title="Create Tender"
            badge={<span className="text-[9px] font-mono text-warn/60 uppercase">Admin</span>}
            variant="accent"
          >
            <div className="space-y-3">
              {currentUser?.role === "admin" && marketReports.length > 0 && (
                <select
                  value={selectedReportId}
                  onChange={(e) => setSelectedReportId(e.target.value)}
                  className="input text-sm cursor-pointer"
                >
                  <option value="">Select verified report...</option>
                  {marketReports.map((report) => (
                    <option key={report._id} value={report._id}>
                      {Number(report.latitude).toFixed(4)}, {Number(report.longitude).toFixed(4)} - Rs {report.estimatedCost || 0}
                    </option>
                  ))}
                </select>
              )}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={tenderLat}
                  onChange={(e) => setTenderLat(e.target.value)}
                  placeholder="Lat"
                  className="input text-sm"
                />
                <input
                  type="text"
                  value={tenderLng}
                  onChange={(e) => setTenderLng(e.target.value)}
                  placeholder="Lng"
                  className="input text-sm"
                />
              </div>
              <input
                type="number"
                value={tenderBudget}
                onChange={(e) => setTenderBudget(e.target.value)}
                placeholder="Base amount (wei)"
                className="input text-sm"
              />
              <button
                onClick={handleCreateTender}
                className="btn-primary w-full rounded-xl text-sm"
              >
                Create
              </button>
            </div>
          </Section>

          {/* Place Bid */}
          <Section
            icon="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
            title="Place Bid"
            variant="default"
          >
            <div className="space-y-3">
              <input
                type="text"
                value={bidTenderKey}
                onChange={(e) => setBidTenderKey(e.target.value)}
                placeholder="Report id from marketplace"
                className="input font-mono text-xs"
              />
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Bid amount (wei)"
                className="input text-sm"
              />
              <button onClick={handlePlaceBid} className="btn-primary w-full rounded-xl text-sm">
                Submit Bid
              </button>
            </div>
          </Section>
        </div>

        {/* Close Tender — full width, different visual */}
        {currentUser?.role === "admin" && (
        <div className="border border-dashed border-asphalt-700 rounded-xl p-5 mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-shrink-0">
              <p className="text-sm text-white font-medium">Close Tender</p>
              <p className="text-[10px] text-road font-mono uppercase">Admin only</p>
            </div>
            <div className="flex-1 flex gap-2 w-full sm:w-auto">
              {marketReports.length > 0 ? (
                <select
                  value={closeTenderKey}
                  onChange={(e) => setCloseTenderKey(e.target.value)}
                  className="input text-sm cursor-pointer flex-1"
                >
                  <option value="">Select a report...</option>
                  {marketReports.map((report) => (
                    <option key={report._id} value={report._id}>
                      {Number(report.latitude).toFixed(4)}, {Number(report.longitude).toFixed(4)} — Rs {report.estimatedCost || 0}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-road py-2">No reports ready for allocation.</p>
              )}
              <button
                onClick={handleCloseTender}
                disabled={!closeTenderKey}
                className="btn-primary rounded-xl text-xs px-5 disabled:opacity-40 flex-shrink-0"
              >
                Close & Award
              </button>
            </div>
          </div>
        </div>
        )}

        {/* ── Tenders List ── */}
        {(openTenders.length > 0 || closedTenders.length > 0) && (
          <div>
            <div className="flex items-center gap-4 mb-5">
              <p className="text-[10px] font-mono text-road tracking-[0.2em] uppercase">Tenders</p>
              <div className="flex-1 h-px bg-asphalt-700/50" />
              <div className="flex gap-1">
                {[
                  { key: "open", label: "Open", count: openTenders.length },
                  { key: "closed", label: "Closed", count: closedTenders.length },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      activeTab === tab.key ? "bg-warn/10 text-warn" : "text-road hover:text-white"
                    }`}
                  >
                    {tab.label}
                    <span className="ml-1 text-[10px] opacity-60">{tab.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Open tenders */}
            {activeTab === "open" && (
              <div className="space-y-2">
                {openTenders.length === 0 ? (
                  <p className="text-center text-road py-8 text-sm">No open tenders</p>
                ) : (
                  openTenders.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3 px-4 rounded-xl border border-transparent hover:border-asphalt-700 hover:bg-asphalt-900/40 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                        <div>
                          <p className="text-sm font-mono text-white">{t.key}</p>
                          <p className="text-[10px] text-road">Base: {t.baseAmount} wei</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setBidTenderKey(t.key);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="opacity-0 group-hover:opacity-100 text-[10px] font-mono text-warn hover:text-warn-light transition-all px-3 py-1 border border-warn/20 rounded-lg"
                      >
                        BID →
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Closed tenders */}
            {activeTab === "closed" && (
              <div className="space-y-2">
                {closedTenders.length === 0 ? (
                  <p className="text-center text-road py-8 text-sm">No closed tenders</p>
                ) : (
                  closedTenders.map((t, i) => (
                    <div
                      key={i}
                      className="py-3 px-4 rounded-xl border border-transparent hover:border-asphalt-700/50 hover:bg-asphalt-900/30 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-2 h-2 rounded-full bg-road flex-shrink-0" />
                        <p className="text-sm font-mono text-white">{t.key}</p>
                      </div>
                      <div className="flex gap-8 ml-5">
                        <div>
                          <p className="text-[9px] text-road font-mono uppercase tracking-wider">
                            Winner
                          </p>
                          <p className="text-xs text-warn-light font-mono truncate max-w-[200px]">
                            {t.winner}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-road font-mono uppercase tracking-wider">
                            Bid
                          </p>
                          <p className="text-xs text-white">{t.lowestBid} wei</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status toast */}
      {status && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-sm max-w-md text-center backdrop-blur-sm border transition-all animate-fade-up ${
            statusType === "success"
              ? "bg-green-950/90 border-green-800 text-green-300"
              : statusType === "error"
                ? "bg-red-950/90 border-red-800 text-red-300"
                : "bg-asphalt-800/90 border-asphalt-700 text-road-light"
          }`}
        >
          {status}
        </div>
      )}
    </div>
  );
};

export default BidPage;
