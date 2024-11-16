import Web3 from "web3";
import TenderBiddingABI from "./TenderBidding.json"; // Ensure this path is correct

const web3 = new Web3(Web3.givenProvider || "http://localhost:8545"); // Use the appropriate provider

let contract;

const setContractAddress = (address) => {
  contract = new web3.eth.Contract(TenderBiddingABI.abi, address);
};

export { contract, setContractAddress };
