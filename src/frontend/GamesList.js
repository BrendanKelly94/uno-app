import React, { useState, useEffect } from "react";
import history from "./utils/history.js";
import ApiEndpoint from "./utils/ApiEndpoint.js";
import Button from "./Button";

function GamesList() {
  const [state, setState] = useState({
    games: [],
    error: null,
    isFirst: true
  });

  const headingStyle = {
    textAlign: "center",
    marginBottom: "2em",
    marginTop: "2em",
    fontSize: "2em",
    fontFamily: `Quicksand, sans-serif`
  };

  const buttonStyle = {
    position: "absolute",
    left: "1em",
    top: "1em",
    zIndex: 1
  };

  const baseContainerStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    left: "50%",
    transform: "translate(-50%,0)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#222725",
    color: "#fff"
  };

  const gameListingStyle = {
    display: "flex",
    height: "20%",
    justifyContent: "space-between",
    alignItems: "center"
  };

  const listContainerStyle = {
    display: "flex",
    flexDirection: "column",
    width: "60%",
    height: "50%",
    overflowY: "scroll"
  };

  function navigateBack() {
    history.push("/");
  }

  function handleJoin(id) {
    history.push(`lobby/${id}`);
  }

  async function initializeList() {
    if (state.isFirst) {
      try {
        const gamesData = await new ApiEndpoint("/api/games").getReq();
        setState({ ...state, games: gamesData.games, isFirst: false });
      } catch (e) {
        setState({ ...state, error: e, isFirst: false });
      }
    }
  }

  //cdm
  useEffect(() => {
    initializeList();
  });

  const { games, error } = state;
  return (
    <React.Fragment>
      <Button
        style={buttonStyle}
        onClick={navigateBack}
        variant="outlined"
        color="#FF0000"
      >
        {" "}
        BACK{" "}
      </Button>
      <div style={baseContainerStyle}>
        <p style={headingStyle}>Available Games</p>
        <div style={listContainerStyle}>
          <div style={gameListingStyle}>
            <h4>id</h4>
            <h4>Bots</h4>
            <h4>#players</h4>
            <h4 />
          </div>
          {games.map(game => (
            <div style={gameListingStyle}>
              <div>{game.id}</div>
              <div>{game.bot_fill ? "Yes" : "No"}</div>
              <div>{game.player_count}/6</div>
              <Button
                onClick={() => handleJoin(game.id)}
                variant="default"
                color="#C9DBBA"
              >
                Join
              </Button>
            </div>
          ))}
        </div>
      </div>
      {error && <div> {error} </div>}
    </React.Fragment>
  );
}

export default GamesList;
