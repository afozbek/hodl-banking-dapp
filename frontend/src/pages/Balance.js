import React, { useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import { CHAIN_TYPES } from "utils/enums";
import { formatToEther, getNativeTokenSymbolOfNetwork } from "utils/helpers";

const Balance = () => {
  const { user } = useMoralis();
  const { account } = useMoralisWeb3Api();
  //   const { fetch, data, error, isLoading } = useMoralisCloudFunction("getLastName", {
  //     firstname: 'Jake',
  // });

  const [loading, setLoading] = useState(false);

  const [userTokenBalances, setTokenBalances] = useState({
    nativeTokenBalance: "0",
    tokenBalances: []
  });

  useEffect(() => {
    const init = async () => {
      if (user) {
        setLoading(true);
        // get BSC native balance for a given address
        const options = { chain: CHAIN_TYPES.KOVAN_TESTNET };
        const { balance } = await account.getNativeBalance(options);

        const tokenBalances = await account.getTokenBalances(options);

        console.log({ tokenBalances });
        console.log({ userTokenBalances });

        setTokenBalances({
          // ...userTokenBalances,
          nativeTokenBalance: balance,
          tokenBalances: tokenBalances.filter(token => token.symbol && token.name)
        });
        setLoading(false);
      }
    };

    init();
  }, [user, account]);

  return (
    <div>
      <h4>In here you can see Kovan network balances</h4>
      <div className="balance-container">
        {loading ? (
          "Loading..."
        ) : (
          <>
            <h4>
              Native Token Balance: {formatToEther(userTokenBalances.nativeTokenBalance)}{" "}
              {getNativeTokenSymbolOfNetwork(CHAIN_TYPES.KOVAN_TESTNET)}
            </h4>

            <ul>
              {userTokenBalances.tokenBalances.map(token => {
                return (
                  <li key={token.name}>
                    {formatToEther(token.balance, token.decimals)} <strong>{token.symbol}</strong>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default Balance;
