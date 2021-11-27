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
                <th>Adress</th>
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
                    <td>{contract.address}</td>
                    <td>{contract.sumAssured.hex}</td>
                    <td>{contract.currency}</td>
                    <td>
                      {new Date(contract.purchaseDate).toLocaleDateString({
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </td>
                    <td>
                      {new Date(contract.expiry).toLocaleDateString({
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </td>
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
