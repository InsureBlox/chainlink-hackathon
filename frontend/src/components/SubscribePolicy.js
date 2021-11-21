import React from 'react';

import DelayInsuranceArtifact from "../contracts/InsuranceContract.json";
import contractAddress from "../contracts/contract-address.json";

import { createAlchemyWeb3 } from "@alch/alchemy-web3";

const web3 = createAlchemyWeb3(process.env.REACT_APP_ALCHEMY_URL_API_KEY);

export function SubscribePolicy() {
  return (
    <div className="container">
      <div className="row justify-content-md-center">
        <div className="col-12 text-center">
          <button
            className="btn btn-success"
            type="button"
            onClick={subscribePolicy}
          >
            Subscribe Policy (mocked values)
          </button>
        </div>
      </div>
    </div>
  );

  async function subscribePolicy() {
    window.contract = new web3.eth.Contract(DelayInsuranceArtifact.abi, contractAddress);

    //subscribePolicy(string _shipId, uint256 _shipmentValue, uint256 _startDate, uint256 _endDate, uint256 _startPort, uint256 _endPort

    const shipId = "shipid";

    const transactionParameters = {
        to: contractAddress,
        from: window.ethereum.selectedAddress,
        data: window.contract.methods
            .subscribePolicy(shipId, 1000, 2000, 3000, 4000, 5000)
            .encodeABI(),
    };

    try {
        const txHash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [transactionParameters],
        });
        alert("Check out your transaction on Etherscan: https://rinkeby.etherscan.io/tx/" + txHash);
    } catch (err) {
        alert("😥 Something went wrong: " + err.message);
    }
  }
}