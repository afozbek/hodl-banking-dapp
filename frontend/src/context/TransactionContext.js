import { createContext, useEffect, useState } from "react";

import Web3 from "web3";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "config";
import { useMoralis } from "react-moralis";
import { checkUserInCorrectChain } from "utils/helpers";
import { CHAIN_TYPES } from "utils/enums";
import { toast } from "react-toastify";

const TransactionContext = createContext();

const TransactionContextProvider = props => {
  const [transactionList, setTransactionList] = useState([]);
  const [userData, setUserData] = useState({
    account: "",
    isContractOwner: false
  });

  const [web3Instance, setWeb3Instance] = useState(null);
  const [smartContractInstance, setSmartContractInstance] = useState(null);
  const { user, authenticate, logout } = useMoralis();

  useEffect(() => {
    async function load() {
      const web3 = await getWeb3Instance();
      const contactList = await getContractInstance(web3);

      setWeb3Instance(web3);
      setSmartContractInstance(contactList);

      const networkId = await web3.eth.net.getId();
      const networkname = getNetworkName(networkId);

      const result = checkUserInCorrectChain(CHAIN_TYPES.GANACHE_TESTNET);
      console.log({ result });
      console.log({ networkId });
      console.log({ networkname });

      if (!result) {
        toast.error(`
          You are in: ${networkname}. You need to connect Ganache Local Network.
        `);
      }
    }

    load();
  }, []);

  function getNetworkName(chainID) {
    const networks = {
      1: "Ethereum Mainnet",
      4: "Ethereum Rinkeby",
      42: "Kovan Testnet",
      97: "Binance Smart Chain Testnet",
      5777: "Ganache Local Network",
      80001: "Polygon Mumbai Testnet"
    };
    return networks[chainID];
  }

  useEffect(() => {
    const initUser = async () => {
      const account = user.get("ethAddress");
      const isContractOwner = await hasUserAccountOwner(account);

      setUserData({
        account,
        isContractOwner
      });
    };
    if (user && smartContractInstance) {
      initUser();
    } else {
      setUserData({
        account: "",
        isContractOwner: false
      });
    }
  }, [user, smartContractInstance]);

  const getWeb3Instance = async () => {
    const localGanacheRPCUrl = "http://localhost:7545";
    return new Web3(Web3.givenProvider || localGanacheRPCUrl);
  };

  // Returns contactSmartContractInstance
  const getContractInstance = async web3 => {
    // Instantiate smart contract using ABI and address.
    return new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
  };

  const getStoredBalance = async () => {
    if (!userData.account) {
      return "0";
    }

    return (await smartContractInstance.methods.getStoredBalance()).call({ from: userData.account });
  };

  const getStoredBalanceOfUser = async account => {
    if (!userData.account) {
      return Number.NaN;
    }

    if (!userData.isContractOwner) {
      throw new Error("Not a contract owner");
    }

    return (await smartContractInstance.methods.getStoredBalance(account)).call({ from: userData.account });
  };

  const getOwner = async () => {
    return await smartContractInstance.methods.owner().call();
  };

  const connectWallet = async () => {
    // For some reason user returns as undefined
    await authenticate({ signingMessage: "Connect Account with Moralis" });
  };

  const hasUserAccountOwner = async account => {
    return (await smartContractInstance.methods.hasUserAccountOwner(account)).call();
  };

  const logoutUser = async () => {
    // For some reason user returns as undefined
    await logout();
  };

  console.log({ userData });

  return (
    <TransactionContext.Provider
      value={{
        transactionList,
        web3Instance,
        smartContractInstance,
        account: userData.account,
        userData,
        getOwner,
        getContractInstance,
        setTransactionList,
        connectWallet,
        logoutUser,
        getStoredBalance,
        getStoredBalanceOfUser
      }}
    >
      {props.children}
    </TransactionContext.Provider>
  );
};

export { TransactionContextProvider, TransactionContext };
