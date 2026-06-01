// Deployment script for TenderBidding contract
const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment...\n");

  // Get signer (account doing the deployment)
  const [deployer] = await ethers.getSigners();
  console.log(`📋 Deploying contracts with account: ${deployer.address}`);

  // Get contract factory
  const TenderBidding = await hre.ethers.getContractFactory("TenderBidding");

  // Deploy contract
  console.log("⏳ Deploying TenderBidding contract...");
  const tenderBidding = await TenderBidding.deploy();
  await tenderBidding.waitForDeployment();

  const address = await tenderBidding.getAddress();
  console.log(`✅ TenderBidding deployed to: ${address}\n`);

  // Save deployment info
  const deployment = {
    contract: "TenderBidding",
    address: address,
    deployer: deployer.address,
    network: hre.network.name,
    timestamp: new Date().toISOString(),
  };

  console.log("📝 Deployment Info:");
  console.log(JSON.stringify(deployment, null, 2));

  // Save to deployments file
  const fs = require("fs");
  const path = require("path");
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filename = path.join(deploymentsDir, `${hre.network.name}-deployment.json`);
  fs.writeFileSync(filename, JSON.stringify(deployment, null, 2));
  console.log(`\n💾 Deployment saved to: ${filename}`);

  return address;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
