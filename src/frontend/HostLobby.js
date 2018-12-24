import React, { useState, useEffect, useContext } from 'react';
import Button from '@material-ui/core/Button';
import history from './utils/history.js';
import authStoreContext from './context/authStoreContext.js';

function HostLobby(){
  const [ players, setPlayers ] = useState([]);
  const [ isFirst, setIsFirst ] = useState(true);
  const [ err, setErr ] = useState(null);
  const [ login, setLogin ] = useContext(authStoreContext);

  useEffect( async () => {
    if(isFirst){
      const location = history.location.pathname.split('/');
      const gameId = parseInt(location[location.length - 1], 10)
      try{
        const joinRes = await fetch(`http://localhost:3000/api/game/${gameId}` , {
            method: "POST",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: login.user_name})
        });
        const playersRes = await fetch(`http://localhost:3000/api/game/${gameId}/players`);
        const playersJson = await playersRes.json();
        setIsFirst(false);
        setPlayers(playersJson.players);
      }catch(e){
        setIsFirst(false);
        setErr(e);
      }
    }
  })

  return(
    <div>
      {
        players.map(player =>
          <div>
            {player.user_name}
          </div>
        )
      }
      <Button> Start Game </Button>
    </div>
  );
}

export default HostLobby;
