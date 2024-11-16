import Web3 from "web3";
import TenderBiddingABI from "./TenderBidding.json";

const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
const deployContract = async (adminName) => {
  try {
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(TenderBiddingABI.abi);

    const deployedContract = await contract
      .deploy({
        data: TenderBiddingABI.bytecode,
        arguments: [adminName],
      })
      .send({
        from: accounts[0],
        gas: 1500000,
        gasPrice: "30000000000",
      });

    return deployedContract.options.address;
  } catch (error) {
    console.error("Error deploying contract:", error);
    throw error;
  }
};

export default deployContract;
