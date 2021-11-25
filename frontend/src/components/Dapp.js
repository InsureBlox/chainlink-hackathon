import React from "react";
import axios from "axios";

import { ethers } from "ethers";

import DelayInsuranceArtifact from "../contracts/InsuranceContract.json";
import contractAddress from "../contracts/contract-address.json";

import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { TransactionErrorMessage } from "./TransactionErrorMessage";

import "../index.css";

import port_malaga from "../api/port_malaga.json";
import vessels from "../api/vessels.json";

const HARDHAT_NETWORK_ID = "31337";
const KOVAN_NETWORK_ID = "42";

const ERROR_CODE_TX_REJECTED_BY_USER = 4001;
let insuranceContract;

export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      selectedAddress: undefined,
      transactionError: undefined,
      networkError: undefined,
      shipObject: undefined,
      shipName: "",
      shipId: "",
      shipmentValue: "",
      departurePortObject: undefined,
      departurePort: "",
      departureDate: "",
      arrivalPort: "",
      arrivalDate: "",
      policyId: "",
      policyStatus: "",
    };

    this.state = this.initialState;
  }

  componentDidMount() {
    /* const headers = {
      "Content-Type": "application/json", // "application/x-www-form-urlencoded", // "text/plain",
      "Access-Control-Allow-Origin": "*",
    };

    axios({
      method: "get",
      url: `https://api.datalastic.com/api/v0/vessel_inradius?api-key=XXX&lat=29.15915&lon=-89.25454&radius=10`,
      withCredentials: false,
      headers,
    })
      .then(function (response) {
        // handle success
        console.log(response);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      }); */
    /* axios
      .get(
        "https://api.datalastic.com/api/v0/vessel_inradius?api-key=XXX&lat=29.15915&lon=-89.25454&radius=10",
        { headers }
      )
      .then(function (response) {
        // handle success
        console.log(response);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      }); */
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
            <h1>Ocean Storm by InsureBlox</h1>
          </div>
        </div>

        <hr />

        <div className="form-group">
          <button
            type="button"
            className="btn btn-primary"
            onClick={(event) => this._subscribePolicy(event)}
          >
            subscribePolicy
          </button>
        </div>

        <hr />

        <div className="form-group">
          <div className="form-row">
            <div className="col-sm-6">
              <label htmlFor="inputShipName">Ship Name</label>
              <div style={{ display: "flex" }}>
                <input
                  type="text"
                  className="form-control"
                  id="inputShipName"
                  aria-describedby="shipNameHelp"
                  placeholder="Ship Name"
                  value={this.state.shipName}
                  onChange={(e) => !this.state.shipObject ? this.setState({ shipName: e.target.value }) : null}
                />
                <button
                  className={`btn ${
                    this.state.shipObject ? "btn-primary" : "btn-secondary"
                  }`}
                  disabled={!this.state.shipObject}
                  onClick={() =>
                    this.setState({
                      shipName: "",
                      shipObject: undefined,
                    })
                  }
                >
                  x
                </button>
              </div>

              <small id="shipNameHelp" className="form-text text-muted">
                Search for a vessel and select it
              </small>
              <div>
                {vessels.data.vessels
                  .filter((vessel) => {
                    return (
                      vessel.name.includes(this.state.shipName.toUpperCase()) &&
                      this.state.shipName !== "" &&
                      !this.state.shipObject
                    );
                  })
                  .map((vessel) => {
                    return (
                      <div
                      className="dropdown-item"
                        onClick={() =>
                          this.setState({
                            shipName: vessel.name,
                            shipId: vessel.uuid,
                            shipObject: vessel,
                          })
                        }
                      >
                        {vessel.name}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="col-sm-6">
              <label htmlFor="inputShipId">Ship Id</label>
              <input
                type="text"
                className="form-control"
                id="inputShipId"
                aria-describedby="shipIdHelp"
                placeholder="Ship Id"
                value={this.state.shipId}
                onChange={(e) => this.setState({ shipId: e.target.value })}
              />
              <small id="shipIdHelp" className="form-text text-muted">
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
                placeholder="Shipment Value"
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

          <div className="form-row">
            <div className="col-sm-6">
              <label htmlFor="inputDeparturePort">Port of departure</label>
              <div style={{ display: "flex" }}>
                <input
                  type="text"
                  className="form-control"
                  id="inputDeparturePort"
                  aria-describedby="departurePortHelp"
                  placeholder="Port of departure"
                  value={this.state.departurePort}
                  onChange={(e) => !this.state.departurePortObject ? this.setState({ departurePort: e.target.value }) : null}
                />
                <button
                  className={`btn ${
                    this.state.departurePortObject
                      ? "btn-primary"
                      : "btn-secondary"
                  }`}
                  disabled={!this.state.departurePortObject}
                  onClick={() =>
                    this.setState({
                      departurePort: "",
                      departurePortObject: undefined,
                    })
                  }
                >
                  x
                </button>
              </div>
              <small id="departurePortHelp" className="form-text text-muted">
                Type the port name and select one port
              </small>
              <div>
                {port_malaga.data
                  .filter((port) => {
                    return (
                      port.port_name.includes(
                        this.state.departurePort.toUpperCase()
                      ) &&
                      this.state.departurePort !== "" &&
                      !this.state.departurePortObject
                    );
                  })
                  .map((port) => {
                    return (
                      <div
                      className="dropdown-item"
                        onClick={() =>
                          this.setState({
                            departurePort: port.port_name,
                            departurePortObject: port,
                          })
                        }
                      >
                        {port.port_name}
                      </div>
                    );
                  })}
              </div>
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
              <div style={{ display: "flex" }}>
                <input
                  type="text"
                  className="form-control"
                  id="inputArrivalPort"
                  aria-describedby="arrivalPortHelp"
                  placeholder="Port of arrival"
                  value={this.state.arrivalPort}
                  onChange={(e) =>
                    !this.state.arrivalPortObject ? this.setState({ arrivalPort: e.target.value }) : null
                  }
                />
                <button
                  className={`btn ${
                    this.state.arrivalPortObject
                      ? "btn-primary"
                      : "btn-secondary"
                  }`}
                  disabled={!this.state.arrivalPortObject}
                  onClick={() =>
                    this.setState({
                      arrivalPort: "",
                      arrivalPortObject: undefined,
                    })
                  }
                >
                  x
                </button>
                </div>
                <small id="departurePortHelp" className="form-text text-muted">
                  Type the port name and select one port
                </small>
                <div>
                  {port_malaga.data
                    .filter((port) => {
                      return (
                        port.port_name.includes(
                          this.state.arrivalPort.toUpperCase()
                        ) &&
                        this.state.arrivalPort !== "" &&
                        !this.state.arrivalPortObject
                      );
                    })
                    .map((port) => {
                      return (
                        <div
                          className="dropdown-item"
                          onClick={() =>
                            this.setState({
                              arrivalPort: port.port_name,
                              arrivalPortObject: port,
                            })
                          }
                        >
                          {port.port_name}
                        </div>
                      );
                    })}
              </div>
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
        </div>

        <div>State</div>
        <div>{process.env.REACT_APP_VESSEL_API_KEY}</div>
        {this.state.departureDate && (
          <div>
            Unix departure date:{" "}
            {(new Date(this.state.departureDate).getTime() / 1000).toString()}
          </div>
        )}
        {this.state.arrivalDate && (
          <div>
            Unix arrival date:{" "}
            {(new Date(this.state.arrivalDate).getTime() / 1000).toString()}
          </div>
        )}
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

        <hr />

        <div className="form-group">
          <button
            type="button"
            className="btn btn-primary"
            onClick={(event) => this._subscribePolicy(event)}
          >
            Subscribe Policy
          </button>
        </div>

        <div>
          <button
            type="button"
            className="btn btn-primary btn-success"
            onClick={() => this._updatePolicyStatus()}
          >
            Update Policy Status
          </button>
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

    insuranceContract = await new ethers.Contract(
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
    const KOVAN_NETWORK_ID = "42";
    if (
      window.ethereum.networkVersion === HARDHAT_NETWORK_ID ||
      window.ethereum.networkVersion === KOVAN_NETWORK_ID
    ) {
      return true;
    }

    this.setState({
      networkError:
        "Please connect Metamask to Localhost:8545 or Kovan network.",
    });

    return false;
  }

  async _subscribePolicy(event) {
    event.preventDefault();

    // TODO Validate the fields here or somewhere else
    if (this.state.shipId == "") {
      console.log("Invalid field(s)");
      return;
    }

    // TODO
    // customer shoudn't be able to change this value
    // hardvalue for a catnat event (occure 1/200) same as SmartContract
    // we may change this soon
    const INSURANCE_NUMBER_DEFAULT = 200;

    let insuredSum = Math.round(
      this.state.shipmentValue / INSURANCE_NUMBER_DEFAULT
    );

    try {
      await insuranceContract.subscribePolicy(
        this.state.shipId,
        this.state.shipmentValue,
        new Date(this.state.departureDate).getTime() / 1000,
        new Date(this.state.arrivalDate).getTime() / 1000,
        this.state.departurePort,
        this.state.arrivalPort,
        { value: insuredSum }
      );

      window.alert("Transaction success!");
    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        console.log("User rejected the transaction.");
        return;
      }
      console.log(error);
    }
  }

  async _updatePolicyStatus() {
    try {
      // This will return a Policy (in array format) if it exists on the blockchain side
      const getPolicy = await insuranceContract.getPolicy();

      // array index based on 'Policy' struct (smart contract code)
      let _policyId = parseInt(getPolicy[0], 16); //hex number
      let _policyStatusRaw = getPolicy[2][7];
      let _policyStatus = "";

      // array index based on 'PolicyStatus' enum (smart contract code)
      switch (_policyStatusRaw) {
        case 0:
          _policyStatus = "CREATED";
          break;
        case 1:
          _policyStatus = "RUNNING";
          break;
        case 2:
          _policyStatus = "COMPLETED";
          break;
        case 3:
          _policyStatus = "CLAIMED";
          break;
        case 4:
          _policyStatus = "PAIDOUT";
          break;
        default:
          _policyStatus = "UNKNOWN";
      }

      if (_policyId == 0) {
        window.alert(
          "You don't have policy registered or it is still being created."
        );
      } else {
        this.setState({ policyId: _policyId, policyStatus: _policyStatus });
      }
    } catch (error) {
      console.log(error);
      return;
    }
  }
}
