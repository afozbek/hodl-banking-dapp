import AppContext from "context/AppContext";
import { TransactionContext } from "context/TransactionContext";
import { useContext, useEffect } from "react";
import Modal from "react-modal/lib/components/Modal";
import { Outlet } from "react-router";
import { Link } from "react-router-dom";
import { useMoralis } from "react-moralis";

var App = () => {
  const { web3Instance, smartContractInstance, account, userData, getContractInstance, connectWallet, logoutUser } =
    useContext(TransactionContext);

  // const [moralisUser, setMoralisUser] = useState(null);
  const { user: moralisUser } = useMoralis();

  useEffect(() => {
    Modal.setAppElement("body");

    // const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;
    // const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;

    // Moralis.start({ serverUrl, appId });

    const init = async () => {
      // if (!isAuthenticated) {
      //   await authenticate({ signingMessage: "Moralis Auth by Furkan Ozbek" });
      // }
    };

    init();

    // loginMoralisUser()
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {};

    if (moralisUser) {
      fetchTransactions();
    }
  }, [moralisUser]);

  return (
    <div className="app-container">
      <div className="account">
        {account ? (
          <div className="connected">
            <div className="text">{account}</div>
            <button className="logout-btn" onClick={logoutUser}>
              Logout
            </button>
          </div>
        ) : (
          <button className="connect-btn" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
      <AppContext.Provider
        value={{
          account,
          smartContractInstance,
          web3Instance,
          getContractInstance
        }}
      >
        <nav style={{ borderBottom: "solid 1px", paddingBottom: "1rem", cursor: "pointer" }}>
          <Link to="/balance">Balance</Link> {" - "}
          <Link to="/hodl">HODL</Link> {" - "}
          <Link to="/withdraw">Withdraw</Link> {" - "}
          {userData.isContractOwner ? <Link to="/admin">Admin</Link> : null}
        </nav>

        <Outlet />
      </AppContext.Provider>
    </div>
  );
};

export default App;
