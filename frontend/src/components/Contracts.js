import React from "react";
import { NoWalletDetected } from "./NoWalletDetected";
// import contracts from "../assets/contracts.json";
import "./contracts.css";

export class Contracts extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      policies: [],
      contract: props.insuranceContract
    };

    this.state = this.initialState;
  }

  formatDate(dateString) {
    return new Intl.DateTimeFormat({
      month: "2-digit",
      day: "2-digit",
      year: "numeric"
    }).format(new Date(dateString));
  }

  formatVote(number) {
    if (number === -1) {
      return <div className="text-danger">Denied</div>;
    }
    if (number === 1) {
      return <div className="text-success">Accepted</div>;
    }
    return <div>No valid vote</div>;
  }

  async componentDidMount() {
    const policies = await this.state.contract.getAllPolicies();
    this.setState({ policies });
    this._getTotalPremiums();
    this._getTotalCapitalInsured();
  }

  async _getTotalCapitalInsured() {
    try {
      const totalCapitalInsured =
        await this.props.insuranceContract.getTotalCapitalInsured();
      this.setState({ totalCapitalInsured });
    } catch (error) {
      console.log(error);
      return;
    }
  }

  async _getTotalPremiums() {
    try {
      const totalPremiums =
        await this.props.insuranceContract.getTotalPremiums();
      this.setState({ totalPremiums });
    } catch (error) {
      console.log(error);
      return;
    }
  }

  render() {
    if (window.ethereum === undefined || !this.props.selectedAddress) {
      return <NoWalletDetected />;
    }

    return (
      <div>
        <h1>
          <b>Total Value Insured</b>
        </h1>
        <hr />

        <div className="container">
          <div className="row">
            <div className="col text-light bg-dark mb-2 p-3 rounded-sm shadow border border-white">
              Ocean Storm protocol has earned
              <h2>{parseFloat(this.state.totalPremiums) / 1e18} ETH</h2>
              in paid policy premiums
            </div>
          </div>

          <div className="row">
            <div className="col text-light bg-info mb-2 p-3 rounded-sm shadow border border-white">
              Ocean Storm is now insuring
              <h2>{parseFloat(this.state.totalCapitalInsured) / 1e18} ETH</h2>
              in capital value
            </div>
          </div>

          <div className="row">
            <div className="col form-group p-0">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => this._getTotalPremiums()}
              >
                Update
              </button>
            </div>
          </div>
        </div>

        <br />

        <h1>
          <b>Status of our Policies</b>
        </h1>
        <hr />

        <div className="tableWrapper">
          <div className="tableWrapper2">
            <table>
              <thead>
                <tr>
                  <th>Cover Id</th>
                  <th>Ship Id</th>
                  <th>Cover Amount</th>
                  <th>Gust</th>
                  <th>Location</th>
                  <th>Incidents</th>
                </tr>
              </thead>
              <tbody>
                {this.state.policies.map((policy, index) => {
                  return (
                    <tr key={index}>
                      <td>{policy.policyId.toString()}</td>
                      <td>{policy.ship.id}</td>
                      <td>
                        {parseFloat(policy.ship.shipmentValue) / 1e18} ETH
                      </td>
                      <td>{policy.weatherData.gust.toString()}</td>
                      <td>{policy.weatherData.location}</td>
                      <td>{policy.incidents}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}
