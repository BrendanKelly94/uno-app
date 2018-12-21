import React, { useState, useContext } from 'react';
import AuthModal from './modals/AuthModal';
import CreateModal from './modals/CreateModal';
import authStoreContext from './context/authStoreContext';
import history from './utils/history.js';


function Home(){
  const [auth, setAuth] = useState(false);
  const [create, setCreate] = useState(false);
  const [context, setContext] = useContext(authStoreContext);

  const handleJoin = () => {
    if(context.user_name){
      history.push('/gamesList')
    }else{
      setAuth(!auth);
    }
  }

  const handleCreate = () => {
    if(context.user_name){
      setCreate(!create);
    }else{
      setAuth(!auth);
    }
  }

  const login = (uName, pwd) => {
    setContext({user_name: uName, pwd: pwd});
  }

  return(
    <div>
      <button id = 'join-button' onClick = {handleJoin}>Join Game</button>
      <button id = 'create-button' onClick = {handleCreate}>Create Game</button>
      <AuthModal open = {auth} setOpen = {() => setAuth(!auth)} login = {login}/>
      <CreateModal open = {create} setOpen = {() => setCreate(!create)}/>
    </div>
  )
}

export default Home;
