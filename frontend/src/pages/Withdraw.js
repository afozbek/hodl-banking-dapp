import { TransactionContext } from "context/TransactionContext";
import { parseEther } from "ethers/lib/utils";
import useTransactionListener from "hooks/useTransactionListener";
import React, { useContext, useEffect, useState } from "react";
import { TRANSACTION_NAMES } from "utils/enums";
import { formatToEther } from "utils/helpers";

const Withdraw = () => {
  const [isUserAllowedToWithdraw, setIsUserAllowedToWithdraw] = useState(false);
  const [maxStoredTokens, setMaxStoredTokens] = useState("0");
  const [formData, setFormData] = useState({
    amount: "0"
  });

  const { smartContractInstance, account, getStoredBalance, transactionList, setTransactionList } =
    useContext(TransactionContext);
  const { lastFinishedTransaction } = useTransactionListener();

  useEffect(() => {
    init();
  }, [smartContractInstance]);

  useEffect(() => {
    if (lastFinishedTransaction) {
      init();
    }
  }, [lastFinishedTransaction]);

  const init = async () => {
    if (smartContractInstance) {
      const hasUserWithdrawTokens = await canUserWithdrawTokens();
      const totalStoredAmount = await getStoredBalance();
      console.log({ totalStoredAmount });

      const storedEther = formatToEther(totalStoredAmount);

      setMaxStoredTokens(storedEther);
      setIsUserAllowedToWithdraw(hasUserWithdrawTokens && Number(storedEther) > 0);
    }
  };

  const canUserWithdrawTokens = async () => {
    const timestamp = await smartContractInstance.methods.refundTimeOfUser(account).call();
    console.log({ timestamp });

    return new Date().getTime() > timestamp * 1000;
  };

  const handleWithdraw = async e => {
    e.preventDefault();

    if (!isUserAllowedToWithdraw) {
      throw new Error("Not allowed");
    }

    console.log("Allowed");

    const tx = await smartContractInstance.methods
      .withdraw(parseEther(String(formData.amount)))
      .send({ from: account });

    const remainingBalance = maxStoredTokens - formData.amount;
    setTransactionList([...transactionList, { ...tx, hash: tx.transactionHash, name: TRANSACTION_NAMES.WITHDRAW }]);
    setMaxStoredTokens(remainingBalance);
    setIsUserAllowedToWithdraw(remainingBalance > 0);

    e.target.reset();
  };

  console.log({ lastFinishedTransaction });
  console.log({ isUserAllowedToWithdraw });
  console.log({ maxStoredTokens });

  return (
    <div>
      {isUserAllowedToWithdraw ? (
        <>
          <h4>Amount Can be withdrawn: {maxStoredTokens}</h4>
          <form className="hodl-form" onSubmit={handleWithdraw}>
            <div>
              <label htmlFor="amount">
                Eth Amount
                <div>
                  <input
                    type="text"
                    name="amount"
                    id="amount"
                    onChange={e =>
                      setFormData({
                        ...formData,
                        amount: maxStoredTokens > e.target.value ? e.target.value : maxStoredTokens
                      })
                    }
                    value={formData.amount}
                  />
                </div>
              </label>
            </div>

            <input type="submit" value="Withdraw" disabled={!isUserAllowedToWithdraw} />
          </form>
        </>
      ) : maxStoredTokens <= 0 ? (
        <>
          <h4>You dont have balance in the smart contract</h4>
        </>
      ) : (
        <>
          <h4>You need to wait certain time</h4>
        </>
      )}
    </div>
  );
};

export default Withdraw;
