import React, { useState, useEffect, useContext } from 'react';
import history from './utils/history.js';

function Lobby(){
  const [ players, setPlayers ] = useState([]);
  const [ isFirst, setIsFirst ] = useState(true);
  const [ err, setErr ] = useState(null);


  useEffect( async () => {
    const location = history.location.pathname.split('/');
    const gameId = parseInt(location[location.length - 1], 10)
    if(isFirst){
      try{
        const res = await fetch(process.env.URL + `/api/game/${gameId}/players`);
        const json = await res.json();
        const res1 = await fetch(process.env.URL + `/api/game/${gameId}` ,  {
            method: "POST",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({botFill: fillBots})
        });
        setPlayers(json.players);
      }catch(e){
        setErr(e);
      }
      setIsFirst(false);
    }
  })

  return(
    <div>
      {
        players.map(player => {
          <div>
            {player.user_name}
          </div>
        })
      }
    </div>
  );
}

export default Lobby;
