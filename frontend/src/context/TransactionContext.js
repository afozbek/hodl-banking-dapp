import { createContext, useEffect, useMemo, useState } from "react";

import Web3 from "web3";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "config";
import { useMoralis } from "react-moralis";

const TransactionContext = createContext();

const TransactionContextProvider = props => {
  const [transactionList, setTransactionList] = useState([]);

  const [web3Instance, setWeb3Instance] = useState(null);
  const [smartContractInstance, setSmartContractInstance] = useState(null);
  const { user, authenticate, logout } = useMoralis();

  useEffect(() => {
    async function load() {
      const web3 = await getWeb3Instance();
      const contactList = await getContractInstance(web3);

      setWeb3Instance(web3);
      setSmartContractInstance(contactList);
    }

    load();
  }, []);

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
        logoutUser
      }}
    >
      {props.children}
    </TransactionContext.Provider>
  );
};

export { TransactionContextProvider, TransactionContext };
