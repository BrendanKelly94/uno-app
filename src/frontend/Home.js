import React, { useState, useContext } from "react";
import AuthModal from "./modals/AuthModal";
import CreateModal from "./modals/CreateModal";
import authStoreContext from "./context/authStoreContext";
import Button from "./Button";
import history from "./utils/history.js";
import ApiEndpoint from "./utils/ApiEndpoint.js";

function Home() {
  const [auth, setAuth] = useState(false);
  const [create, setCreate] = useState(false);
  const [context, setContext] = useContext(authStoreContext);

  const colorEnum = {
    red: "#FF4747",
    yellow: "#FFFF87",
    green: "#ACDB85",
    blue: "#84BAB7"
  };

  const headingStyle = {
    textAlign: "center",
    fontSize: "4em",
    fontFamily: `Quicksand, sans-serif`,
    color: "#fff"
  };

  const navbarStyle = {
    display: "flex",
    height: "1.5em",
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center"
  };

  const homeContainerStyle = {
    position: "absolute",
    height: "100%",
    top: 0,
    left: "50%",
    transform: "translate(-50%,0)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "transparent"
  };

  const baseContainerStyle = {
    position: "absolute",
    left: "0",
    top: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "#222725"
  };

  const buttonContainerStyle = {
    display: "flex",
    height: "60%",
    flexDirection: "column",
    justifyContent: "space-evenly"
  };

  const svgContainerStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "5em"
  };

  const handleJoin = () => {
    if (context.user_name) {
      history.push("/gamesList");
    } else {
      setAuth(!auth);
    }
  };

  const handleCreate = async () => {
    if (!context.user_name) {
      setAuth(!auth);
    } else {
      setCreate(!create);
    }
  };

  const login = (uName, pwd) => {
    setContext({ user_name: uName, pwd: pwd });
  };

  return (
    <React.Fragment>
      <div style={baseContainerStyle}>
        <div style={navbarStyle}>
          {context.user_name ? (
            <p
              style={{
                fontFamily: "Quicksand, sans-serif",
                color: "#fff",
                marginRight: ".2em"
              }}
            >
              {context.user_name}
            </p>
          ) : (
            <Button color="#AAAAAA" onClick={() => setAuth(!auth)}>
              login
            </Button>
          )}
        </div>
        <div style={homeContainerStyle}>
          <p style={headingStyle}>UNO</p>

          <div style={svgContainerStyle}>
            <svg height="1em" width="1em">
              {" "}
              <circle r=".5em" cx={"50%"} cy={"50%"} fill={colorEnum["red"]} />
            </svg>
            <svg height="1em" width="1em">
              <circle
                r=".5em"
                cx={"50%"}
                cy={"50%"}
                fill={colorEnum["yellow"]}
              />
            </svg>
            <svg height="1em" width="1em">
              <circle r=".5em" cx={"50%"} cy={"50%"} fill={colorEnum["blue"]} />
              >
            </svg>
            <svg height="1em" width="1em">
              <circle
                r=".5em"
                cx={"50%"}
                cy={"50%"}
                fill={colorEnum["green"]}
              />
            </svg>
          </div>

          <div style={buttonContainerStyle}>
            <Button
              id="join-button"
              variant="default"
              color="#C9DBBA"
              onClick={handleJoin}
            >
              JOIN GAME
            </Button>
            <Button
              id="create-button"
              variant="default"
              color="#C9DBBA"
              onClick={handleCreate}
            >
              CREATE GAME
            </Button>
            <AuthModal
              open={auth}
              setOpen={() => setAuth(!auth)}
              login={login}
            />
            <CreateModal
              open={create}
              setOpen={() => {
                setCreate(!create);
              }}
              userName={context.user_name}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Home;
