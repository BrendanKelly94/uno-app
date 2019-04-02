import React, { useState, useEffect, useContext, useRef } from 'react';
import authStoreContext from './context/authStoreContext.js';
import Chat from './Chat.js'
import history from './utils/history.js';
import Button from '@material-ui/core/Button';
import OutlinedButton from './OutlinedButton.js';
import TextField from '@material-ui/core/TextField';
import ApiEndpoint from './utils/ApiEndpoint';
import io from 'socket.io-client';

function Lobby(){
  const [ login, setLogin ] = useContext(authStoreContext);
  const [ players, setPlayers ] = useState([]);
  const [ isFirst, setIsFirst ] = useState(true);
  const [ error, setError ] = useState(null);
  const [ hasEnded, setHasEnded ] = useState(false);
  const [ isHost, setIsHost ] = useState(false);
  const [ myId, setMyId ] = useState(null);
  const [ socket, setSocket ] = useState(io('/game',{transports: ['websocket'], upgrade:false}));
  const [ chatToggle, setChatToggle ] = useState(false);

  const location = history.location.pathname.split('/');
  const gId = parseInt(location[location.length - 1], 10)
  const [ gameId, setGameId ] = useState(gId);

  const lobbyContainer = useRef(null);
  const quitButton = useRef(null);

  const first = null;

  const buttonStyle = {
    position: 'absolute',
    top: '1em',
    left: '1em'
  }

  const chatButtonStyle = {
    position: 'absolute',
    top: '1em',
    right: '1em',
    zIndex: 11
  }

  const baseContainerStyle = {
    position: 'absolute',
    height: '100%',
    width: '100%',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }

  const playerListStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }

  const playerStyle = {
    marginBottom: '1em'
  }

  const endedStyle = {
    display: 'flex',
    justifyContent: 'center',
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: `translate(-50%, -50%)`,
    width: '50%',
    height: '50%',
    backgroundColor: 'transparent',
    color: '#000',
    fontSize: '2em'
  }

  const headingStyle = {
    textAlign: 'center',
    marginBottom: '2em',
    marginTop: '2em',
    fontSize: '2em',
    fontFamily: `Quicksand, sans-serif`
  }



  const leave = async (e) => {

    if(isHost){

      try{
        const endReq = new ApiEndpoint(`/api/game/${gameId}/end/${myId}`);
        const endData = await endReq.postReq({});
      }catch(e){
        console.log(e);
      }

    }else{
      try{
        const leaveReq = new ApiEndpoint(`/api/game/${gameId}/leave/${myId}`);
        const leaveData = await leaveReq.postReq({})
      }catch(e){
        console.log(e);
      }

    }
  }


  async function initializeLobby(){
    socket.emit('join', {gameId: gameId});

      try{
        const joinReq = new ApiEndpoint(`/api/game/${gameId}`);
        const joinData = await joinReq.postReq({name: login.user_name});
        const playersData = await new ApiEndpoint(`/api/game/${gameId}/players`).getReq();
        const index = playersData.players.findIndex((player) => player.user_name === login.user_name);
        setPlayers(playersData.players);
        setIsHost(playersData.players[index].is_host);
        setMyId(playersData.players[index].id);
      }catch(e){
        console.log(e)
        setErr(e);
      }
  }

  async function handleClick(){
    const index = players.findIndex((player) => player.user_name === login.user_name)
    if(players[index].is_host){
      try{
        const startReq = new ApiEndpoint(`/api/game/${gameId}/start`);
        const startData = await startReq.postReq({name: login.user_name})
        history.push(`/game/${gameId}`)
      }catch(e){
        console.log(e);
      }

    }
  }



  //cdm
  useEffect(() => {
      initializeLobby();

      socket.on('start', (data) => {
        socket.disconnect();
        history.push(`/game/${gameId}`)
      })

      socket.on('playerLeft', async (data) => {
        try{
          const playersData = await new ApiEndpoint(`/api/game/${gameId}/players`).getReq();
          setPlayers(playersData.players);
        }catch(e){
          console.log(e);
        }
      })

      socket.on('newPlayer', async (data) => {
        try{
          const playersData = await new ApiEndpoint(`/api/game/${gameId}/players`).getReq();
          setPlayers(playersData.players);
        }catch(e){
          console.log(e);
        }

      })

      socket.on('end', (data) => {
        setHasEnded(true);
      });


  }, [first])

  useEffect( () => {
    if(myId !== null){
      window.addEventListener('beforeunload', leave)
    }
    return(() => {
      window.removeEventListener('beforeunload', leave)
    })
  }, [myId])

  useEffect(() => {
    if(hasEnded){
      lobbyContainer.current.style.filter = 'blur(1em)';
      setTimeout(() => {
        history.push('/gamesList');
      }, 2000)
    }
  }, [hasEnded])

  useEffect(() => {
    if(error !== null){
      setTimeout(() => {
        history.push('/gamesList')
      }, 2000)
    }
  }, [error])

  useEffect(() => {
    if(chatToggle){
      lobbyContainer.current.style.filter = 'blur(1em)';
      // quitButton.current.style.filter = 'blur(1em)';
    }else{
      lobbyContainer.current.style.filter = '';
      // quitButton.current.style.filter = '';
    }
  }, [chatToggle])



  return(
    <React.Fragment>
      <div ref = {lobbyContainer} style = {baseContainerStyle}>
        <p style = {headingStyle}> Lobby </p>

        <div style = {playerListStyle}>
        {
          players.map((player, index) =>
            <div style = {playerStyle} key = {player.id}>
              {index + 1}: {player.user_name}
            </div>
          )
        }

        {
          isHost?
          <Button style = {{marginTop: '2em'}} onClick = {handleClick} variant = "outlined" color = "inherit"> Start Game </Button>
          :<Button disabled variant = "outlined" color = "disabled"> Start Game </Button>
        }
        </div>
      </div>

      <Button ref = {quitButton} style = {buttonStyle} onClick = {leave} variant = "outlined" color = "secondary"> Quit </Button>
      <Button style = {chatButtonStyle} variant = 'outlined' color = {chatToggle? 'secondary': 'inherit'} onClick = {() => setChatToggle(!chatToggle)}> Chat </Button>
      <Chat chatToggle = {chatToggle} socket = {socket} gameId = {gameId} userName = {login.user_name}/>

      {
        hasEnded &&
          <div style = {endedStyle}>
            Host has ended game
          </div>
      }

      {
        error &&
          <div style = {endedStyle}>
            {error}
          </div>
      }
    </React.Fragment>
  );
}

export default Lobby;
