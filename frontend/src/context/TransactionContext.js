import { createContext, useEffect, useMemo, useState } from "react";

import Web3 from "web3";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "config";
import { useMoralis } from "react-moralis";

const TransactionContext = createContext();

const TransactionContextProvider = props => {
  const [transactionList, setTransactionList] = useState([]);

  const [web3Instance, setWeb3Instance] = useState(null);
  const [smartContractInstance, setSmartContractInstance] = useState(null);
  const [networkName, setNetworkName] = useState(null);
  const { user, authenticate, logout } = useMoralis();

  useEffect(() => {
    async function load() {
      const web3 = await getWeb3Instance();
      const contactList = await getContractInstance(web3);

      setWeb3Instance(web3);
      setSmartContractInstance(contactList);

      const networkId = await web3.eth.net.getId();
      const networkname = getNetworkName(networkId);
      console.log({ networkId });
      console.log({ networkname });
    }

    load();
  }, []);

  function getNetworkName(chainID) {
    const networks = {
      1: "Ethereum Mainnet",
      4: "Ethereum Rinkeby",
      97: "Binance Smart Chain Testnet",
      5777: "Ganache Local Network",
      80001: "Polygon Mumbai Testnet"
    };
    return networks[chainID];
  }

  const account = useMemo(() => {
    if (user) {
      return user.get("ethAddress");
    }
  }, [user]);

  const getWeb3Instance = async () => {
    const localGanacheRPCUrl = "http://localhost:7545";
    return new Web3(Web3.givenProvider || localGanacheRPCUrl);
  };

  // Returns contactSmartContractInstance
  const getContractInstance = async web3 => {
    // Instantiate smart contract using ABI and address.
    return new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
  };

  const getStoredBalanceOfUser = async smartContractInstance => {
    if (!account) {
      return Number.NaN;
    }

    return (await smartContractInstance.methods.getStoredBalance()).call({ from: account });
  };

  const connectWallet = async () => {
    // For some reason user returns as undefined
    const user = await authenticate({ signingMessage: "Connect Account with Moralis" });
  };

  const logoutUser = async () => {
    // For some reason user returns as undefined
    await logout();
  };

  return (
    <TransactionContext.Provider
      value={{
        transactionList,
        web3Instance,
        smartContractInstance,
        account,
        getContractInstance,
        setTransactionList,
        connectWallet,
        logoutUser,
        getStoredBalanceOfUser
      }}
    >
      {props.children}
    </TransactionContext.Provider>
  );
};

export { TransactionContextProvider, TransactionContext };
