const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TenderBidding Contract", function () {
  let tenderBidding;
  let owner, bidder1, bidder2, bidder3;

  beforeEach(async function () {
    // Get signers
    [owner, bidder1, bidder2, bidder3] = await ethers.getSigners();

    // Deploy contract
    const TenderBidding = await ethers.getContractFactory("TenderBidding");
    tenderBidding = await TenderBidding.deploy();
    await tenderBidding.waitForDeployment();

    // Owner creates admin role
    await tenderBidding.createAdmin("Admin Owner");
  });

  describe("Admin Management", function () {
    it("should allow creating admin", async function () {
      const adminName = await tenderBidding.bidderNames(owner.address);
      expect(adminName).to.equal("Admin Owner");
    });

    it("should prevent duplicate admin", async function () {
      await expect(tenderBidding.createAdmin("Another Admin")).to.be.revertedWith(
        "Admin already exists",
      );
    });
  });

  describe("Bidder Registration", function () {
    it("should register new bidder", async function () {
      await tenderBidding.connect(bidder1).registerBidder("Bidder One");
      const name = await tenderBidding.bidderNames(bidder1.address);
      expect(name).to.equal("Bidder One");
    });

    it("should prevent duplicate bidder registration", async function () {
      await tenderBidding.connect(bidder1).registerBidder("Bidder One");
      await expect(
        tenderBidding.connect(bidder1).registerBidder("Another Name"),
      ).to.be.revertedWith("Bidder already registered");
    });
  });

  describe("Tender Management", function () {
    beforeEach(async function () {
      // Register bidders
      await tenderBidding.connect(bidder1).registerBidder("Bidder One");
      await tenderBidding.connect(bidder2).registerBidder("Bidder Two");
      await tenderBidding.connect(bidder3).registerBidder("Bidder Three");
    });

    it("should create tender (admin only)", async function () {
      await tenderBidding.createTender("28.6139N", "77.2090E", ethers.parseEther("1.0"));

      const tender = await tenderBidding.tenders("28.6139N_77.2090E");
      expect(tender.uniqueKey).to.equal("28.6139N_77.2090E");
      expect(tender.baseAmount).to.equal(ethers.parseEther("1.0"));
      expect(tender.isClosed).to.be.false;
    });

    it("should prevent non-admin from creating tender", async function () {
      await expect(
        tenderBidding
          .connect(bidder1)
          .createTender("28.6139N", "77.2090E", ethers.parseEther("1.0")),
      ).to.be.revertedWith("You are not the admin");
    });

    it("should prevent duplicate tender", async function () {
      await tenderBidding.createTender("28.6139N", "77.2090E", ethers.parseEther("1.0"));

      await expect(
        tenderBidding.createTender("28.6139N", "77.2090E", ethers.parseEther("2.0")),
      ).to.be.revertedWith("Tender already exists");
    });
  });

  describe("Bidding Process", function () {
    beforeEach(async function () {
      // Setup: register bidders and create tender
      await tenderBidding.connect(bidder1).registerBidder("Bidder One");
      await tenderBidding.connect(bidder2).registerBidder("Bidder Two");
      await tenderBidding.connect(bidder3).registerBidder("Bidder Three");

      await tenderBidding.createTender("28.6139N", "77.2090E", ethers.parseEther("1.0"));
    });

    it("should place valid bid", async function () {
      const bidAmount = ethers.parseEther("0.9");
      await tenderBidding.connect(bidder1).placeBid("28.6139N_77.2090E", bidAmount);

      const tender = await tenderBidding.tenders("28.6139N_77.2090E");
      expect(tender.lowestBid).to.equal(bidAmount);
      expect(tender.winner).to.equal(bidder1.address);
    });

    it("should prevent unregistered bidder from bidding", async function () {
      const unrelatedSigner = (await ethers.getSigners())[4];

      await expect(
        tenderBidding
          .connect(unrelatedSigner)
          .placeBid("28.6139N_77.2090E", ethers.parseEther("0.9")),
      ).to.be.revertedWith("You must be a registered bidder");
    });

    it("should prevent bid exceeding 110% of base amount", async function () {
      const excessiveBid = ethers.parseEther("1.15"); // 115% of 1.0

      await expect(
        tenderBidding.connect(bidder1).placeBid("28.6139N_77.2090E", excessiveBid),
      ).to.be.revertedWith("Bid exceeds 110% of base amount");
    });

    it("should track lowest bid and winner", async function () {
      await tenderBidding.connect(bidder1).placeBid("28.6139N_77.2090E", ethers.parseEther("0.95"));
      await tenderBidding.connect(bidder2).placeBid("28.6139N_77.2090E", ethers.parseEther("0.85"));

      const tender = await tenderBidding.tenders("28.6139N_77.2090E");
      expect(tender.lowestBid).to.equal(ethers.parseEther("0.85"));
      expect(tender.winner).to.equal(bidder2.address);
    });
  });

  describe("Tender Closure", function () {
    beforeEach(async function () {
      await tenderBidding.connect(bidder1).registerBidder("Bidder One");
      await tenderBidding.createTender("28.6139N", "77.2090E", ethers.parseEther("1.0"));
      await tenderBidding.connect(bidder1).placeBid("28.6139N_77.2090E", ethers.parseEther("0.9"));
    });

    it("should close tender (admin only)", async function () {
      await tenderBidding.closeTender("28.6139N_77.2090E");

      const tender = await tenderBidding.tenders("28.6139N_77.2090E");
      expect(tender.isClosed).to.be.true;
    });

    it("should prevent non-admin from closing", async function () {
      await expect(
        tenderBidding.connect(bidder1).closeTender("28.6139N_77.2090E"),
      ).to.be.revertedWith("You are not the admin");
    });

    it("should prevent bidding on closed tender", async function () {
      await tenderBidding.closeTender("28.6139N_77.2090E");

      await expect(
        tenderBidding.connect(bidder1).placeBid("28.6139N_77.2090E", ethers.parseEther("0.8")),
      ).to.be.revertedWith("Tender is closed");
    });
  });

  describe("Tender Queries", function () {
    it("should retrieve all tenders", async function () {
      await tenderBidding.createTender("28.6139N", "77.2090E", ethers.parseEther("1.0"));
      await tenderBidding.createTender("40.7128N", "74.0060W", ethers.parseEther("2.0"));

      const tenders = await tenderBidding.getAllTenders();
      expect(tenders).to.have.lengthOf(2);
    });

    it("should get tender by key", async function () {
      await tenderBidding.createTender("28.6139N", "77.2090E", ethers.parseEther("1.0"));

      const tender = await tenderBidding.getTender("28.6139N_77.2090E");
      expect(tender.uniqueKey).to.equal("28.6139N_77.2090E");
      expect(tender.baseAmount).to.equal(ethers.parseEther("1.0"));
    });
  });
});
