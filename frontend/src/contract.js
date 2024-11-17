import Web3 from "web3";
import TenderBiddingABI from "./TenderBidding.json"; // Ensure this path is correct

const web3 = new Web3(Web3.givenProvider || "http://localhost:8545"); // Use the appropriate provider

let contract;

const setContractAddress = (address) => {
  contract = new web3.eth.Contract(TenderBiddingABI.abi, address);
  // Save contract address to local storage
  localStorage.setItem("contractAddress", address);
};

const getContractAddress = () => {
  // Retrieve contract address from local storage
  return localStorage.getItem("contractAddress");
};

// Initialize contract with stored address if available
const storedAddress = getContractAddress();
if (storedAddress) {
  setContractAddress(storedAddress);
}

const registerBidder = async (bidderName) => {
  if (!contract) {
    throw new Error("Contract is not initialized.");
  }
  const accounts = await web3.eth.getAccounts();
  if (accounts.length === 0) {
    throw new Error("No accounts found.");
  }
  await contract.methods.registerBidder(bidderName).send({
    from: accounts[0],
    gas: 3000000, // Adjust gas limit as needed
    gasPrice: await web3.eth.getGasPrice(), // Use legacy gas price
  });
};

const createTender = async (latitude, longitude, baseAmount) => {
  if (!contract) {
    throw new Error("Contract is not initialized.");
  }
  const accounts = await web3.eth.getAccounts();
  if (accounts.length === 0) {
    throw new Error("No accounts found.");
  }
  await contract.methods.createTender(latitude, longitude, baseAmount).send({
    from: accounts[0],
    gas: 3000000, // Adjust gas limit as needed
    gasPrice: await web3.eth.getGasPrice(), // Use legacy gas price
  });
};

const placeBid = async (tenderKey, name, amount) => {
  if (!contract) {
    throw new Error("Contract is not initialized.");
  }
  const accounts = await web3.eth.getAccounts();
  if (accounts.length === 0) {
    throw new Error("No accounts found.");
  }
  await contract.methods.placeBid(tenderKey, name, amount).send({
    from: accounts[0],
    gas: 3000000, // Adjust gas limit as needed
    gasPrice: await web3.eth.getGasPrice(), // Use legacy gas price
  });
};

const listOpenTenders = async () => {
  if (!contract) {
    throw new Error("Contract is not initialized.");
  }
  return await contract.methods.listOpenTenders().call();
};

const closeTender = async (tenderKey) => {
  if (!contract) {
    throw new Error("Contract is not initialized.");
  }
  const accounts = await web3.eth.getAccounts();
  if (accounts.length === 0) {
    throw new Error("No accounts found.");
  }
  await contract.methods.closeTender(tenderKey).send({
    from: accounts[0],
    gas: 3000000, // Adjust gas limit as needed
    gasPrice: await web3.eth.getGasPrice(), // Use legacy gas price
  });
};

const listBidders = async () => {
  if (!contract) {
    throw new Error("Contract is not initialized.");
  }
  return await contract.methods.listBidders().call();
};

export {
  contract,
  setContractAddress,
  getContractAddress,
  registerBidder,
  createTender,
  placeBid,
  listOpenTenders,
  closeTender,
  listBidders,
};
