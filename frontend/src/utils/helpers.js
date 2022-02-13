/* eslint-disable indent */
import { ethers } from "moralis/node_modules/ethers";
import { CHAIN_TYPES } from "./enums";

/**
 *
 * @param {string} balance Token Balance
 * @param {number | string} decimals Token Decimals
 */
export const formatToEther = (balance, decimals = 18) => {
  if (typeof balance != "string") {
    throw new Error("Types are not correct");
  }

  let etherFormat = ethers.utils.formatEther(balance);
  if (decimals != 18) {
    etherFormat = ethers.utils.formatUnits(balance, decimals);
  }
  console.log({ etherFormat });

  let formattedBalance = Number(etherFormat).toFixed(4);

  // Remove most 0 values
  return Number(formattedBalance);
};

export const getNativeTokenSymbolOfNetwork = chainType => {
  switch (chainType) {
    case CHAIN_TYPES.ETHEREUM_MAINNET:
    case CHAIN_TYPES.KOVAN_TESTNET:
      return "ETH";
    case CHAIN_TYPES.BSC_MAINNET:
      return "BNB";
    default:
      throw new Error("This chain is not supported");
  }
};
