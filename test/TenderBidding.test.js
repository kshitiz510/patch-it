const TenderBidding = artifacts.require("TenderBidding");

contract("TenderBidding", (accounts) => {
  let tenderBidding;
  const admin = accounts[0];
  const bidder1 = accounts[1];
  const bidder2 = accounts[2];

  before(async () => {
    tenderBidding = await TenderBidding.new("Admin");
  });

  it("should register a new bidder", async () => {
    await tenderBidding.registerBidder("Bidder1", { from: bidder1 });
    const name = await tenderBidding.bidderNames(bidder1);
    assert.equal(name, "Bidder1", "Bidder1 should be registered");
  });

  it("should create a new tender", async () => {
    await tenderBidding.createTender("40.7128N", "74.0060W", { from: admin });
    const tender = await tenderBidding.tenders("40.7128N_74.0060W");
    assert.equal(tender.uniqueKey, "40.7128N_74.0060W", "Tender should be created");
  });

  it("should place a bid", async () => {
    await tenderBidding.placeBid("40.7128N", "74.0060W", web3.utils.toWei('1', 'ether'), { from: bidder1 });
    const tender = await tenderBidding.tenders("40.7128N_74.0060W");
    assert.equal(tender.lowestBid, web3.utils.toWei('1', 'ether'), "Lowest bid should be 1 ether");
    assert.equal(tender.winner, bidder1, "Bidder1 should be the winner");
  });

  it("should close the tender", async () => {
    await tenderBidding.closeTender("40.7128N_74.0060W", { from: admin });
    const tender = await tenderBidding.tenders("40.7128N_74.0060W");
    assert.equal(tender.isClosed, true, "Tender should be closed");
  });

  it("should not allow placing a bid on a closed tender", async () => {
    try {
      await tenderBidding.placeBid("40.7128N", "74.0060W", web3.utils.toWei('0.5', 'ether'), { from: bidder2 });
      assert.fail("Bid should not be placed on a closed tender");
    } catch (error) {
      assert(error.message.includes("Tender is closed"), "Expected error message not found");
    }
  });
});