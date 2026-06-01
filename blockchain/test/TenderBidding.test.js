const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TenderBidding", function () {
  let contract;
  let admin;
  let contractor;
  let outsider;

  beforeEach(async function () {
    [admin, contractor, outsider] = await ethers.getSigners();
    const TenderBidding = await ethers.getContractFactory("TenderBidding");
    contract = await TenderBidding.deploy();
    await contract.waitForDeployment();
  });

  it("creates a funded project and emits ProjectCreated", async function () {
    await expect(
      contract.createProject("report-1", "28.6_77.2", 50000, {
        value: 60000,
      }),
    ).to.emit(contract, "ProjectCreated");

    const key = ethers.keccak256(ethers.toUtf8Bytes("report-1"));
    const project = await contract.getProject(key);
    expect(project.reportId).to.equal("report-1");
    expect(project.estimatedCost).to.equal(50000);
    expect(project.status).to.equal(1);
  });

  it("requires contractor registration before bidding", async function () {
    await contract.createProject("report-1", "28.6_77.2", 50000);
    const key = ethers.keccak256(ethers.toUtf8Bytes("report-1"));

    await expect(contract.connect(contractor).submitBid(key, 48000, 92, "bid://1")).to.be.revertedWith(
      "Only contractor",
    );

    await contract.connect(contractor).registerContractor();
    await expect(contract.connect(contractor).submitBid(key, 48000, 92, "bid://1")).to.emit(
      contract,
      "BidPlaced",
    );
  });

  it("selects winner and enforces work lifecycle", async function () {
    await contract.createProject("report-1", "28.6_77.2", 50000, { value: 60000 });
    const key = ethers.keccak256(ethers.toUtf8Bytes("report-1"));
    await contract.connect(contractor).registerContractor();
    await contract.connect(contractor).submitBid(key, 48000, 92, "bid://1");

    await expect(contract.selectWinner(key, contractor.address)).to.emit(contract, "WinnerSelected");
    await expect(contract.connect(outsider).markWorkStarted(key)).to.be.revertedWith("Only winner");
    await expect(contract.connect(contractor).markWorkStarted(key)).to.emit(contract, "WorkStarted");
    await expect(contract.connect(contractor).markCompleted(key)).to.emit(contract, "WorkCompleted");
    await expect(contract.verifyCompletion(key)).to.emit(contract, "CompletionVerified");
  });

  it("releases escrow after admin verification", async function () {
    await contract.createProject("report-1", "28.6_77.2", 50000, { value: 60000 });
    const key = ethers.keccak256(ethers.toUtf8Bytes("report-1"));
    await contract.connect(contractor).registerContractor();
    await contract.connect(contractor).submitBid(key, 48000, 92, "bid://1");
    await contract.selectWinner(key, contractor.address);
    await contract.connect(contractor).markWorkStarted(key);
    await contract.connect(contractor).markCompleted(key);
    await contract.verifyCompletion(key);

    await expect(contract.releaseFunds(key)).to.changeEtherBalances(
      [contract, contractor],
      [-48000, 48000],
    );

    const project = await contract.getProject(key);
    expect(project.status).to.equal(6);
  });
});
