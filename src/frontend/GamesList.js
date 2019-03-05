import React, { useState, useEffect } from 'react';
import history from './utils/history.js';

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

  function handleJoin(e){
    history.push(`lobby/${e.target.id}`);
  }

  async function initializeList(){
    if(state.isFirst){
      try{
        const res = await fetch('http://localhost:3000/api/games');
        const json = await res.json();
        setState({...state, games: json.games, isFirst: false});
      }catch(e){
        setState({...state, error: e, isFirst: false});
      }
    }
  }

  //cdm
  useEffect(() => {
    initializeList();
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
          <button id = {game.id} onClick = {handleJoin}>Join</button>
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
