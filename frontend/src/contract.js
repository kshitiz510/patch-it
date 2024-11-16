import Web3 from 'web3';
import TenderBiddingABI from './TenderBidding.json'; 

const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545'); 
const contractAddress = 'YOUR_CONTRACT_ADDRESS'; 
const contract = new web3.eth.Contract(TenderBiddingABI.abi, contractAddress);

export default contract;