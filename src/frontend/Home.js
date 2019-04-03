import React, { useState, useContext } from 'react';
import AuthModal from './modals/AuthModal';
import CreateModal from './modals/CreateModal';
import authStoreContext from './context/authStoreContext';
import Button from '@material-ui/core/Button';
import history from './utils/history.js';
import ApiEndpoint from './utils/ApiEndpoint.js';

function Home(){
  const [ auth, setAuth ] = useState(false);
  const [ create, setCreate ] = useState(false);
  const [ context, setContext ] = useContext(authStoreContext);

  const headingStyle = {
    textAlign: 'center',
    marginBottom: '2em',
    marginTop: '2em',
    fontSize: '4em',
    fontFamily: `Quicksand, sans-serif`
  }

  const navbarStyle = {
    display: 'flex',
    height: '1.5em',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center'
  }

  const baseContainerStyle = {
    position: 'absolute',
    height: '80%',
    left: '50%',
    transform: 'translate(-50%,0)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }

  const buttonContainerStyle = {
    display: 'flex',
    height: '60%',
    flexDirection: 'column',
    justifyContent: 'space-evenly'
  }

  const handleJoin = () => {
    if(context.user_name){
      history.push('/gamesList')
    }else{
      setAuth(!auth);
    }
  }

  const handleCreate = async () => {
    if(!context.user_name){
      setAuth(!auth);
    }else{
      const newGameData = await new ApiEndpoint('/api/newGame').postReq({botFill: true, userName: context.user_name})
      if(newGameData.hasOwnProperty('err')){
        // setError(newGameData.err)
        console.log('err')
      }else{
        history.push(`lobby/${newGameData.id}`);
      }
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
          <p style = {{fontFamily: 'Heebo sans-serif'}}>{context.user_name}</p>
          :<Button color = "primary" onClick = {() => setAuth(!auth)}>login</Button>
        }
      </div>
      <div style = {baseContainerStyle}>
        <p style = {headingStyle}>UNO</p>
        <div style = {buttonContainerStyle}>
          <Button id = 'join-button' variant = "contained" color = "primary" onClick = {handleJoin}>Join Game</Button>
          <Button id = 'create-button' variant = "contained" color = "primary" onClick = {handleCreate}>Create Game</Button>
          <AuthModal open = {auth} setOpen = {() => setAuth(!auth)} login = {login}/>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Home;
