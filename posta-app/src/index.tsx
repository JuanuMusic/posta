import React from "react";
import ReactDOM from "react-dom";
//import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

// Importing the Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.scss";
import "./App.scss";
import App from "./App";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { BrowserRouter as Router } from "react-router-dom";
import HumanProvider from "./contextProviders/HumanProvider";
import PostaContext from "./contextProviders/PostaContext";

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <PostaContext>
        <HumanProvider>
          <Router>
            <div className="text-light mb-5">
              <App />
            </div>
            {/* <div className="p-5 d-flex justify-content-end" style={{ position: "fixed", width: "100%", bottom: 0 }}>
              
              <Toast>
                <Toast.Header>
                  <img
                    src="holder.js/20x20?text=%20"
                    className="rounded me-2"
                    alt=""
                  />
                  <strong className="me-auto">Bootstrap</strong>
                  <small>11 mins ago</small>
                </Toast.Header>
                <Toast.Body>Hello, world! This is a toast message.</Toast.Body>
              </Toast>
            </div> */}
          </Router>
        </HumanProvider>
      </PostaContext>
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
//serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
