import React, { useState, useEffect, useContext } from 'react';
import authStoreContext from './context/authStoreContext.js';
import history from './utils/history.js';
import Button from '@material-ui/core/Button';
import ApiEndpoint from './utils/ApiEndpoint';
import io from 'socket.io-client';

function Lobby(){
  const [ login, setLogin ] = useContext(authStoreContext);
  const [players, setPlayers] = useState([]);
  const [isFirst, setIsFirst] = useState(true);
  const [err, setError] = useState(null);
  const [hasEnded, setHasEnded] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [myId, setMyId] = useState(null);

  const location = history.location.pathname.split('/');
  const gId = parseInt(location[location.length - 1], 10)
  const [gameId, setGameId] = useState(gId);
  let socket;
  const first = null;

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

  const confirmLeave = (e) => {
    console.log('confirmLeave')
    e.preventDefault();
    e.returnValue = ''
  }

  const unload = async (e) => {
    e.preventDefault();
    e.returnValue = '';
    socket.disconnect();
    console.log('unload')
    if(isHost){
      try{
        const endReq = new ApiEndpoint(`http://localhost:3000/api/game/${gameId}/end/${myId}`);
        const endData = await endReq.postReq({hasWon:false});
      }catch(e){
        console.log(e);
      }

    }else{
      try{
        const leaveReq = new ApiEndpoint(`http://localhost:3000/api/game/${gameId}/leave/${myId}`);
        const leaveData = await leaveReq.postReq({})
      }catch(e){
        console.log(e);
      }

    }
  }





  //cdm
  useEffect( async () => {
    socket = io('/game',{transports: ['websocket'], upgrade:false})
    socket.emit('join', {gameId: gameId});

      try{
        const joinReq = new ApiEndpoint(`http://localhost:3000/api/game/${gameId}`);
        const joinData = await joinReq.postReq({name: login.user_name});
        const playersData = await new ApiEndpoint(`http://localhost:3000/api/game/${gameId}/players`).getReq();
        const index = playersData.players.findIndex((player) => player.user_name === login.user_name);
        setPlayers(playersData.players);
        setIsHost(playersData.players[index].is_host);
        setMyId(playersData.players[index].id);
      }catch(e){
        console.log(e)
        setErr(e);
      }

      socket.on('start', (data) => {
        socket.disconnect();
        history.push(`/game/${gameId}`)
      })

      socket.on('playerLeft', async (data) => {
        try{
          const playersData = await new ApiEndpoint(`http://localhost:3000/api/game/${gameId}/players`).getReq();
          setPlayers(playersData.players);
        }catch(e){
          console.log(e);
        }
      })

      socket.on('newPlayer', async (data) => {
        try{
          const playersData = await new ApiEndpoint(`http://localhost:3000/api/game/${gameId}/players`).getReq();
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
      window.addEventListener('unload', unload)
      window.addEventListener('beforeunload', confirmLeave)
    }
    return(() => {
      window.removeEventListener('unload', unload);
      window.removeEventListener('beforeunload', confirmLeave)
    })
  }, [myId])

  useEffect(() => {
    if(hasEnded){
      setTimeout(() => {
        history.push('/gamesList');
      }, 2000)
    }
  }, [hasEnded])

  async function handleClick(){
    const index = players.findIndex((player) => player.user_name === login.user_name)
    if(players[index].is_host){
      try{
        const startReq = new ApiEndpoint(`http://localhost:3000/api/game/${gameId}/start`);
        const startData = await startReq.postReq({name: login.user_name})
        history.push(`/game/${gameId}`)
      }catch(e){
        console.log(e);
      }

    }
  }


  return(
    <div>
      {
        players.map(player =>
          <div>
            {player.user_name}
          </div>
        )
      }

      {
        isHost?
        <Button onClick = {handleClick}> Start Game </Button>
        :<Button disabled> Start Game </Button>
      }

      {
        hasEnded?
          <div style = {endedStyle}>
            Host has ended game
          </div>
          :null
      }

    </div>
  );
}

export default Lobby;
