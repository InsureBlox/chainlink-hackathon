import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
  Circle
} from "@react-google-maps/api";
import vessels from "../api/vessels.json";
import "./contracts.css";
import { destVincenty } from "../misc/calculation";

const options2 = {
  strokeColor: "#FF0000",
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: "#FF0000",
  fillOpacity: 0.35,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
  radius: 30000,
  zIndex: 1
};

const options = {
  strokeColor: "#FF0000",
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: "#FF0000",
  fillOpacity: 0.35,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
  radius: 30000,
  zIndex: 1
};

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

const requestPortApi = async (port_name) => {
  return await fetch(`/api`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      method: "port_find",
      params: {
        name: port_name
      }
    })
  })
    .then((res) => res.json())
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
      return [];
    });
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
    .then(async (response) => {
      let port_departure;
      if (response.data.dep_port) {
        port_departure = await requestPortApi(response.data.dep_port);
        if (port_departure.length > 1) {
          port_departure = port_departure[0];
        }
      }
      let port_destination;
      if (response.data.dest_port) {
        port_destination = await requestPortApi(response.data.dest_port);
        if (port_destination.length > 1) {
          port_destination = port_destination[0];
        }
      }
      let result = response.data;
      if (port_departure) {
        result = {
          ...result,
          dep_port_uuid: port_departure.uuid,
          dep_port_lat: port_departure.lat,
          dep_port_lon: port_departure.lon
        };
      }
      if (port_destination) {
        result = {
          ...result,
          dest_port_uuid: port_destination.uuid,
          dest_port_lat: port_destination.lat,
          dest_port_lon: port_destination.lon
        };
      }
      return result;
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

  const shipCourse =
    ship && ship.course && ship.lat && ship.lon
      ? destVincenty(ship.lat, ship.lon, ship.course, 400000)
      : undefined;

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
            {/* <Circle
              center={{
                lat: ship.lat,
                lng: ship.lon
              }}
              options={options}
            /> */}
            <Marker
              position={{
                lat: ship.lat,
                lng: ship.lon
              }}
              title={`Ship: ${ship.name}`}
            />
            <Polyline
              path={[
                { lat: shipCourse.lat, lng: shipCourse.lon },
                { lat: ship.lat, lng: ship.lon }
              ]}
              options={options}
            />
            {ship.dep_port_lat && ship.dep_port_lon && (
              <Marker
                position={{
                  lat: ship.dep_port_lat,
                  lng: ship.dep_port_lon
                }}
                title={`Departure: ${ship.dep_port}`}
              />
            )}
            {ship.dest_port_lat && ship.dest_port_lon && (
              <Marker
                position={{
                  lat: ship.dest_port_lat,
                  lng: ship.dest_port_lon
                }}
                title={`Destination: ${ship.dest_port}`}
              />
            )}
          </>
        </GoogleMap>
      </div>
    </div>
  );
}
