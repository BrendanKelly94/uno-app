import React, { Fragment, useState, useEffect, useContext } from "react";
import Button from "@material-ui/core/Button";
import history from "./utils/history.js";
import Lobby from "./Lobby.js";

function HostLobby() {
  const location = history.location.pathname.split("/");
  const gameId = parseInt(location[location.length - 1], 10);

  function handleClick() {
    history.push(`/game/${gameId}`);
  }

  return (
    <Fragment>
      <Lobby />
      <Button onClick={handleClick}> Start Game </Button>
    </Fragment>
  );
}

export default HostLobby;
