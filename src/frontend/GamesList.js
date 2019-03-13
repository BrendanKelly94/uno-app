import React, { useState, useEffect } from 'react';
import history from './utils/history.js';
import ApiEndpoint from './utils/ApiEndpoint.js'

function GamesList(){
  const [ state, setState ] = useState({
    games: [],
    error: null,
    isFirst: true,
  })

  const h1Style = {
    position: 'absolute',
    left: '50%',
    top: '10%',
    transform: 'translate(-50%, 0)'
  }

  const buttonStyle = {
    position: 'absolute',
    left: '1em',
    top: '1em'
  }

  const gameListingStyle = {
    display: 'flex',
    height: '20%',
    justifyContent: 'space-between',
    alignItems: 'center',
  }

  const listContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    width: '60%',
    height: '50%',
    left: '50%',
    top: '40%',
    transform: 'translate(-50%,-40%)',
    overflowY: 'scroll'
  }

  function navigateBack(){
    history.push('/')
  }

  function handleJoin(e){
    history.push(`lobby/${e.target.id}`);
  }

  async function initializeList(){
    if(state.isFirst){
      try{
        const gamesData = await new ApiEndpoint('/api/games').getReq();
        setState({...state, games: gamesData.games, isFirst: false});
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
      <button style = {buttonStyle} onClick = {navigateBack}> Back </button>
      <h1 style = {h1Style}>Available Games</h1>
      <div style = {listContainerStyle}>
        <div style = {gameListingStyle}>
          <h4>id</h4>
          <h4>Bots</h4>
          <h4>#players</h4>
          <h4></h4>
        </div>
        {
        !error && games.map(game =>
          <div style = {gameListingStyle}>
            <div>{game.id}</div>
            <div>{game.bot_fill?'Yes':'No'}</div>
            <div>{game.player_count}/6</div>
            <button id = {game.id} onClick = {handleJoin}>Join</button>
          </div>
        )
        }
      </div>

    {
      error && <div> {error} </div>
    }

    </div>
  );
}

export default GamesList;
