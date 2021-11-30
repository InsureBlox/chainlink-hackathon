import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
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
      method: "vessel_pro",
      params: {
        uuid: vessel_uuid
      }
    })
  })
    .then((res) => res.json())
    .then((response) => {
      /*  await fetch(`/api`, {
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
        .then((responsePort) => {
          return response.data;
        }) */
      return response.data;
    })
    .catch((error) => {
      console.log(error);
      return getShipViaMockData(vessel_uuid);
    });
};

const formatData = (key, value) => {
  if (key === "speed") {
    value = value + " knot";
  }
  if (key === "course" || key === "heading") {
    value = value + " degrees";
  }
  return value;
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

  const { mapsIsLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_MAPS_API_KEY
  });

  const [map, setMap] = React.useState(null);

  const onLoad = React.useCallback(function callback(map) {
    /* const bounds = new window.google.maps.LatLngBounds();
    map.fitBounds(bounds); */
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
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
                    <td>{formatData(key, ship[key])}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pt-3">
        <GoogleMap
          mapContainerStyle={{
            width: "100%",
            height: "400px"
          }}
          initialCenter={{ lat: ship.lat, lng: ship.lon }}
          center={{
            lat: ship.lat,
            lng: ship.lon
          }}
          zoom={6}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {/* Child components, such as markers, info windows, etc. */}
          <>
            <Marker
              position={{
                lat: ship.lat,
                lng: ship.lon
              }}
            />
          </>
        </GoogleMap>
      </div>
    </div>
  );
}
