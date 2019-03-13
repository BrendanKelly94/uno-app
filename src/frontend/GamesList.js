import React, { useState, useEffect } from 'react';
import history from './utils/history.js';
import ApiEndpoint from './utils/ApiEndpoint.js'
import Button from '@material-ui/core/Button';


function GamesList(){
  const [ state, setState ] = useState({
    games: [],
    error: null,
    isFirst: true,
  })

  const h1Style = {
    textAlign: 'center',
    marginBottom: '2em',
    marginTop: '2em'
  }

  const buttonStyle = {
    position: 'absolute',
    left: '1em',
    top: '1em',
    zIndex: 1
  }

  const baseContainerStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    left: '50%',
    transform: 'translate(-50%,0)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
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
    width: '60%',
    height: '50%',
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
    <React.Fragment>
      <Button style = {buttonStyle} onClick = {navigateBack} variant = "outlined" color = "secondary"> Back </Button>
      <div style = {baseContainerStyle}>
        <h1 style = {h1Style}>Available Games</h1>
        <div style = {listContainerStyle}>
          <div style = {gameListingStyle}>
            <h4>id</h4>
            <h4>Bots</h4>
            <h4>#players</h4>
            <h4></h4>
          </div>
          {
          games.map(game =>
            <div style = {gameListingStyle}>
              <div>{game.id}</div>
              <div>{game.bot_fill?'Yes':'No'}</div>
              <div>{game.player_count}/6</div>
              <Button id = {game.id} onClick = {handleJoin} variant = "contained" color = "primary">Join</Button>
            </div>
          )
          }
        </div>
      </div>
      {
        error && <div> {error} </div>
      }
    </React.Fragment>
  );
}

export default GamesList;
