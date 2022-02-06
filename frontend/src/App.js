import AppContext from "context/AppContext";
import { TransactionContext } from "context/TransactionContext";
import { useContext, useEffect } from "react";
import Modal from "react-modal/lib/components/Modal";
import { Outlet } from "react-router";
import { Link } from "react-router-dom";
import { useMoralis } from "react-moralis";

var App = () => {
  const { web3Instance, smartContractInstance, account, getContractInstance } = useContext(TransactionContext);

  // const [moralisUser, setMoralisUser] = useState(null);
  const { authenticate, isAuthenticated, user: moralisUser } = useMoralis();

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
      {/* <h1>Welcome {user.get("username")}</h1> */}
      <div className="account">
        <strong>{account}</strong>
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
          <Link to="/">Home</Link> {" - "}
          <Link to="/hodl">HODL Money</Link> {" - "}
        </nav>

        <Outlet />
      </AppContext.Provider>
    </div>
  );
};

export default App;
