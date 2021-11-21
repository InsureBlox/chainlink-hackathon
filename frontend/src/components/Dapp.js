import React from "react";

import { ethers } from "ethers";

import DelayInsuranceArtifact from "../contracts/InsuranceContract.json";
import contractAddress from "../contracts/contract-address.json";

import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { TransactionErrorMessage } from "./TransactionErrorMessage";

import "../index.css";

const HARDHAT_NETWORK_ID = "31337";

//const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      selectedAddress: undefined,
      transactionError: undefined,
      networkError: undefined,
      departurePort: "",
      departureDate: "",
      arrivalPort: "",
      arrivalDate: "",
      insuredSum: "",
      shipmentValue: "123",
    };

    this.state = this.initialState;
  }

  render() {
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet
          connectWallet={() => this._connectWallet()}
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    return (
      <div className="container p-4">
        <div className="row">
          <div className="col-12">
            <h1>Chainlink Hackathon</h1>
          </div>
        </div>

        <hr />

        <div className="form-group">
          <button
            type="button"
            className="btn btn-primary"
            onClick={this._subscribePolicy}
          >
            subscribePolicy
          </button>
        </div>

        <hr />

        <div className="form-group">
          <div className="form-row">
            <div className="col-sm-6">
              <label htmlFor="inputDeparturePort">Port of departure</label>
              <input
                type="text"
                className="form-control"
                id="inputDeparturePort"
                aria-describedby="departurePortHelp"
                placeholder="Port of departure"
                value={this.state.departurePort}
                onChange={(e) =>
                  this.setState({ departurePort: e.target.value })
                }
              />
              <small id="departurePortHelp" className="form-text text-muted">
                Help Text
              </small>
            </div>

            <div className="col-sm-6">
              <label htmlFor="inputDepartureDate">
                Expected departure date
              </label>
              <input
                type="date"
                max="2100-12-31"
                min="2021-01-01"
                className="form-control"
                id="inputDepartureDate"
                aria-describedby="departureHelp"
                placeholder="Expected departure date"
                value={this.state.departureDate}
                onChange={(e) =>
                  this.setState({ departureDate: e.target.value })
                }
              />
              <small id="departureHelp" className="form-text text-muted">
                Help Text
              </small>
            </div>
          </div>

          <div className="form-row">
            <div className="col-sm-6">
              <label htmlFor="inputArrivalPort">Port of arrival</label>
              <input
                type="text"
                className="form-control"
                id="inputArrivalPort"
                aria-describedby="arrivalPortHelp"
                placeholder="Port of arrival"
                value={this.state.arrivalPort}
                onChange={(e) => this.setState({ arrivalPort: e.target.value })}
              />
              <small id="arrivalPortHelp" className="form-text text-muted">
                Help Text
              </small>
            </div>

            <div className="col-sm-6">
              <label htmlFor="inputExpectedDeparture">
                Expected arrival date
              </label>
              <input
                type="date"
                max="2100-12-31"
                min="2021-01-01"
                className="form-control"
                id="inputExpectedDeparture"
                aria-describedby="arrivalHelp"
                placeholder="Expected arrival date"
                value={this.state.arrivalDate}
                onChange={(e) => this.setState({ arrivalDate: e.target.value })}
              />
              <small id="arrivalHelp" className="form-text text-muted">
                Help Text
              </small>
            </div>
          </div>

          <div className="form-row">
            <div className="col-sm-6">
              <label htmlFor="inputSumInsured">Sum insured</label>
              <input
                type="text"
                className="form-control"
                id="inputSumInsured"
                aria-describedby="sumInsuredHelp"
                placeholder="Sum insured"
                value={this.state.insuredSum}
                onChange={(e) => this.setState({ insuredSum: e.target.value })}
              />
              <small id="sumInsuredHelp" className="form-text text-muted">
                Help Text
              </small>
            </div>
            <div className="col-sm-6">
              <label htmlFor="inputShipmentValue">Shipment Value</label>
              <input
                type="text"
                className="form-control"
                id="inputShipmentValue"
                aria-describedby="shipmentValueHelp"
                placeholder="Sum insured"
                value={this.state.shipmentValue}
                onChange={(e) =>
                  this.setState({ shipmentValue: e.target.value })
                }
              />
              <small id="shipmentValueHelp" className="form-text text-muted">
                Help Text
              </small>
            </div>
          </div>
        </div>

        <div>State</div>
        <div className="word-break">{JSON.stringify(this.state)}</div>

        <div className="row">
          <div className="col-12">
            {this.state.transactionError && (
              <TransactionErrorMessage
                message={this._getRpcErrorMessage(this.state.transactionError)}
                dismiss={() => this._dismissTransactionError()}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  async _connectWallet() {
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.enable();

    if (!this._checkNetwork()) {
      return;
    }

    this._initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state
      if (newAddress === undefined) {
        return this._resetState();
      }

      this._initialize(newAddress);
    });

    // We reset the dapp state if the network is changed
    window.ethereum.on("networkChanged", ([networkId]) => {
      this._resetState();
    });
  }

  _initialize(userAddress) {
    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    });

    this._intializeEthers();
  }

  async _intializeEthers() {
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    this._delayInsurance = new ethers.Contract(
      contractAddress.Contract,
      DelayInsuranceArtifact.abi,
      this._provider.getSigner(0)
    );
  }

  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  _resetState() {
    this.setState(this.initialState);
  }

  _checkNetwork() {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      return true;
    }

    this.setState({
      networkError: "Please connect Metamask to Localhost:8545",
    });

    return false;
  }

  async _subscribePolicy() {
    // const [admin, customer] = await ethers.getSigners();
    let shipmentValue = 200000;
    let pricePremium = shipmentValue / 200;

    /* let DelayInsurance;
    let delayInsurance;

    DelayInsurance = await ethers.getContractFactory("DelayInsurance");
    delayInsurance = await DelayInsurance.deploy();
    await delayInsurance.deployed(); */

    // const customer = this._provider.getSigner(0);
    const customer = this._delayInsurance.signer;
    console.log(customer);

    // Trigger subscribePolicy method using mocked data
    /* let subscribePolicy = this._delayInsurance
      .connect(customer)
      .subscribePolicy(
        "shipId",
        shipmentValue,
        1637386377,
        1637559177,
        1000,
        2000,
        { from: customer.address, value: pricePremium }
      ); */
    let subscribePolicy = this._delayInsurance.subscribePolicy(
      "shipId",
      shipmentValue,
      1637386377,
      1637559177,
      1000,
      2000,
      { from: customer.address, value: pricePremium }
    );
    console.log(subscribePolicy);
  }
}
