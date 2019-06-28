import React, { useState, useEffect, useContext, useRef } from "react";
import authStoreContext from "./context/authStoreContext.js";
import Chat from "./Chat.js";
import history from "./utils/history.js";
import Button from "./Button";
import TextField from "@material-ui/core/TextField";
import ApiEndpoint from "./utils/ApiEndpoint";
import useScale from "./utils/useScale.js";
import useError from "./utils/useError.js"
import io from "socket.io-client";

let socket = io("/game", { transports: ["websocket"], upgrade: false, autoConnect: false });

function Lobby() {
  const [ login, setLogin ] = useContext(authStoreContext);
  const [ players, setPlayers ] = useState([]);
  const [ isFirst, setIsFirst ] = useState(true);
  const [ hasEnded, setHasEnded ] = useState(false);
  const [ isHost, setIsHost ] = useState(false);
  const [ myId, setMyId ] = useState(null);
  const [ chatToggle, setChatToggle ] = useState(false);
  const [ error, errorHandler ] = useError();
  const scaleFactor = useScale();
  const location = history.location.pathname.split("/");
  const gId = parseInt(location[location.length - 1], 10);
  const [gameId, setGameId] = useState(gId);
  const [socketInit, setSocketInit] = useState(false);

  const lobbyContainer = useRef(null);
  const quitButton = useRef(null);

  const first = null;

  const buttonStyle = {
    position: "absolute",
    top: "1em",
    left: "1em"
  };

  const chatButtonStyle = {
    position: "absolute",
    top: "1em",
    right: "1em",
    zIndex: 11
  };

  const baseContainerStyle = {
    position: "absolute",
    height: "100%",
    width: "100%",
    top: 0,
    left: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#222725",
    color: "#fff"
  };

  const playerListStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  };

  const playerStyle = {
    marginBottom: "1em"
  };

  const endedStyle = {
    display: "flex",
    justifyContent: "center",
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: `translate(-50%, -50%)`,
    width: "50%",
    height: "50%",
    backgroundColor: "transparent",
    color: "#fff",
    fontSize: "2em"
  };

  const headingStyle = {
    textAlign: "center",
    marginBottom: "2em",
    marginTop: "4em",
    fontSize: "2em",
    fontFamily: `Quicksand, sans-serif`
  };

  async function leave(e){
    errorHandler(async () => {
      if (isHost) {
        try {
          const endReq = new ApiEndpoint(`/api/game/${gameId}/end/${myId}`);
          const endData = await endReq.postReq({});
        } catch (e) {
          console.log(e);
        }
      } else {
        try {
          const leaveReq = new ApiEndpoint(`/api/game/${gameId}/leave/${myId}`);
          const leaveData = await leaveReq.postReq({});
        } catch (e) {
          console.log(e);
        }
      }
      socket.close();
    })();
  }

  async function initializeLobby() {
    errorHandler(async () => {
      socket = io("/game", { transports: ["websocket"], upgrade: false})
      socket.emit("join", { gameId: gameId });
      setSocketInit(true);
      const joinReq = new ApiEndpoint(`/api/game/${gameId}`);
      const joinData = await joinReq.postReq({ name: login.user_name });
      const playersData = await new ApiEndpoint(
        `/api/game/${gameId}/players`
      ).getReq();
      const index = playersData.players.findIndex(
        player => player.user_name === login.user_name
      );
      setPlayers(playersData.players);
      setIsHost(playersData.players[index].is_host);
      setMyId(playersData.players[index].id);
    })();
  }

  async function handleClick() {
    const index = players.findIndex(
      player => player.user_name === login.user_name
    );
    if (players[index].is_host) {
      try {
        const startReq = new ApiEndpoint(`/api/game/${gameId}/start`);
        const startData = await startReq.postReq({ name: login.user_name });
        history.push(`/game/${gameId}`);
      } catch (e) {
        console.log(e);
      }
    }
  }

  //cdm
  useEffect(
    () => {

      initializeLobby();

      socket.on("start", data => {
        socket.disconnect();
        history.push(`/game/${gameId}`);
      });

      socket.on("playerLeft", async data => {
        try {
          const playersData = await new ApiEndpoint(
            `/api/game/${gameId}/players`
          ).getReq();
          setPlayers(playersData.players);
        } catch (e) {
          console.log(e);
        }
      });

      socket.on("newPlayer", async data => {
        try {
          const playersData = await new ApiEndpoint(
            `/api/game/${gameId}/players`
          ).getReq();
          setPlayers(playersData.players);
        } catch (e) {
          console.log(e);
        }
      });

      socket.on("end", data => {
        setHasEnded(true);
      });
    },
    [first]
  );

  useEffect(
    () => {
      if (myId !== null) {
        window.addEventListener("beforeunload", leave);
      }
      return () => {
        window.removeEventListener("beforeunload", leave);
      };
    },
    [myId]
  );

  useEffect(
    () => {
      if (hasEnded) {
        lobbyContainer.current.style.filter = "blur(1em)";
        setTimeout(() => {
          history.push("/gamesList");
        }, 2000);
      }
    },
    [hasEnded]
  );

  useEffect(
    () => {
      if (chatToggle) {
        lobbyContainer.current.style.filter = "blur(1em)";
        // quitButton.current.style.filter = 'blur(1em)';
      } else {
        lobbyContainer.current.style.filter = "";
        // quitButton.current.style.filter = '';
      }
    },
    [chatToggle]
  );

  return (
    <React.Fragment>
      <div ref={lobbyContainer} style={baseContainerStyle}>
        <p style={headingStyle}> Lobby </p>

        <div style={playerListStyle}>
          {players.map((player, index) => (
            <div style={playerStyle} key={player.id}>
              {index + 1}: {player.user_name}
            </div>
          ))}

          {isHost ? (
            <Button
              style={{ marginTop: "2em", position: "relative" }}
              onClick={handleClick}
              variant="outlined"
              color="#ffffff"
            >
              {" "}
              Start Game{" "}
            </Button>
          ) : null}
        </div>
      </div>

      <Button
        ref={quitButton}
        variant="outlined"
        style={buttonStyle}
        onClick={leave}
        color="#FF0000"
      >
        {" "}
        QUIT{" "}
      </Button>
      <Button
        style={chatButtonStyle}
        variant="outlined"
        color={chatToggle ? "#FF0000" : "#AAAAAA"}
        onClick={() => setChatToggle(!chatToggle)}
      >
        {" "}
        CHAT{" "}
      </Button>
      <Chat
        chatToggle={chatToggle}
        socket={socket}
        socketInit={socketInit}
        gameId={gameId}
        userName={login.user_name}
        scale={scaleFactor.size}
        setCurrentMessage={() => true}
      />

      {hasEnded && <div style={endedStyle}>Host has ended game</div>}

    </React.Fragment>
  );
}

export default Lobby;
