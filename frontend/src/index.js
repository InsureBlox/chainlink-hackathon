import React from "react";
import ReactDOM from "react-dom";
import { Dapp } from "./components/Dapp";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./index.css";

// We import bootstrap here, but you can remove if you want
import "bootstrap/dist/css/bootstrap.css";
import { Navigation } from "./components/Navigation";

// This is the entry point of your application, but it just renders the Dapp
// react component. All of the logic is contained in it.

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Navigation />
      <div className="container p-4">
        <Routes>
          <Route path="/" element={<Dapp />} />
          <Route path="/contracts" element={<div>abc</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
