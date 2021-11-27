import React from "react";
import background from "../assets/sea.jpg";
import { Link } from "react-router-dom";

export class Navigation extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {};

    this.state = this.initialState;
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-expand navbar-dark bg-dark">
          <div className="container">
            <a className="navbar-brand col-sm" href="#">
              <b>⛈️ Ocean Storm</b> <h6 display="inline">by InsureBlox</h6>
            </a>

            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav mr-auto">
                <li className="nav-item active">
                  <Link to="/" className="nav-link">
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/contracts" className="nav-link">
                    Contracts
                  </Link>
                </li>
                {/*  <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdown"
                    role="button"
                    data-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Dropdown
                  </a>
                  <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                    <a className="dropdown-item" href="#">
                      Action
                    </a>
                    <a className="dropdown-item" href="#">
                      Another action
                    </a>
                    <div className="dropdown-divider"></div>
                    <a className="dropdown-item" href="#">
                      Something else here
                    </a>
                  </div>
                </li>
                <li className="nav-item">
                  <a className="nav-link disabled">Disabled</a>
                </li> */}
              </ul>
              <form className="form-inline my-2 my-lg-0 d-none d-md-block">
                <input
                  className="form-control mr-sm-2"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                />
                <button
                  className="btn btn-outline-success my-2 my-sm-0"
                  type="submit"
                >
                  Search
                </button>
              </form>
            </div>

            {/* </div> */}
          </div>
        </nav>

        <div
          className="jumbotron"
          style={{ padding: "0", height: "6em", overflow: "hidden" }}
        >
          <img
            className="img-fluid"
            src={background}
            alt=""
            style={{ width: "100%" }}
          />
        </div>
      </div>
    );
  }
}
