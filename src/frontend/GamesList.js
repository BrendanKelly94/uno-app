import React, { useState, useEffect } from 'react';

function GamesList(){
  const [ state, setState ] = useState({
    games: [],
    error: null,
    isFirst: true,
  })

  const gameListingStyle = {
    display: 'flex',
    height: '20%',
    width: '60%',
    justifyContent: 'space-between',
    alignItems: 'center'
  }

  //cdm
  useEffect( async () => {
    if(state.isFirst){
      try{
        const res = await fetch('http://localhost:3000/api/games');
        const json = await res.json();
        setState({...state, games: json.games, isFirst: false});
      }catch(e){
        setState({...state, error: e, isFirst: false});
      }
    }
  })

  const { games, error } = state;
  return(
    <div>
      <h1>Available Games</h1>
    {
      !error && games.map(game =>
        <div style = {gameListingStyle}>
          <div>Game {game.id}</div>
          <div>{game.bot_fill?'Yes':'No'}</div>
          <div>{game.player_count}/6</div>
          <button>Join</button>
        </div>
      )
    }

    {
      error && <div> {error} </div>
    }

    </div>
  );
}

export default GamesList;
