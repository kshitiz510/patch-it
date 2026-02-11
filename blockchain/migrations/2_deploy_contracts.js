const TenderBidding = artifacts.require("TenderBidding");

module.exports = function (deployer) {
  deployer.deploy(TenderBidding);
};