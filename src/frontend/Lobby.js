import React, { useState, useEffect, useContext } from 'react';
import history from './utils/history.js';

function Lobby(){
  const [ players, setPlayers ] = useState([]);
  const [ isFirst, setIsFirst ] = useState(true);
  const [ err, setErr ] = useState(null);


  useEffect( async () = {
    const gameId = parseInt(history.location.pathname.pop(), 10)
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

      }
      setIsFirst(false);
    }
  })

  return(

  );
}

export default Lobby;
