import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import vessels from "../api/vessels.json";
import "./contracts.css";

const getShipViaMockData = (shipId) => {
  const vesselFiltered = vessels.data.vessels.filter(
    (vessel) => vessel.uuid === shipId
  );
  if (vesselFiltered.length === 1) {
    return vesselFiltered[0];
  } else {
    return null;
  }
};

const requestVesselApi = async (vessel_uuid) => {
  return await fetch(`/api`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      method: "vessel",
      params: {
        uuid: vessel_uuid
      }
    })
  })
    .then((res) => res.json())
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
      return getShipViaMockData(vessel_uuid);
    });
};

export function Ship() {
  // eslint-disable-next-line
  const navigate = useNavigate();
  const [ship, setShip] = useState(undefined);

  const shipId = window.location.pathname.replace("/ship/", "");

  useEffect(() => {
    const fetchData = async () => {
      const result = await requestVesselApi(shipId);
      setShip(result);
    };

    fetchData();
  }, []);

  if (!ship)
    return (
      <div>
        {" "}
        <h1>
          <b>Loading...</b>
        </h1>
        <Link to="/contracts">Back</Link>
      </div>
    );

  return (
    <div>
      <h1>
        <b>Ship</b>
      </h1>
      <div className="pb-3">{shipId}</div>
      <div className="pb-3">
        <Link to="/contracts">Back</Link>
      </div>
      <div className="tableWrapper">
        <div className="tableWrapper2">
          <table>
            <tbody>
              {Object.keys(ship).map((key, index) => {
                return (
                  <tr key={index}>
                    <td>{key}</td>
                    <td>{ship[key]}</td>
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
