var HodlBank = artifacts.require("./HodlBank.sol");

module.exports = function (deployer) {
  deployer.deploy(HodlBank);
};
