/* eslint-disable no-undef */
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import dotenv from "dotenv";
import { MoralisProvider } from "react-moralis";

import "scss/main.scss";
import { TransactionContextProvider } from "context/TransactionContext";
import Hodl from "pages/Hodl";
import Withdraw from "pages/Withdraw";
import Admin from "pages/Admin";
import Balance from "pages/Balance";

dotenv.config();

const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;
const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;

ReactDOM.render(
  <React.StrictMode>
    <MoralisProvider appId={appId} serverUrl={serverUrl}>
      <ToastContainer />
      <BrowserRouter>
        <TransactionContextProvider>
          <Routes>
            <Route path="/" element={<App />}>
              <Route path="hodl" element={<Hodl />}></Route>
              <Route path="balance" element={<Balance />}></Route>
              <Route path="withdraw" element={<Withdraw />}></Route>
              <Route path="admin" element={<Admin />}></Route>

              <Route
                path="*"
                element={
                  <main>
                    <p> nothing here!</p>
                  </main>
                }
              />
            </Route>
          </Routes>
        </TransactionContextProvider>
      </BrowserRouter>
    </MoralisProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
