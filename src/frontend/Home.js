import React, { useState, useContext } from 'react';
import AuthModal from './modals/AuthModal';
import CreateModal from './modals/CreateModal';
import authStoreContext from './context/authStoreContext';
import history from './utils/history.js';

function Home(){
  const [auth, setAuth] = useState(false);
  const [create, setCreate] = useState(false);
  const [context, setContext] = useContext(authStoreContext);


  const navbarStyle = {
    display: 'flex',
    height: '1.5em',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center'
  }

  const containerStyle = {
    position: 'absolute',
    left: '50%',
    transform: 'translate(-50%, 0)',
    display: 'flex',
    height: '80%',
    justifyContent: 'center',
    flexDirection: 'column'
  }

  const buttonStyle = {
    marginTop: '100%'
  }

  const handleJoin = () => {
    if(context.user_name){
      history.push('/gamesList')
    }else{
      setAuth(!auth);
    }
  }

  const handleCreate = () => {
    const newGameData = await new ApiEndpoint('/api/newGame').postReq({botFill: fillBots})
    if(newGameData.hasOwnProperty(err)){
      // setError(newGameData.err)
      console.log(err)
    }else{
      history.push(`lobby/${newGameData.id}`);
    }
  }

  const login = (uName, pwd) => {
    setContext({user_name: uName, pwd: pwd});
  }

  return(
    <React.Fragment>
      <div style = {navbarStyle}>
        {
          context.user_name?
          context.user_name
          :<button onClick = {() => setAuth(!auth)}>login</button>
        }
      </div>

      <div style = {containerStyle}>
        <button id = 'join-button' style = {buttonStyle} onClick = {handleJoin}>Join Game</button>
        <button id = 'create-button' style = {buttonStyle} onClick = {handleCreate}>Create Game</button>
        <AuthModal open = {auth} setOpen = {() => setAuth(!auth)} login = {login}/>
        <CreateModal open = {create} setOpen = {() => setCreate(!create)}/>
      </div>
    </React.Fragment>
  )
}

export default Home;
