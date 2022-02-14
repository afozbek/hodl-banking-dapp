import { TransactionContext } from "context/TransactionContext";
import React, { useContext, useEffect } from "react";

const Admin = () => {
  const { userData } = useContext(TransactionContext);

  useEffect(() => {
    if (!userData.isContractOwner) {
      // Redirect user
    }
  }, [userData]);

  return <div>Admin</div>;
};

export default Admin;
