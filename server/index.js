const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");

const isDev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 8080;

require("dotenv").config();

const app = express();
let cors = require("cors");
app.use(cors());
app.use(bodyParser.json());

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, "../frontend/build")));

// Answer API requests.
app.post("/api", function (req, res) {
  res.set("Content-Type", "application/json");
  let params;
  if (req.body.method === "vessel_inradius") {
    params = `&lat=${req.body.params.lat}&lon=${req.body.params.lon}&radius=${req.body.params.radius}`;
  }
  if (req.body.method === "vessel") {
    params = `&uuid=${req.body.params.uuid}`;
  }
  if (req.body.method === "vessel_pro") {
    params = `&uuid=${req.body.params.uuid}`;
  }
  if (req.body.method === "port_find") {
    params = `&name=${req.body.params.name}`;
  }
  let url = `https://api.datalastic.com/api/v0/${req.body.method}?api-key=${process.env.REACT_APP_VESSEL_API_KEY}${params}`;
  axios
    .get(url)
    .then(function (response) {
      res.send(response.data);
    })
    .catch(function (error) {
      res.send('{"error2":"Api request failed!"}').statusCode(500);
    });
});

// All remaining requests return the React app, so it can handle routing.
app.get("*", function (request, response) {
  response.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
});

app.listen(PORT, function () {
  console.error(
    `Node ${
      isDev ? "dev server" : "cluster worker " + process.pid
    }: listening on port ${PORT}`
  );
});
