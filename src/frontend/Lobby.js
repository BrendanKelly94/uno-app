import React, { useState, useEffect, useContext } from 'react';
import authStoreContext from './context/authStoreContext.js';
import history from './utils/history.js';
import Button from '@material-ui/core/Button';
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

  const location = history.location.pathname.split('/');
  const gId = parseInt(location[location.length - 1], 10)
  const [ gameId, setGameId ] = useState(gId);
  let socket;
  const first = null;

  const buttonStyle = {
    positon: 'absolute',
    top: '1em',
    left: '1em'
  }

  const baseContainerStyle = {
    position: 'absolute',
    height: '100%',
    left: '50%',
    transform: 'translate(-50%,0)',
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
    backgroundColor: '#fff',
    color: '#000',
    fontSize: '2em'
  }

  const h1Style = {
    textAlign: 'center',
    marginTop: '2em',
    marginBottom: '2em'
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
    socket = io('/game',{transports: ['websocket'], upgrade:false})
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


  return(
    <React.Fragment>
      <Button style = {buttonStyle} onClick = {leave} variant = "outlined" color = "secondary"> Quit </Button>
      <div style = {baseContainerStyle}>
        <h1 style = {h1Style}> Lobby </h1>
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
