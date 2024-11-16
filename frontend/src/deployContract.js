import Web3 from "web3";
import TenderBiddingABI from "./TenderBidding.json"; // Ensure this path is correct

const web3 = new Web3(Web3.givenProvider || "http://localhost:8545"); // Use the appropriate provider

const deployContract = async (adminName, options = {}) => {
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
        gas: options.gas || 3000000, // Increase gas limit
        gasPrice: options.gasPrice || "30000000000",
      });

    // Update the contract instance with the deployed contract's address
    const contractAddress = deployedContract.options.address;
    const deployedContractInstance = new web3.eth.Contract(TenderBiddingABI.abi, contractAddress);

    // Register the deploying account as admin
    await deployedContractInstance.methods.createAdmin(adminName).send({
      from: accounts[0],
      gas: 300000, // Adjust gas limit as needed
      gasPrice: await web3.eth.getGasPrice(), // Use legacy gas price
    });

    return contractAddress;
  } catch (error) {
    console.error("Error deploying contract:", error);
    throw error;
  }
};

export default deployContract;