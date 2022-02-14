/* eslint-disable indent */
import { TransactionContext } from "context/TransactionContext";
import dayjs from "dayjs";
import { formatEther } from "ethers/lib/utils";
import React, { useContext, useEffect, useState } from "react";
import { formatToEther } from "utils/helpers";

const Admin = () => {
  const { userData, smartContractInstance, getOwner } = useContext(TransactionContext);

  const [loading, setLoading] = useState({
    userListLoading: false
  });
  const [userAddressList, setUserAddressList] = useState([]);
  const [userInfoList, setUserInfoList] = useState([]);

  useEffect(() => {
    if (userData.isContractOwner) {
      // Redirect user
      console.log({ userData });
      getUserAddressList();
    }
  }, [userData]);

  useEffect(() => {
    if (userAddressList?.length > 0) {
      getUserInfoList(userAddressList);
    }
  }, [userAddressList]);

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

  console.log({ userInfoList });

  return (
    <div>
      <ul className="user-info-list">
        {!loading.userListLoading && userInfoList.length > 1
          ? userInfoList.map(user => {
              console.log({ user });
              return (
                <li className="user-info" key={user.userAddress}>
                  <span className="address">{user.userAddress}</span> : {formatToEther(user.storedBalance)} ETH |
                  <strong>Expected Refund Date:</strong>{" "}
                  {dayjs(new Date(user.refundDate)).format("MMM DD YYYY - HH:mm")}
                </li>
              );
            })
          : null}
      </ul>
    </div>
  );
};

export default Admin;
