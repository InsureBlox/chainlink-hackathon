import React from "react";
import { NoWalletDetected } from "./NoWalletDetected";
import claims from "../assets/claims.json";

export class Contracts extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {};

    this.state = this.initialState;
  }

  render() {
    if (window.ethereum === undefined || !this.props.selectedAddress) {
      // ToDo: Navigate to /home
      return <NoWalletDetected />;
    }

    return <div>Contracts...</div>;
  }
}
