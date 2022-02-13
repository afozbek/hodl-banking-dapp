import { TransactionContext } from "context/TransactionContext";
import { parseEther } from "ethers/lib/utils";
import React, { useContext, useEffect, useState } from "react";
import { formatToEther } from "utils/helpers";

const Withdraw = () => {
  const [isUserAllowedToWithdraw, setIsUserAllowedToWithdraw] = useState(false);
  const [maxStoredTokens, setMaxStoredTokens] = useState("0");
  const [formData, setFormData] = useState({
    amount: "0"
  });

  const { smartContractInstance, account, getStoredBalanceOfUser } = useContext(TransactionContext);

  useEffect(() => {
    const init = async () => {
      if (smartContractInstance) {
        const hasUserWithdrawTokens = await canUserWithdrawTokens();

        if (hasUserWithdrawTokens) {
          const totalStoredAmount = await getStoredBalanceOfUser(smartContractInstance);

          console.log({ totalStoredAmount });

          setMaxStoredTokens(formatToEther(totalStoredAmount));
        }

        setIsUserAllowedToWithdraw(hasUserWithdrawTokens);
      }
    };

    init();
  }, [smartContractInstance]);

  const canUserWithdrawTokens = async () => {
    const timestamp = await smartContractInstance.methods.refundTimeOfUser(account).call();
    console.log({ timestamp });

    const canWithdraw = new Date().getTime() > timestamp * 1000;

    return canWithdraw;
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

    setMaxStoredTokens(prev => prev - formData.amount);
    e.target.reset();
  };

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
      ) : (
        <div>
          <h4>Wait some amount of time</h4>
        </div>
      )}
    </div>
  );
};

export default Withdraw;
