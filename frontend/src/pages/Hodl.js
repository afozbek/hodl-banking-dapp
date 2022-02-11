import { TransactionContext } from "context/TransactionContext";
import { ethers } from "ethers";
import useTransactionListener from "hooks/useTransactionListener";
import React, { useContext, useEffect, useState } from "react";
import ReactDatePicker from "react-datepicker";
import { useMoralis } from "react-moralis";
import { formatToEther } from "utils/helpers";

const Hodl = () => {
  const { smartContractInstance, account } = useContext(TransactionContext);

  const { user } = useMoralis();

  const [hoddleAmount, setHoddleAmount] = useState("0");
  const [hodlFormData, setHodlFormData] = useState({
    amountToHodl: "1",
    hodlUntilDate: new Date()
  });

  const getBalance = async () => {
    console.log({ smartContractInstance });
    const totalEthBalance = await smartContractInstance.methods.getStoredBalanceOfUser(account).call();
    console.log({ totalEthBalance });

    setHoddleAmount(formatToEther(totalEthBalance));
  };

  useEffect(() => {
    if (user && smartContractInstance) {
      getBalance();
    }
  }, [user, smartContractInstance]);

  const handleHodlEth = async e => {
    e.preventDefault();
    console.log({ hodlFormData });

    const timestamp = Math.floor(hodlFormData.hodlUntilDate.getTime() / 1000);

    const totalHodlAmountWei = ethers.utils.parseEther(String(hodlFormData.amountToHodl));

    const result = await smartContractInstance.methods
      .deposit(timestamp)
      .send({ from: account, value: totalHodlAmountWei });
    console.log({ result });
  };

  console.log({ date: hodlFormData.hodlUntilDate });

  return (
    <div className="hold-page">
      <h4>You hoddled this amount: {hoddleAmount} ETH</h4>

      <form className="hodl-form" onSubmit={handleHodlEth}>
        <div>
          <label htmlFor="amount">
            Eth Amount
            <div>
              <input
                type="text"
                name="amount"
                id="amount"
                onChange={e => setHodlFormData({ ...hodlFormData, amountToHodl: e.target.value })}
                value={hodlFormData.amountToHodl}
              />
            </div>
          </label>
        </div>

        <div>
          <label htmlFor="date">
            Hodl Until
            <ReactDatePicker
              selected={hodlFormData.hodlUntilDate}
              name="date"
              id="date"
              onChange={date => setHodlFormData({ ...hodlFormData, hodlUntilDate: date })}
              dateFormat="MMMM d, yyyy h:mm aa"
              showTimeInput
              timeFormat="HH:mm"
              showTimeSelect
            />
          </label>
        </div>

        <input type="submit" value="Hodl Now!" />
      </form>
    </div>
  );
};

export default Hodl;
