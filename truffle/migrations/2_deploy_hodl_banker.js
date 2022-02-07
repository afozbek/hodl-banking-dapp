var HodlBanker = artifacts.require("./HodlBanker.sol");

module.exports = function (deployer) {
  deployer.deploy(HodlBanker);
};
