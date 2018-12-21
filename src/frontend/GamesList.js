import React, { useState, useEffect } from 'react';

function GamesList(){
  const [ state, setState ] = useState({
    games: [],
    error: false,
    isFirst: true,
  })

  //cdm
  useEffect( async () => {
    if(state.isFirst){
      try{
        const res = await fetch('http://localhost:3000/api/games');
        const json = await res.json();
        setState({...state, games: json.games, isFirst: false});
      }catch(e){
        setState({...state, error: true, isFirst: false});

      }
    }
  })

  const { games, error } = state;
  return(
    <div>
      <h1>Available Games</h1>
    {
      !error && games.map(game =>
        <div> {game} </div>
      )
    }

    {
      error && <div> {error} </div>
    }
    </div>
  );
}

export default GamesList;
