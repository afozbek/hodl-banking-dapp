import { createContext, useEffect, useState } from "react";

import Web3 from "web3";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "config";

const TransactionContext = createContext();

const TransactionContextProvider = props => {
  const [transactionList, setTransactionList] = useState([]);

  const [web3Instance, setWeb3Instance] = useState(null);
  const [smartContractInstance, setSmartContractInstance] = useState(null);
  const [account, setAccount] = useState();

  useEffect(() => {
    async function load() {
      const web3 = await getWeb3Instance();
      const accounts = await getAccounts(web3);
      const contactList = await getContractInstance(web3);

      setWeb3Instance(web3);
      setSmartContractInstance(contactList);
      setAccount(accounts[0]);
    }

    load();
  }, []);

  const getWeb3Instance = async () => {
    const localGanacheRPCUrl = "http://localhost:7545";
    return new Web3(Web3.givenProvider || localGanacheRPCUrl);
  };

  const getAccounts = async web3 => {
    return await web3.eth.requestAccounts();
  };

  // Returns contactSmartContractInstance
  const getContractInstance = async web3 => {
    // Instantiate smart contract using ABI and address.
    return new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactionList,
        web3Instance,
        smartContractInstance,
        account,
        getContractInstance,
        setTransactionList
      }}
    >
      {props.children}
    </TransactionContext.Provider>
  );
};

export { TransactionContextProvider, TransactionContext };
