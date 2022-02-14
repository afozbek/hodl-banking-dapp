import { TransactionContext } from "context/TransactionContext";
import { useState, useContext } from "react";
import { toast } from "react-toastify";
import { TRANSACTION_STATUS_TYPES } from "utils/enums";
import useInterval from "./useInterval";

const useTransactionListener = () => {
  const [lastFinishedTransaction, setLastFinishedTransaction] = useState(null);
  const { transactionList, setTransactionList, web3Instance: web3 } = useContext(TransactionContext);

  const shouldLookForTransactionStatus = transactionList && transactionList.length > 0;

  useInterval(
    () => {
      console.log("Looking..", transactionList);
      if (transactionList && transactionList.length) {
        transactionList.forEach(transaction => {
          lookForTransactionStatus(transaction);
        });
      }
    },
    shouldLookForTransactionStatus > 0 ? 5000 : null
  );
  /**
   *
   * @param {string} txHash Hash of transaction
   * @param {TRANSACTION_STATUS_TYPES} transactionStatus
   */
  const updateTransactionStatus = (txHash, transactionStatus) => {
    console.log({ txHash });
    console.log({ transactionStatus });

    if (transactionStatus == TRANSACTION_STATUS_TYPES.COMPLETED) {
      return transactionList.filter(tx => tx.hash != txHash);
    }

    return transactionList;
  };

  const lookForTransactionStatus = async transaction => {
    try {
      const { COMPLETED, FAILED, PENDING } = TRANSACTION_STATUS_TYPES;

      const result = await web3.eth.getTransactionReceipt(transaction.hash);

      let currentTransactionStatus = PENDING;
      // PENDING -> The receipt is not available
      if (result == null) {
        // Transaction has not completed yet
        currentTransactionStatus = PENDING;
      }
      // FAILED -> EVM reverted the transaction.
      else if (result.status == false) {
        currentTransactionStatus = FAILED;

        console.log("EVM reverted transaction");
      }
      // SUCCESS -> Transaction was successfull
      else if (result.status == true) {
        // Transaction succesfully completed
        currentTransactionStatus = COMPLETED;

        console.log("TRANSACTION SUCCESSFULL");
      } else {
        currentTransactionStatus = FAILED;
        console.error("There is something wrong about your logic");
      }

      const txList = await updateTransactionStatus(transaction.hash, currentTransactionStatus);
      setTransactionList(txList);

      // Call Callback Function
      if (result && result.status == true) {
        // What do you want to do when transaction successfull

        toast("Tx: " + transaction.hash + " successfully completed");
        setLastFinishedTransaction(transaction);
      }
    } catch (err) {
      console.log("Look Transaction Status Err: ", err);
    }
  };

  return {
    lastFinishedTransaction
  };
};

export default useTransactionListener;
