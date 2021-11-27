import React from "react";
import { NoWalletDetected } from "./NoWalletDetected";
import contracts from "../assets/contracts.json";
import "./contracts.css";

export class Contracts extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {};

    this.state = this.initialState;
  }

  formatDate(dateString) {
    return new Intl.DateTimeFormat({
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  }

  render() {
    if (window.ethereum === undefined || !this.props.selectedAddress) {
      return <NoWalletDetected />;
    }

    return (
      <div className="tableWrapper">
        <div className="tableWrapper2">
          <table>
            <thead>
              <tr>
                <th>Cover Id</th>
                <th>Address</th>
                <th>Sum Assured</th>
                <th>Currency</th>
                <th>Purchase Date</th>
                <th>Expiry</th>
                <th>Claim Id</th>
                <th>Vote</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract, index) => {
                return (
                  <tr key={index}>
                    <td>{contract.coverId.hex}</td>
                    <td>
                      <a
                        target="_blank"
                        href={`https://kovan.etherscan.io/tx/${contract.address}`}
                      >
                        View
                      </a>
                    </td>
                    <td>{contract.sumAssured.hex}</td>
                    <td>{contract.currency}</td>
                    <td>{this.formatDate(contract.purchaseDate)}</td>
                    <td>{this.formatDate(contract.expiry)}</td>
                    <td>{contract.claimId}</td>
                    <td>{contract.vote}</td>
                    <td>{contract.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
