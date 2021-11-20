import React from "react";

import { ethers } from "ethers";

import DelayInsuranceArtifact from "../contracts/InsuranceContract.json";
import contractAddress from "../contracts/contract-address.json";

import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { TransactionErrorMessage } from "./TransactionErrorMessage";

const HARDHAT_NETWORK_ID = "31337";

//const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      selectedAddress: undefined,
      transactionError: undefined,
      networkError: undefined,
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

        <div class="form-group">
          <label for="inputDeparturePort">Port of departure</label>
          <input
            type="text"
            class="form-control"
            id="inputDeparturePort"
            aria-describedby="departurePortHelp"
            placeholder="Port of departure"
          />
          <small id="departurePortHelp" class="form-text text-muted">
            Help Text
          </small>
        </div>

        <div class="form-group">
          <label for="inputDepartureTime">Expected departure time</label>
          <input
            type="text"
            class="form-control"
            id="inputDepartureTime"
            aria-describedby="departureHelp"
            placeholder="Expected departure time"
          />
          <small id="departureHelp" class="form-text text-muted">
            Help Text
          </small>
        </div>
        <div class="form-group">
          <label for="inputArrivalPort">Port of arrival</label>
          <input
            type="text"
            class="form-control"
            id="inputArrivalPort"
            aria-describedby="arrivalPortHelp"
            placeholder="Port of arrival"
          />
          <small id="arrivalPortHelp" class="form-text text-muted">
            Help Text
          </small>
        </div>

        <div class="form-group">
          <label for="inputExpectedDepartue">Expected arrival time</label>
          <input
            type="text"
            class="form-control"
            id="inputExpectedDepartue"
            aria-describedby="arrivalHelp"
            placeholder="Expected arrival time"
          />
          <small id="arrivalHelp" class="form-text text-muted">
            Help Text
          </small>
        </div>

        <div class="form-group">
          <label for="inputSumInsured">Sum insured</label>
          <input
            type="text"
            class="form-control"
            id="inputSumInsured"
            aria-describedby="sumInsuredHelp"
            placeholder="Expected arrival time"
          />
          <small id="sumInsuredHelp" class="form-text text-muted">
            Help Text
          </small>
        </div>

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
}
